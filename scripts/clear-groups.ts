#!/usr/bin/env npx tsx
/**
 * CLI Script: Clear groups
 * Usage: npm run clear [all|generated|existing]
 */

import { loadData, saveData } from './shared';

type ClearType = 'all' | 'generated' | 'existing';

function clearGroups(type: ClearType = 'generated'): void {
  const data = loadData();

  let cleared = 0;

  switch (type) {
    case 'all':
      cleared = data.existingGroups.length + data.generatedGroups.length;
      data.existingGroups = [];
      data.generatedGroups = [];
      break;
    case 'existing':
      cleared = data.existingGroups.length;
      data.existingGroups = [];
      break;
    default:
      cleared = data.generatedGroups.length;
      data.generatedGroups = [];
  }

  saveData(data);
  console.log(`✓ Cleared ${cleared} ${type} groups`);
}

// CLI execution
const type = (process.argv[2] || 'generated') as ClearType;
const validTypes: ClearType[] = ['all', 'generated', 'existing'];

if (!validTypes.includes(type)) {
  console.log('Usage: npm run clear [type]');
  console.log(`Types: ${validTypes.join(', ')}`);
  console.log('  - all: Clear all groups');
  console.log('  - generated: Clear only auto-generated groups (default)');
  console.log('  - existing: Clear only pre-formed groups');
} else {
  clearGroups(type);
}
