// Linear saves CommonMark escapes such as `S\*`, equivalent list markers and angle-wrapped link destinations.
// Keep code blocks literal so code changes cannot pass as formatting changes.
export function normalizeLinearMarkdown(value) {
  let fence = null;
  return (value ?? "").split("\n").map(line => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      return line;
    }
    if (fence) return line;
    return line.replace(/\\([!-/:-@[-`{-~])/g, "$1").replace(/\]\(<(https?:\/\/[^>]+)>\)/g, "]($1)").replace(/^(\s*)\* /, "$1- ");
  }).join("\n").trim();
}
