import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const mdText = value => String(value).replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|').replace(/[\[\]<>]/g, c => `\\${c}`);

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required.`);
  return value;
}

function https(value) {
  if (new URL(value).protocol !== 'https:') throw new Error('Browser links must use HTTPS.');
  return value;
}

function load(file) {
  const records = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (records.schemaVersion !== 1 || !Array.isArray(records.repositories) || !records.workflows?.length) throw new Error('Use schemaVersion 1 with repositories and workflows.');
  const repositories = new Map();
  for (const repository of records.repositories) {
    required(repository.id, 'Repository ID');
    if (repositories.has(repository.id)) throw new Error(`Duplicate repository: ${repository.id}`);
    const directory = path.resolve(path.dirname(file), required(repository.root, 'Repository root'));
    const available = fs.existsSync(directory);
    repositories.set(repository.id, {...repository, directory: available ? fs.realpathSync(directory) : directory, available});
    if (repository.browserBase) https(repository.browserBase);
  }
  const workflowIds = new Set();
  for (const workflow of records.workflows) {
    required(workflow.id, 'Workflow ID');
    if (workflowIds.has(workflow.id)) throw new Error(`Duplicate workflow: ${workflow.id}`);
    workflowIds.add(workflow.id);
    for (const key of ['name', 'client', 'summary']) required(workflow[key], key);
    if (!workflow.components?.length) throw new Error(`${workflow.id} needs components.`);
    const ids = new Set();
    for (const component of workflow.components) {
      for (const key of ['id', 'name', 'purpose']) required(component[key], key);
      if (!/^[a-z][a-z0-9-]*$/.test(component.id) || ids.has(component.id)) throw new Error('Component IDs must be unique lowercase slugs.');
      ids.add(component.id);
      if (!['documented', 'checked', 'awaiting-review', 'approved', 'blocked'].includes(component.evidence?.state)) throw new Error(`${component.id} needs an evidence state.`);
      required(component.evidence.note, 'Evidence note');
      for (const group of ['sources', 'checks', 'examples']) {
        if (!Array.isArray(component[group])) throw new Error(`${component.id} needs ${group}. Use an empty list for missing links.`);
        for (const link of component[group]) {
          required(link.label, 'Link label');
          if (link.url) https(link.url);
          else {
            const repository = repositories.get(link.repository);
            if (!repository) throw new Error(`Unknown repository: ${link.repository}`);
            const candidate = path.resolve(repository.directory, required(link.path, 'Source path'));
            const target = repository.available ? fs.realpathSync(candidate) : candidate;
            const relative = path.relative(repository.directory, target);
            if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('Source path leaves its declared repository.');
          }
        }
      }
    }
  }
  return {records, repositories, digest: createHash('sha256').update(JSON.stringify(records)).digest('hex')};
}

function targetFor(link, repositories, markdownPath) {
  if (link.url) return link.url;
  const repository = repositories.get(link.repository);
  if (markdownPath) return path.relative(fs.realpathSync(path.dirname(markdownPath)), path.resolve(repository.directory, link.path)).split(path.sep).join('/');
  if (!repository.browserBase || link.localOnly) return null;
  return `${repository.browserBase.replace(/\/$/, '')}/${link.path.split('/').map(encodeURIComponent).join('/')}`;
}

function markdown(data, output) {
  const links = values => values.length ? values.map(link => `[${mdText(link.label)}](<${targetFor(link, data.repositories, output)}>)`).join('<br>') : 'Not linked';
  const lines = [`# ${mdText(data.records.name || 'Video Workflow Pipeline')}`, '', data.records.scope, '', 'Generated from the shared JSON records. Edit the records, then regenerate both views.', '', `Record SHA-256: \`${data.digest}\``, ''];
  lines.push(...data.records.workflows.map(w => `- [${mdText(w.name)}](#${w.id})`), '');
  for (const workflow of data.records.workflows) {
    lines.push(`## ${mdText(workflow.name)}`, '', `${mdText(workflow.client)} · ${mdText(workflow.summary)}`, '', '| Component | What it does | Source | Checks | Example | Evidence |', '| --- | --- | --- | --- | --- | --- |');
    for (const c of workflow.components) lines.push(`| ${mdText(c.name)} | ${mdText(c.purpose)} | ${links(c.sources)} | ${links(c.checks)} | ${links(c.examples)} | ${mdText(c.evidence.state)} — ${mdText(c.evidence.note)} |`);
    lines.push('');
  }
  lines.push('## How to read evidence', '', 'Documented means the source was found. Checked needs a linked test result for its stated revision. Approved needs a linked human decision. A linked example alone proves neither.', '', 'See [the harness guide](harness/workflow-ledger.md) for record ownership and update steps.', '');
  return lines.join('\n');
}

