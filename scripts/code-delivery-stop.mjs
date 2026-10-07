import fs from "node:fs";
import { completionStop } from "../lib/reviews/completion.mjs";

try {
  const result = await completionStop(JSON.parse(fs.readFileSync(0, "utf8")));
  if (result) console.log(JSON.stringify(result));
} catch (error) {
  console.log(JSON.stringify({ continue: false, systemMessage: `Code delivery remains incomplete: ${error.message}` }));
}
