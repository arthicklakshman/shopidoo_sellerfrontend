const fs = require('fs');

const filePath = 'd:/Shop/shopidoo_sellerfrontend/src/pages/Settings/Security.jsx';
const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split(/\r?\n/);

const resolvedLines = [];
let i = 0;
let conflictIndex = 0;

while (i < lines.length) {
  const line = lines[i];
  if (line.startsWith('<<<<<<<')) {
    // Start of conflict block
    const oursBlock = [];
    i++; // Skip <<<<<<< ours/HEAD
    while (i < lines.length && !lines[i].startsWith('=======')) {
      oursBlock.push(lines[i]);
      i++;
    }
    i++; // Skip =======
    const theirsBlock = [];
    while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
      theirsBlock.push(lines[i]);
      i++;
    }
    i++; // Skip >>>>>>> theirs/branch

    // Resolve conflict block
    console.log(`Resolving conflict block ${conflictIndex}...`);
    let resolvedBlock = [];

    if (conflictIndex === 0) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 1) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 2) {
      // Ours, but insert `const navigate = useNavigate();` inside Security()
      const merged = oursBlock.map(l => {
        if (l.includes('export default function Security() {')) {
          return 'export default function Security() {\n  const navigate = useNavigate();';
        }
        return l;
      });
      resolvedBlock = merged;
    } else if (conflictIndex === 3) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 4) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 5) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 6) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 7) {
      resolvedBlock = theirsBlock;
    } else if (conflictIndex === 8) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 9) {
      resolvedBlock = oursBlock;
    } else if (conflictIndex === 10) {
      resolvedBlock = oursBlock;
    }

    resolvedLines.push(...resolvedBlock);
    conflictIndex++;
  } else {
    resolvedLines.push(line);
    i++;
  }
}

fs.writeFileSync(filePath, resolvedLines.join('\n'), 'utf8');
console.log(`Successfully resolved ${conflictIndex} conflicts in Security.jsx!`);