function html(data) {
  const links = values => values.length ? values.map(link => {
    const target = targetFor(link, data.repositories);
    return target ? `<a href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>` : `<span class="local">${escapeHtml(link.label)} · local only</span>`;
  }).join('') : '<span class="muted">Not linked</span>';
  const sections = data.records.workflows.map(workflow => `<section aria-labelledby="${escapeHtml(workflow.id)}"><header class="workflow"><div><p class="eyebrow">${escapeHtml(workflow.client)}</p><h2 id="${escapeHtml(workflow.id)}">${escapeHtml(workflow.name)}</h2><p>${escapeHtml(workflow.summary)}</p></div><span class="count">${workflow.components.length} components</span></header><div class="table-wrap"><table><caption class="sr-only">${escapeHtml(workflow.name)} workflow components</caption><thead><tr><th scope="col">Component</th><th scope="col">What it does</th><th scope="col">Source</th><th scope="col">Checks</th><th scope="col">Example</th><th scope="col">Evidence</th></tr></thead><tbody>${workflow.components.map(c => `<tr id="${escapeHtml(workflow.id)}-${escapeHtml(c.id)}"><th scope="row"><a class="component" href="#${escapeHtml(workflow.id)}-${escapeHtml(c.id)}">${escapeHtml(c.name)}</a></th><td>${escapeHtml(c.purpose)}</td><td class="links">${links(c.sources)}</td><td class="links">${links(c.checks)}</td><td class="links">${links(c.examples)}</td><td><span class="badge">${escapeHtml(c.evidence.state)}</span><p class="note">${escapeHtml(c.evidence.note)}</p></td></tr>`).join('')}</tbody></table></div></section>`).join('');
  const navigation = `<nav aria-label="Workflows">${data.records.workflows.map(w => `<a href="#${escapeHtml(w.id)}">${escapeHtml(w.name)}</a>`).join(' · ')}</nav>`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escapeHtml(data.records.name || 'Video Workflow Pipeline')} · Singleton Systems</title><style>
