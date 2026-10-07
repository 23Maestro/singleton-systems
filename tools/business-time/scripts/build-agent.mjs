import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../native-agent", import.meta.url));
const toolchain = execFileSync("xcodebuild", ["-version"], { encoding: "utf8" });
const match = toolchain.match(/Xcode (\d+)\.(\d+)/);
if (!match || Number(match[1]) < 16 || (Number(match[1]) === 16 && Number(match[2]) < 3)) {
  throw new Error("Xcode 16.3 or later must already be installed and selected.");
}
execFileSync("swift", ["build", "--package-path", root], { stdio: "inherit" });
const bin = execFileSync("swift", ["build", "--package-path", root, "--show-bin-path"], { encoding: "utf8" }).trim();
const bundle = join(root, ".build", "Business Time Agent.app");
mkdirSync(join(bundle, "Contents", "MacOS"), { recursive: true });
copyFileSync(join(root, "Info.plist"), join(bundle, "Contents", "Info.plist"));
copyFileSync(join(bin, "BusinessTimeAgent"), join(bundle, "Contents", "MacOS", "BusinessTimeAgent"));
// Local validation only. Permission grants require a stable signing identity
// before collection; never borrow Glaze's identity or alter its managed bundle.
execFileSync("codesign", ["--force", "--sign", "-", "--options", "runtime", bundle], { stdio: "inherit" });
execFileSync("codesign", ["--verify", "--strict", bundle], { stdio: "inherit" });
console.log(bundle);
