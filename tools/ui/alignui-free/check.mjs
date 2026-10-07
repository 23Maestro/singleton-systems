import { readFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const ts = require('typescript');
const data = JSON.parse(await readFile(resolve(root, 'inventory.json'), 'utf8'));
const errors = [];
if (!data.freeOnly || data.license !== 'MIT') errors.push('Free/MIT gate failed');
const license = await readFile(resolve(root, 'upstream/LICENSE'), 'utf8');
if (!license.includes('MIT License') || !license.includes('Permission is hereby granted')) errors.push('Missing MIT terms');
for (const file of data.files) {
  const source = await readFile(resolve(root, file.path), 'utf8');
  if (createHash('sha256').update(source).digest('hex') !== file.sha256) errors.push(`Changed snapshot: ${file.path}`);
  if (/pro\.alignui\.com|figma\.alignui\.com/.test(file.source)) errors.push(`Paid source: ${file.path}`);
  if (!/\.(tsx|ts)$/.test(file.path)) continue;
  const ast = ts.createSourceFile(file.path, source, ts.ScriptTarget.Latest, true, file.path.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  for (const d of ast.parseDiagnostics) errors.push(`${file.path}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`);
  for (const node of ast.statements) {
    if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue;
    const path = node.moduleSpecifier.text;
    if (!path.startsWith('@/')) continue;
    const target = resolve(root, 'upstream', path.slice(2));
    let found = false;
    for (const suffix of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
      try { await access(target + suffix); found = true; break; } catch { /* try next */ }
    }
    if (!found) errors.push(`Missing local import: ${file.path} -> ${path}`);
  }
}
const ui = data.files.filter(x => x.path.startsWith('upstream/components/ui/'));
if (ui.length < 40) errors.push(`Expected 40+ UI source files, got ${ui.length}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`PASS: ${ui.length} UI source files, MIT notice, free-only URLs, SHA-256 integrity, TypeScript syntax and local imports.`);
console.log('Scope: source-library checks. No browser rendering or consuming-app typecheck claimed.');
