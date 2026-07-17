import fs from "node:fs";
import path from "node:path";

const registry = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "config/cerebral-registry.json"), "utf8"),
);
const routes = registry.routes.filter((route) => route.enabled);

if (!process.argv.includes("--html")) {
  console.log(JSON.stringify({ source_revision: registry.source_revision, routes }, null, 2));
  process.exit(0);
}

const routeJson = JSON.stringify(routes).replace(/</g, "\\u003c");
console.log(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cerebral Route Helper</title>
<style>
:root{color-scheme:light dark;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}*{box-sizing:border-box}body{margin:0;padding:18px;background:#171717;color:#f5f5f5}main{max-width:720px;margin:auto}h1{font-size:20px;margin:0 0 4px}p{margin:0 0 16px;color:#aaa}label{display:block;margin:12px 0 6px;font-weight:600}select,textarea,button{font:inherit}select,textarea{width:100%;border:1px solid #444;background:#222;color:#fff;padding:10px;border-radius:6px}textarea{min-height:92px;resize:vertical}.example{padding:10px 12px;background:#222;border-left:3px solid #56b6c2;color:#ddd}.row{display:flex;gap:8px;align-items:center;margin-top:12px}.row label{margin:0;font-weight:400}.row input{width:16px;height:16px}button{border:0;border-radius:6px;padding:9px 12px;background:#eee;color:#111;cursor:pointer}button.secondary{background:#333;color:#fff}#packet{min-height:150px}small{color:#888}
</style>
</head>
<body data-kmwindow="SCREEN(Main,Left,20%),SCREEN(Main,Top,15%),760,720">
<main>
<h1>Cerebral Route Helper</h1>
<p>Choose a tested phrase, add the real request, and paste it into Codex.</p>
<label for="route">Route</label>
<select id="route"></select>
<label>Tested natural phrase</label>
<div class="example" id="example"></div>
<label for="intent">What do you need?</label>
<textarea id="intent" autofocus placeholder="Say it normally."></textarea>
<div class="row"><input id="exact" type="checkbox"><label for="exact">Add exact route tag</label></div>
<label for="packet">Prompt</label>
<textarea id="packet" readonly></textarea>
<div class="row"><button id="copy" type="button">Copy Prompt</button><button class="secondary" id="done" type="button">Done</button><small id="status"></small></div>
</main>
<script>
const routes=${routeJson};
const route=document.querySelector('#route');
const example=document.querySelector('#example');
const intent=document.querySelector('#intent');
const exact=document.querySelector('#exact');
const packet=document.querySelector('#packet');
const status=document.querySelector('#status');
for(const item of routes){const option=document.createElement('option');option.value=item.route_key;option.textContent=item.route_key+' - '+item.lane;route.append(option)}
function selected(){return routes.find(item=>item.route_key===route.value)}
function compose(){const item=selected();example.textContent=item.example_prompt;const parts=[];if(exact.checked){parts.push('[route] '+item.route_key);parts.push('[shape] '+item.shape);parts.push('[tools] '+item.required_tools.join(' + '));if(intent.value.trim())parts.push('[query] '+intent.value.trim())}else{parts.push(item.example_prompt);if(intent.value.trim())parts.push('Intent: '+intent.value.trim())}packet.value=parts.join('\\n')}
async function copy(){compose();try{await navigator.clipboard.writeText(packet.value)}catch{packet.select();document.execCommand('copy')}status.textContent='Copied'}
route.addEventListener('change',compose);intent.addEventListener('input',compose);exact.addEventListener('change',compose);document.querySelector('#copy').addEventListener('click',copy);document.querySelector('#done').addEventListener('click',()=>window.KeyboardMaestro?window.KeyboardMaestro.Submit('Done'):window.close());compose();
</script>
</body>
</html>`);
