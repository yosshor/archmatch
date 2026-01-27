#!/usr/bin/env npx tsx
/**
 * CLI Script: Create a manual group
 * Usage: npm run create-group "Name1" "Name2" ["Name3"]
 */

import { loadData, saveData, findStudentByName, getGroupedIds, generateGroupId } from './shared';

function createGroup(...names: string[]): void {
  const data = loadData();
  const groupedIds = getGroupedIds(data);

  // Find students
  const members = names.map(name => {
    const student = findStudentByName(data, name);
    if (!student) {
      console.error(`✗ Student not found: ${name}`);
      process.exit(1);
    }
    if (groupedIds.has(student.id)) {
      console.error(`✗ ${student.name} is already in a group`);
      process.exit(1);
    }
    return student;
  });

  if (members.length < 2) {
    console.error('✗ Need at least 2 members for a group');
    process.exit(1);
  }

  if (members.length > data.classInfo.groupSize.max) {
    console.error(`✗ Maximum group size is ${data.classInfo.groupSize.max}`);
    process.exit(1);
  }

  // Create group
  data.existingGroups.push({
    id: generateGroupId(),
    members: members.map(m => m.id),
    createdAt: new Date().toISOString(),
    isManual: true,
    projectName: null,
    notes: '',
  });

  saveData(data);

  console.log(`✓ Created group with ${members.length} members:`);
  members.forEach(m => console.log(`  • ${m.name}`));
}

// CLI execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npm run create-group "Name1" "Name2" ["Name3"]');
  console.log('Example: npm run create-group "Shiran" "Aleen" "Alisa"');
} else {
  createGroup(...args);
}
