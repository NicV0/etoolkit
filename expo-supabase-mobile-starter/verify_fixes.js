#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 eToolkit Fix Verification Script\n');

let allGood = true;

// Check 1: Header component has default export
console.log('1. Checking Header.tsx default export...');
try {
  const headerContent = fs.readFileSync('components/layout/Header.tsx', 'utf8');
  if (headerContent.includes('export default Header;')) {
    console.log('   ✅ Header.tsx has default export');
  } else {
    console.log('   ❌ Header.tsx missing default export');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ Header.tsx not found');
  allGood = false;
}

// Check 2: Card component has default export
console.log('2. Checking Card.tsx default export...');
try {
  const cardContent = fs.readFileSync('components/ui/Card.tsx', 'utf8');
  if (cardContent.includes('export default function Card') || cardContent.includes('export { Card }')) {
    console.log('   ✅ Card.tsx has proper exports');
  } else {
    console.log('   ❌ Card.tsx missing proper exports');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ Card.tsx not found');
  allGood = false;
}

// Check 3: ClientDetail uses proper imports
console.log('3. Checking ClientDetail imports...');
try {
  const clientDetailContent = fs.readFileSync('app/(tabs)/clients/[id].tsx', 'utf8');
  if (clientDetailContent.includes('import Header from') && 
      clientDetailContent.includes('import Card from') &&
      clientDetailContent.includes('import { useClients }')) {
    console.log('   ✅ ClientDetail uses proper imports');
  } else {
    console.log('   ❌ ClientDetail has import issues');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ ClientDetail.tsx not found');
  allGood = false;
}

// Check 4: Settings store exists
console.log('4. Checking settings store...');
try {
  const simpleStoreContent = fs.readFileSync('lib/state/simpleStore.ts', 'utf8');
  if (simpleStoreContent.includes('useSettingsStore')) {
    console.log('   ✅ Settings store properly integrated');
  } else {
    console.log('   ❌ Settings store missing');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ simpleStore.ts not found');
  allGood = false;
}

// Check 5: Root layout doesn't import deleted store
console.log('5. Checking root layout...');
try {
  const layoutContent = fs.readFileSync('app/_layout.tsx', 'utf8');
  if (!layoutContent.includes('StoreProvider') && !layoutContent.includes('from \'../lib/state/store\'')) {
    console.log('   ✅ Root layout clean (no deleted store imports)');
  } else {
    console.log('   ❌ Root layout has problematic imports');
    allGood = false;
  }
} catch (err) {
  console.log('   ❌ _layout.tsx not found');
  allGood = false;
}

// Check 6: TypeScript compilation
console.log('6. Checking TypeScript compilation...');
const { execSync } = require('child_process');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ TypeScript compilation passes');
} catch (err) {
  console.log('   ❌ TypeScript compilation failed');
  allGood = false;
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 ALL CHECKS PASSED! Your app should be working correctly.');
  console.log('\nNext steps:');
  console.log('1. Run: npm run start');
  console.log('2. Test the ClientDetail screen');
  console.log('3. Verify all functionality works');
} else {
  console.log('⚠️  Some issues detected. Please review the errors above.');
}
console.log('='.repeat(50));

