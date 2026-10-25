import fs from "node:fs";
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
  console.log(JSON.stringify(await taskCloseout(command, options)));
} catch (error) {
  console.log(JSON.stringify({ outcome: "pending", error: error.message }));
  process.exitCode = 1;
}
