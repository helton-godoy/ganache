const fs = require("fs");
const path = require("path");

const openApiPath = path.join(__dirname, "../docs/openapi.json");
const outputDir = path.join(__dirname, "../docs/api/openapi");

if (!fs.existsSync(openApiPath)) {
  console.error(`❌ OpenAPI file not found at ${openApiPath}`);
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  console.log(`Creating output directory: ${outputDir}`);
  fs.mkdirSync(outputDir, { recursive: true });
}

const spec = JSON.parse(fs.readFileSync(openApiPath, "utf8"));
const tags = {};

// Group operations by tag
Object.entries(spec.paths).forEach(([route, operations]) => {
  Object.entries(operations).forEach(([method, op]) => {
    const tag = op.tags ? op.tags[0] : "Default";
    if (!tags[tag]) tags[tag] = [];
    tags[tag].push({
      route,
      method: method.toUpperCase(),
      summary: op.summary || "No summary",
      description: op.description || "",
      operationId: op.operationId || "unknown",
    });
  });
});

// Generate Markdown for each tag
Object.entries(tags).forEach(([tagName, ops]) => {
  const filename = path.join(
    outputDir,
    `${tagName.toLowerCase().replace(/\s+/g, "-")}.md`,
  );
  let content = `# API Section: ${tagName}\n\n`;

  ops.forEach((op) => {
    content += `## ${op.method} ${op.route}\n\n`;
    content += `**Summary**: ${op.summary}\n\n`;
    if (op.description) {
      content += `${op.description}\n\n`;
    }
    content += `**Operation ID**: \`${op.operationId}\`\n\n`;

    // Example (Template)
    content += `### Example Usage (TypeScript SDK)\n\n`;
    content += `\`\`\`typescript\n`;
    content += `import { use${capitalize(op.operationId)} } from '@/api/generated';\n\n`;
    content += `const { mutate, data } = use${capitalize(op.operationId)}();\n`;
    content += `// Call mutate(...) or use data\n`;
    content += `\`\`\`\n\n`;

    content += `---\n\n`;
  });

  fs.writeFileSync(filename, content);
  console.log(` Generated specific docs for ${tagName}: ${filename}`);
});

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log("✅ OpenAPI documentation generated.");
