import fs from 'fs';
import path from 'path';

// Common patterns to fix
const fixes = [
  // Remove unused variables
  {
    pattern: /const\s+(\w+)\s*=\s*.*?;\s*\/\/\s*TODO.*$/gm,
    replacement: '// TODO: Implement $1'
  },
  // Remove unused imports
  {
    pattern: /import\s+\{[^}]*\b(\w+)\b[^}]*\}\s+from\s+['"][^'"]+['"];?\s*\/\/\s*unused/gm,
    replacement: (match, importName) => match.replace(importName, '').replace(/,\s*,/, ',').replace(/,\s*}/, '}')
  },
  // Fix console statements in production
  {
    pattern: /console\.(log|warn|error)\(/g,
    replacement: (match, method) => {
      return `if (__DEV__) console.${method}(`;
    }
  },
  // Remove unused variable assignments
  {
    pattern: /const\s+(\w+)\s*=\s*.*?;\s*\/\/\s*unused/gm,
    replacement: '// const $1 = ...; // unused'
  }
];

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

// Start processing from current directory
console.log('Starting to fix common issues...');
walkDir('.');
console.log('Finished fixing common issues.');
