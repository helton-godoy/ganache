const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const srcDir = path.join(__dirname, '../src/components');
const outputDir = path.join(__dirname, '../docs/components');

if (!fs.existsSync(srcDir)) {
    console.error(`❌ Source directory not found at ${srcDir}`);
    process.exit(1);
}

if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
}

walkDir(srcDir, (filePath) => {
    if (!filePath.endsWith('.tsx')) return;

    const content = fs.readFileSync(filePath, 'utf8');

    // Regex to capture JSDoc + Export
    // Matches /** ... */ followed by export ... name
    const regex = /\/\*\*([\s\S]*?)\*\/[\s\n]*export\s+(?:function|const)\s+(\w+)/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const jsDoc = match[1];
        const componentName = match[2];

        const docInfo = parseJSDoc(jsDoc);
        generateMarkdown(componentName, docInfo, outputDir);
        console.log(` Generated docs for ${componentName}`);
    }
});

function parseJSDoc(jsDoc) {
    const lines = jsDoc.split('\n').map(l => l.trim().replace(/^\*\s?/, '').trim()).filter(l => l);

    let description = '';
    const params = [];
    let returns = '';
    let ref = '';

    lines.forEach(line => {
        if (line.startsWith('@param')) {
            params.push(line.replace('@param', '').trim());
        } else if (line.startsWith('@returns')) {
            returns = line.replace('@returns', '').trim();
        } else if (line.startsWith('@description')) {
            description += line.replace('@description', '').trim() + '\n';
        } else if (line.startsWith('@ref')) {
            ref = line.replace('@ref', '').trim();
        } else if (!line.startsWith('@')) {
            // Assume parsing description continuation or simple text
            if (!description && params.length === 0 && !returns) {
                description += line + '\n';
            }
        }
    });

    return { description: description.trim(), params, returns, ref };
}

function generateMarkdown(name, info, outDir) {
    const filename = path.join(outDir, `${name}.md`);

    let md = `# Component: ${name}\n\n`;

    if (info.description) {
        md += `## Description\n${info.description}\n\n`;
    }

    if (info.ref) {
        md += `**Ref**: ${info.ref}\n\n`;
    }

    if (info.params.length > 0) {
        md += `## Props\n`;
        info.params.forEach(p => md += `- \`${p}\`\n`);
        md += `\n`;
    }

    if (info.returns) {
        md += `## Returns\n${info.returns}\n\n`;
    }

    md += `## Usage Example\n`;
    md += `\`\`\`tsx\n`;
    md += `import { ${name} } from '@/components/...';\n\n`;
    md += `<${name} />\n`;
    md += `\`\`\`\n\n`;

    md += `---\n`;

    fs.writeFileSync(filename, md);
}

console.log('✅ React documentation generated.');
