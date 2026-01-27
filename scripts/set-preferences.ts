#!/usr/bin/env npx tsx
/**
 * CLI Script: Set student preferences
 * Usage: npm run preferences "StudentName" "Preferred1" "Preferred2" ...
 */

import { loadData, saveData, findStudentByName } from './shared';

function setPreferences(studentName: string, ...preferredNames: string[]): void {
  const data = loadData();

  // Find the student
  const student = findStudentByName(data, studentName);
  if (!student) {
    console.error(`✗ Student not found: ${studentName}`);
    process.exit(1);
  }

  // Find preferred students
  const preferredIds: number[] = [];
  for (const name of preferredNames) {
    const preferred = findStudentByName(data, name);
    if (!preferred) {
      console.error(`✗ Preferred student not found: ${name}`);
      process.exit(1);
    }
    if (preferred.id === student.id) {
      console.warn(`⚠ Cannot prefer self, skipping: ${name}`);
      continue;
    }
    preferredIds.push(preferred.id);
  }

  student.preferences = preferredIds;
  saveData(data);

  console.log(`✓ Set preferences for ${student.name}:`);
  preferredIds.forEach(id => {
    const pref = data.students.find(s => s.id === id);
    console.log(`  → ${pref?.name}`);
  });
}

// CLI execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npm run preferences "StudentName" "Preferred1" "Preferred2" ...');
  console.log('Example: npm run preferences "Shiran" "Aleen" "Moran"');
} else {
  setPreferences(args[0], ...args.slice(1));
}
