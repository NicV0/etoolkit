#!/usr/bin/env node
const { readFileSync } = require('fs');
const { join } = require('path');
const glob = require('glob');

const disallowed = [
  /lib\/theme\/index(\.ts|\.tsx|\.js)?$/,
  /lib\/theme\/_deprecated\//
];

const files = glob.sync('expo-supabase-mobile-starter/**/*.{ts,tsx,js,jsx}', {
  ignore: [
    '**/node_modules/**',
    '**/lib/theme/index.ts',
    '**/lib/theme/_deprecated/**'
  ]
});

let failed = false;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (/from\s+['"][^'"]*lib\/theme\/index['"]/g.test(content) || /require\(['"][^'"]*lib\/theme\/index['"]\)/g.test(content)) {
    console.error(`❌ Disallowed import in ${file}: lib/theme/index`);
    failed = true;
  }
  if (/from\s+['"][^'"]*lib\/theme\/_deprecated\//g.test(content) || /require\(['"][^'"]*lib\/theme\/_deprecated\//g.test(content)) {
    console.error(`❌ Disallowed import in ${file}: lib/theme/_deprecated/*`);
    failed = true;
  }
}

if (failed) {
  console.error('Disallowed imports detected. Use lib/theme/tokens.ts only.');
  process.exit(1);
} else {
  console.log('✅ No disallowed theme imports found.');
}