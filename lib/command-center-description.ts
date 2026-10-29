// Markdown blank paragraphs may be serialized as HTML non-breaking spaces.
// Keep their line breaks while showing ordinary whitespace in the task preview.
export function taskDescription(value: string): string {
  return value.replace(/&nbsp;|&#160;|&#x0*a0;|\u00a0/gi, " ")
    .replace(/^[ \t]+$/gm, "");
}
