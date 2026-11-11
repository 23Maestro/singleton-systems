import fs from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { taskCloseout, taskCloseoutHook } from "../lib/task-closeout.mjs";

try {
  const [command, ...args] = process.argv.slice(2);
  if (command === "hook") {
    const result = taskCloseoutHook(JSON.parse(fs.readFileSync(0, "utf8")));
    if (result) console.log(JSON.stringify(result));
    process.exit(0);
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--") || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error("Each option needs a value.");
    options[args[i].slice(2)] = args[i + 1];
  }
  const projectId = options["studio-project"];
  if (projectId) {
    const { studioProjectId } = await import("../lib/studio-projects.ts");
    if (!["check", "finish"].includes(command)) throw new Error("Use --studio-project with check or finish.");
    studioProjectId.parse(projectId);
    const config = process.env.STUDIO_CONFIG ?? join(homedir(), ".config/singleton-systems/studio.env");
    if (fs.existsSync(config)) loadEnvFile(config);
  }
  const result = await taskCloseout(command, options);
  if (projectId && result.outcome === "complete") {
    const { closeStudioProject } = await import("../lib/studio-project-closeout.mjs");
    result.studio = await closeStudioProject(result, {
      projectId, owner: options.owner, origin: process.env.STUDIO_ORIGIN, token: process.env.VIDEO_REVIEW_PRODUCER_TOKEN,
    });
  }
  console.log(JSON.stringify(result));
} catch (error) {
  console.log(JSON.stringify({ outcome: "pending", error: error.message }));
  process.exitCode = 1;
}
