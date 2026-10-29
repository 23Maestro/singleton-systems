import fs from "node:fs";
import { reviewTaskPlan, createTaskPlan, taskEntryContext, startTask } from "../lib/task-lifecycle.mjs";
import { taskCloseout } from "../lib/task-closeout.mjs";

try {
  const [command, ...args] = process.argv.slice(2);
  if (command === "--help" || command === "help") {
    console.log("Task lifecycle: plan --file PLAN; create --file PLAN --approved-hash HASH; context --id TASK [--owner linear|asana]; start --id TASK [--owner linear|asana] --session SESSION --turn TURN [--done-when TEXT]; check|finish|defer --id TASK [--owner linear|asana] --session SESSION --turn TURN [--children IDS] [--evidence TEXT] [--reason TEXT]. Plans support Linear Development and the fixed Asana client projects. Parent/tasks accept dueDate: YYYY-MM-DD or null for no deadline; omit only when unknown. Dates use native owner fields. Free-Asana blockers use linked task references within the selected deliverable.");
  } else {
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!args[i].startsWith("--") || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error("Each option needs a value.");
      const key = args[i].slice(2);
      if (!["file", "approved-hash", "id", "owner", "session", "turn", "done-when", "children", "evidence", "summary", "reason"].includes(key) || Object.hasOwn(options, key)) throw new Error("Unknown or repeated option.");
      options[key] = args[i + 1];
    }
    let result;
    const owner = options.owner ?? "linear";
    if (!["linear", "asana"].includes(owner)) throw new Error("Choose Linear or Asana.");
    if (["plan", "create"].includes(command)) {
      if (!options.file) throw new Error("Choose a plan file.");
      const plan = JSON.parse(fs.readFileSync(options.file, "utf8"));
      result = command === "plan" ? reviewTaskPlan(plan) : await createTaskPlan(plan, { approvedHash: options["approved-hash"] });
    } else if (command === "context") result = await taskEntryContext(options.id, { owner });
    else if (command === "start") result = await startTask(options.id, { owner, session: options.session, turn: options.turn, doneWhen: options["done-when"] });
    else if (["check", "finish", "defer"].includes(command)) {
      const context = await taskEntryContext(options.id, { owner });
      result = await taskCloseout(command, { ...options, owner, id: context.task.id });
    } else throw new Error("Use plan, create, context, start, check, finish or defer.");
    console.log(JSON.stringify(result));
    if (result.outcome === "incomplete") process.exitCode = 1;
  }
} catch (error) {
  console.log(JSON.stringify({ outcome: "incomplete", error: error.message }));
  process.exitCode = 1;
}
