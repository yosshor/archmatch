#!/usr/bin/env npx tsx
/**
 * CLI Script: Add a new student
 * Usage: npm run add-student "Name" "[phone]" "[skills]"
 */

import { loadData, saveData } from './shared';

function addStudent(name: string, phone = '', skillsStr = ''): void {
  const data = loadData();

  const newId = Math.max(...data.students.map(s => s.id), 0) + 1;
  const skills = skillsStr
    ? skillsStr.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  data.students.push({
    id: newId,
    name,
    phone,
    skills,
    preferences: [],
    available: true,
  });

  saveData(data);
  console.log(`✓ Added student: ${name} (ID: ${newId})`);
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npm run add-student "Name" "[phone]" "[skills]"');
  console.log('Example: npm run add-student "John Doe" "+972 50-123-4567" "React,Node.js"');
} else {
  addStudent(args[0], args[1], args[2]);
}
