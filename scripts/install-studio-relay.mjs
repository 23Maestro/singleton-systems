import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

if (process.platform !== "darwin") throw new Error("Install the Studio relay on its bound Mac host.");
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const config = join(homedir(), ".config/singleton-systems/studio.env");
if (!existsSync(config)) throw new Error("Configure Studio producer access first.");
const label = "com.singleton-systems.studio-relay";
const directory = join(homedir(), "Library/LaunchAgents");
const target = join(directory, label + ".plist");
const script = join(root, "scripts/studio-send-to-chat.mjs");
const programArguments = [process.execPath, "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", "--env-file=" + config, script, "--pending"];
if (existsSync(target)) {
  const prior = JSON.parse(execFileSync("/usr/bin/plutil", ["-convert", "json", "-o", "-", target], { encoding: "utf8" }));
  if (prior.Label !== label || prior.ProgramArguments?.[3] !== script) throw new Error("The existing Studio relay has a different owner.");
}
mkdirSync(directory, { recursive: true });
const plist = execFileSync("/usr/bin/plutil", ["-convert", "xml1", "-o", "-", "-"], {
  input: JSON.stringify({
    Label: label, ProgramArguments: programArguments, WorkingDirectory: root,
    RunAtLoad: true, StartInterval: 15, StandardOutPath: "/dev/null", StandardErrorPath: "/dev/null",
  }),
});
writeFileSync(target, plist, { mode: 0o600 });
const domain = "gui/" + process.getuid();
const loaded = spawnSync("/bin/launchctl", ["print", domain + "/" + label], { stdio: "ignore" });
if (loaded.status !== 0) execFileSync("/bin/launchctl", ["bootstrap", domain, target]);
console.log(JSON.stringify({ label, target, source: script, intervalSeconds: 15, installed: true }));