:root{color-scheme:light;--ink:#202a28;--muted:#58665f;--paper:#f6f7f2;--line:#d9dfd5;--accent:#245c45}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 system-ui,-apple-system,sans-serif}main{max-width:1500px;margin:auto;padding:44px 32px 64px}a{color:var(--accent);text-underline-offset:4px}a:focus-visible{outline:3px solid #b17d17;outline-offset:4px}.brand{font-size:13px;font-weight:750;letter-spacing:.1em;text-transform:uppercase;margin-bottom:44px}.intro{max-width:820px}h1{font-size:clamp(36px,5vw,60px);line-height:1.08;letter-spacing:-.045em;margin:0 0 20px}.lead{font-size:20px;color:var(--muted);margin:0 0 24px}.scope{background:#e9eee5;border-left:3px solid var(--accent);padding:14px 18px;font-size:15px}.workflow{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:32px 0 20px}.eyebrow{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 3px}h2{font-size:28px;margin:0 0 6px}.workflow p:last-child{margin:0;color:var(--muted)}.count{white-space:nowrap;font-size:13px;color:var(--muted)}.table-wrap{border:1px solid var(--line);border-radius:12px;background:white;overflow:auto}table{width:100%;border-collapse:collapse;min-width:1060px;table-layout:fixed}thead{background:#eef1e9}th,td{text-align:left;vertical-align:top;padding:20px 16px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}thead th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;font-weight:700;color:var(--muted)}th:nth-child(1){width:16%}th:nth-child(2){width:25%}th:nth-child(3),th:nth-child(4),th:nth-child(5){width:13%}th:nth-child(6){width:20%}tbody th{font-weight:650}tr:last-child>*{border-bottom:0}.component{color:var(--ink);text-decoration:none}.component:hover{text-decoration:underline}.links a,.links .local{display:block;font-size:14px;margin-bottom:9px}.local,.muted{color:var(--muted);font-size:13px}.badge{display:inline-block;background:#edf1e6;border:1px solid #d7dfc9;color:#425c30;font-size:12px;border-radius:20px;padding:3px 9px}.note{font-size:13px;color:var(--muted);margin:9px 0 0}.evidence{max-width:800px;margin-top:32px}.evidence h2{font-size:20px}.evidence p{color:var(--muted)}footer{margin-top:36px;font-size:12px;color:var(--muted);overflow-wrap:anywhere}.sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.mobile-hint{display:none}@media(max-width:700px){main{padding:24px 18px}.brand{margin-bottom:30px}.lead{font-size:18px}.workflow{align-items:flex-start}.count{display:none}.mobile-hint{display:block;font-size:13px;color:var(--muted)}.table-wrap{border-radius:8px}th,td{padding:16px 12px}}@media print{main{padding:0;max-width:none}.table-wrap{overflow:visible;border:0}table{min-width:0;font-size:10px}th,td{padding:8px}.brand{margin-bottom:20px}h1{font-size:30px}.workflow{padding-top:20px}.lead{font-size:14px}.mobile-hint{display:none}a{text-decoration:none}}
</style></head><body><main><div class="brand">Singleton Systems / Operations</div><div class="intro"><h1>${escapeHtml(data.records.name || 'Video Workflow Pipeline')}</h1><p class="lead">The working parts behind each repeatable workflow.<br>Plain explanations, source links and real examples.</p><p class="scope">${escapeHtml(data.records.scope)}</p></div>${navigation}${sections}<p class="mobile-hint">Swipe the table to read sources, checks and examples.</p><aside class="evidence"><h2>Read the evidence, then judge the result.</h2><p>Documented means the source was found. Checked needs a test result for its stated revision. Approved needs a human decision. An example alone proves neither.</p><p>Code links open the published source revision. Local edits can differ. Component checks are linked here; this page does not run them.</p></aside><footer>Both views use the same record set.<br>Record SHA-256: ${data.digest}</footer></main></body></html>\n`;
}

try {
  const [command, ...args] = process.argv.slice(2);
  if (!['generate', 'check'].includes(command)) throw new Error('Use generate or check with --records FILE. Generate also accepts --markdown FILE and --site DIRECTORY.');
  const options = {records: path.join(project, 'config/workflow-ledger.json'), markdown: path.join(project, 'docs/workflow-ledger.md'), site: path.join(project, 'sites/workflow-ledger/dist')};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    if (!['records', 'markdown', 'site'].includes(key) || !args[i + 1] || !args[i].startsWith('--')) throw new Error('Unknown or incomplete option.');
    options[key] = path.resolve(args[i + 1]);
  }
  const data = load(options.records);
  const sitePage = path.join(options.site, 'index.html');
  if (command === 'generate') {
    fs.mkdirSync(path.dirname(options.markdown), {recursive: true});
    const md = markdown(data, options.markdown);
    const page = html(data);
    fs.mkdirSync(options.site, {recursive: true});
    fs.writeFileSync(options.markdown, md);
    fs.writeFileSync(sitePage, page);
  } else {
    if (fs.readFileSync(options.markdown, 'utf8') !== markdown(data, options.markdown)) {
      throw new Error('Repository view is stale. Regenerate both views.');
    }
    if ((fs.existsSync(sitePage) || args.includes('--site')) && fs.readFileSync(sitePage, 'utf8') !== html(data)) {
      throw new Error('Hosted view source is stale. Regenerate both views.');
    }
  }
  const unavailableRepositories = [...data.repositories.values()].filter(repo => !repo.available).map(repo => repo.id);
  console.log(JSON.stringify({outcome: 'passed', unavailableRepositories, workflows: data.records.workflows.length, components: data.records.workflows.reduce((n, w) => n + w.components.length, 0), recordsSha256: data.digest}));
} catch (error) {
  console.error(JSON.stringify({outcome: 'failed', error: error.message}));
  process.exitCode = 1;
}
