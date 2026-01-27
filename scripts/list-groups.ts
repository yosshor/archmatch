#!/usr/bin/env npx tsx
/**
 * CLI Script: List all groups
 * Usage: npm run list
 */

import { loadData, getGroupedIds } from './shared';

function listGroups(): void {
  const data = loadData();

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`  ${data.classInfo.courseName} - Project Groups`);
  console.log(`  Teacher: ${data.classInfo.teacher}`);
  console.log(`${'═'.repeat(50)}\n`);

  const totalStudents = data.students.length;
  const groupedIds = getGroupedIds(data);

  console.log(`  Students: ${totalStudents}`);
  console.log(`  In groups: ${groupedIds.size}`);
  console.log(`  Ungrouped: ${totalStudents - groupedIds.size}`);
  console.log(`${'─'.repeat(50)}\n`);

  // Pre-formed groups
  if (data.existingGroups.length > 0) {
    console.log('  PRE-FORMED GROUPS:');
    console.log('  ' + '─'.repeat(30));
    data.existingGroups.forEach((group, idx) => {
      const members = group.members
        .map(id => data.students.find(s => s.id === id))
        .filter(Boolean);
      console.log(`\n  Group ${idx + 1}:`);
      members.forEach(m => console.log(`    • ${m!.name} (${m!.phone})`));
    });
    console.log('');
  }

  // Auto-matched groups
  if (data.generatedGroups.length > 0) {
    console.log('  AUTO-MATCHED GROUPS:');
    console.log('  ' + '─'.repeat(30));
    data.generatedGroups.forEach((group, idx) => {
      const members = group.members
        .map(id => data.students.find(s => s.id === id))
        .filter(Boolean);
      console.log(`\n  Group ${data.existingGroups.length + idx + 1}:`);
      members.forEach(m => console.log(`    • ${m!.name} (${m!.phone})`));
    });
    console.log('');
  }

  if (data.existingGroups.length === 0 && data.generatedGroups.length === 0) {
    console.log('  No groups created yet.\n');
  }

  // Ungrouped students
  const ungrouped = data.students.filter(s => !groupedIds.has(s.id));
  if (ungrouped.length > 0) {
    console.log('  UNGROUPED STUDENTS:');
    console.log('  ' + '─'.repeat(30));
    ungrouped.forEach(s => console.log(`    • ${s.name}`));
    console.log('');
  }

  console.log(`${'═'.repeat(50)}\n`);
}

listGroups();
