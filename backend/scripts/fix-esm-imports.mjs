import fs from "fs";
import path from "path";

const distRoot = path.resolve("dist");
const supportedExtensions = new Set([".js", ".mjs", ".cjs", ".json"]);

const walk = (targetDir) => {
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

const resolveReplacement = (filePath, specifier) => {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) {
    return specifier;
  }

  const parsedSpecifier = path.parse(specifier);
  if (supportedExtensions.has(parsedSpecifier.ext)) {
    return specifier;
  }

  const absoluteBase = path.resolve(path.dirname(filePath), specifier);
  const asFile = `${absoluteBase}.js`;
  if (fs.existsSync(asFile)) {
    return `${specifier}.js`;
  }

  const asIndex = path.join(absoluteBase, "index.js");
  if (fs.existsSync(asIndex)) {
    return `${specifier}/index.js`;
  }

  return specifier;
};

const rewriteSpecifiers = (filePath, source) => {
  const replaceRelativeSpecifier = (match, prefix, specifier, suffix) => {
    const rewritten = resolveReplacement(filePath, specifier);
    return `${prefix}${rewritten}${suffix}`;
  };

  return source
    .replace(/(from\s+["'])(\.\.?\/[^"'()]+)(["'])/g, replaceRelativeSpecifier)
    .replace(/(import\s*\(\s*["'])(\.\.?\/[^"'()]+)(["']\s*\))/g, replaceRelativeSpecifier);
};

if (!fs.existsSync(distRoot)) {
  process.exit(0);
}

for (const filePath of walk(distRoot)) {
  const original = fs.readFileSync(filePath, "utf8");
  const rewritten = rewriteSpecifiers(filePath, original);

  if (rewritten !== original) {
    fs.writeFileSync(filePath, rewritten);
  }
}
