import assert from "node:assert/strict";
import fs from "node:fs";
import { isBuiltin } from "node:module";
import path from "node:path";
import ts from "typescript";

const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));
const declared = new Set([
  ...Object.keys(manifest.dependencies ?? {}),
  ...Object.keys(manifest.devDependencies ?? {}),
]);
// Next.js handles these marker imports internally; its docs make npm installation optional.
const frameworkMarkers = new Set(["server-only", "client-only"]);
const missing = new Set();

function check(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", "dist"].includes(entry.name)) check(file);
      continue;
    }
    if (!entry.isFile() || !/\.[cm]?[jt]sx?$/.test(file)) continue;
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    function visit(node) {
      let specifier;
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) specifier = node.moduleSpecifier;
      if (ts.isCallExpression(node) && (
        node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === "require")
      )) specifier = node.arguments[0];
      if (specifier && ts.isStringLiteralLike(specifier)) {
        const value = specifier.text;
        if (!value.startsWith(".") && !value.startsWith("/") && !value.startsWith("@/") && !isBuiltin(value)) {
          const name = value.split("/").slice(0, value.startsWith("@") ? 2 : 1).join("/");
          if (!declared.has(name) && !frameworkMarkers.has(name)) missing.add(`${file}: ${name}`);
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}

// Nested tools have their own manifests; these are the root project's sources.
for (const directory of ["app", "components", "lib", "scripts", "tests", "remotion"]) check(directory);
assert.equal(missing.size, 0, `Declare directly imported packages in package.json:\n${[...missing].sort().join("\n")}`);
console.log("Direct dependency declarations passed.");
