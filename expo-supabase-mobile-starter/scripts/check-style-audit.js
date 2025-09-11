#!/usr/bin/env node
/*
  Style Guardrails Audit
  - Disallow inline color literals (hex/rgb/rgba/hsl/hsla) outside lib/theme/tokens.ts
  - Disallow one-off spacing numbers on spacing props (must match spacing tokens)
  - Disallow one-off fontSize numbers (must match typography.fontSize tokens)

  Notes:
  - Only scans TS/TSX/JS/JSX files under expo-supabase-mobile-starter
  - Ignores tokens.ts itself
*/

const { readFileSync, existsSync } = require('fs');
const { join, relative } = require('path');
const glob = require('glob');

const ROOT = process.cwd();
// Resolve tokens path whether running from repo root or from expo-supabase-mobile-starter dir
const CANDIDATE_TOKENS_PATHS = [
  join(ROOT, 'lib', 'theme', 'tokens.ts'),
  join(ROOT, 'expo-supabase-mobile-starter', 'lib', 'theme', 'tokens.ts'),
];
const TOKENS_PATH = CANDIDATE_TOKENS_PATHS.find((p) => existsSync(p));
if (!TOKENS_PATH) {
  throw new Error('Unable to locate lib/theme/tokens.ts');
}

function readTokens() {
  const src = readFileSync(TOKENS_PATH, 'utf8');

  // Extract spacing numbers
  const spacingBlockMatch = src.match(/export const spacing\s*=\s*\{([\s\S]*?)\}\s*as const;/);
  const spacingNumbers = new Set([0]);
  if (spacingBlockMatch) {
    const block = spacingBlockMatch[1];
    const numRegex = /:\s*([0-9]+(?:\.[0-9]+)?)/g;
    let m;
    while ((m = numRegex.exec(block))) {
      const val = Number(m[1]);
      if (!Number.isNaN(val)) spacingNumbers.add(val);
    }
  }

  // Extract typography fontSize numbers
  const typographyBlockMatch = src.match(/export const typography\s*=\s*\{([\s\S]*?)\}\s*as const;/);
  const fontSizeNumbers = new Set();
  if (typographyBlockMatch) {
    const typographyBlock = typographyBlockMatch[1];
    const fontSizeBlockMatch = typographyBlock.match(/fontSize\s*:\s*\{([\s\S]*?)\}/);
    if (fontSizeBlockMatch) {
      const block = fontSizeBlockMatch[1];
      const numRegex = /:\s*([0-9]+(?:\.[0-9]+)?)/g;
      let m;
      while ((m = numRegex.exec(block))) {
        const val = Number(m[1]);
        if (!Number.isNaN(val)) fontSizeNumbers.add(val);
      }
    }
  }

  return { spacingNumbers, fontSizeNumbers };
}

function audit() {
  const { spacingNumbers, fontSizeNumbers } = readTokens();

  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    ignore: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/lib/theme/tokens.ts',
      '**/lib/theme/index.ts',
      '**/lib/theme/_deprecated/**',
    ],
  });

  const issues = [];

  const colorHex = /(^|[^A-Za-z0-9_])#[0-9A-Fa-f]{3,8}\b/;
  const colorFunc = /\b(?:rgb|rgba|hsl|hsla)\s*\(/i;

  // Spacing properties to check
  const spacingProp = /\b(margin(?:Top|Bottom|Left|Right|Vertical|Horizontal)?|padding(?:Top|Bottom|Left|Right|Vertical|Horizontal)?|gap|rowGap|columnGap)\s*:\s*([0-9]+(?:\.[0-9]+)?)/;
  const fontSizeProp = /\bfontSize\s*:\s*([0-9]+(?:\.[0-9]+)?)/;

  for (const file of files) {
    const content = readFileSync(file, 'utf8');

    // Quick color literal scan at file level to avoid false positives inside comments? We'll check line-by-line and skip lines that start with //
    const lines = content.split(/\r?\n/);
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      // Very basic comment / type guard
      if (trimmed.startsWith('//')) return;

      if (colorHex.test(line) || colorFunc.test(line)) {
        // Allow in tokens.ts only (already excluded) and allow in CSS files (not scanned)
        issues.push({
          file,
          line: lineNum,
          type: 'color',
          message: 'Inline color literal detected (hex/rgb/rgba/hsl). Use theme tokens from lib/theme/tokens.ts.'
        });
      }

      const spMatch = line.match(spacingProp);
      if (spMatch) {
        const val = Number(spMatch[2]);
        if (!spacingNumbers.has(val)) {
          issues.push({
            file,
            line: lineNum,
            type: 'spacing',
            message: `${spMatch[1]}: ${val} is not in spacing tokens. Use spacing scale from lib/theme/tokens.ts (or derive from tokens).`
          });
        }
      }

      const fsMatch = line.match(fontSizeProp);
      if (fsMatch) {
        const val = Number(fsMatch[1]);
        if (!fontSizeNumbers.has(val)) {
          issues.push({
            file,
            line: lineNum,
            type: 'fontSize',
            message: `fontSize: ${val} is not in typography.fontSize tokens. Use typography scale from lib/theme/tokens.ts.`
          });
        }
      }
    });
  }

  const relIssues = issues.map((i) => ({
    file: relative(ROOT, i.file).replace(/\\/g, '/'),
    line: i.line,
    type: i.type,
    message: i.message,
    key: `${relative(ROOT, i.file).replace(/\\/g, '/')}:${i.line}:${i.type}`,
  }));

  const baselinePath = join(ROOT, '.github', 'style-audit-baseline.json');
  const writeBaseline = process.argv.includes('--write-baseline');

  if (writeBaseline) {
    const payload = { generatedAt: new Date().toISOString(), issues: relIssues };
    const fs = require('fs');
    const dir = join(ROOT, '.github');
    if (!existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(baselinePath, JSON.stringify(payload, null, 2));
    console.log(`📝 Wrote style audit baseline with ${relIssues.length} issues to ${relative(ROOT, baselinePath).replace(/\\/g, '/')}`);
    process.exit(0);
  }

  let filtered = relIssues;
  try {
    const { issues: baselineIssues } = require(baselinePath);
    const baselineKeys = new Set((baselineIssues || []).map((b) => b.key));
    filtered = relIssues.filter((i) => !baselineKeys.has(i.key));
  } catch (_) {
    // no baseline present; proceed without filtering
  }

  if (filtered.length) {
    console.error('\n❌ Style audit found new issues (not in baseline):');
    for (const i of filtered) {
      console.error(`- ${i.file}:${i.line} [${i.type}] ${i.message}`);
    }
    console.error(`\nGuardrails:\n- No inline hex/rgb/rgba/hsl colors in code (use tokens)\n- Spacing must use values defined in spacing tokens\n- Font sizes must use values defined in typography.fontSize tokens\n`);
    process.exit(1);
  } else {
    console.log('✅ Style audit passed: No new inline colors or one-off spacing/typography found.');
  }
}

try {
  audit();
} catch (e) {
  console.error('Style audit failed to run:', e);
  process.exit(1);
}
