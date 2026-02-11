import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const tokensPath = path.join(root, 'src/theme/tokens.json');
const globalCssPath = path.join(root, 'global.css');

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

const buildVarLines = (modeTokens) => {
  const lines = [];
  for (const [groupName, scale] of Object.entries(modeTokens)) {
    for (const [token, value] of Object.entries(scale)) {
      lines.push(`    --color-${groupName}-${token}: ${value};`);
    }
  }
  return lines.join('\n');
};

const css = `@tailwind base;
@tailwind components;
@tailwind utilities;

/* AUTO-GENERATED from src/theme/tokens.json. Do not edit color vars directly. */
@layer base {
  :root {
${buildVarLines(tokens.colors.light)}
  }

  .dark {
${buildVarLines(tokens.colors.dark)}
  }
}
`;

fs.writeFileSync(globalCssPath, css, 'utf8');
console.log('Synced theme tokens to global.css');
