#!/usr/bin/env npx tsx
/**
 * CLI Script: Run automatic matching
 * Usage: npm run match [strategy]
 * Strategies: random, preference, skillBalanced, alphabetical
 */

import { loadData, saveData, getGroupedIds, generateGroupId, chunkArray } from './shared';
import type { Student, GroupSize } from '../src/types';

type Strategy = 'random' | 'preference' | 'skillBalanced' | 'alphabetical';

function randomMatching(students: Student[], maxSize: number): Student[][] {
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  return chunkArray(shuffled, maxSize);
}

function preferenceMatching(students: Student[], groupSize: GroupSize): Student[][] {
  const groups: Student[][] = [];
  const ungrouped = new Set(students.map(s => s.id));
  const studentMap = new Map(students.map(s => [s.id, s]));

  // Mutual preferences
  for (const student of students) {
    if (!ungrouped.has(student.id)) continue;
    const mutuals = student.preferences.filter(pid => {
      const pref = studentMap.get(pid);
      return pref && ungrouped.has(pid) && pref.preferences.includes(student.id);
    });

    if (mutuals.length > 0) {
      const group: Student[] = [student];
      ungrouped.delete(student.id);
      for (const mid of mutuals) {
        if (group.length >= groupSize.max) break;
        if (ungrouped.has(mid)) {
          group.push(studentMap.get(mid)!);
          ungrouped.delete(mid);
        }
      }
      groups.push(group);
    }
  }

  // One-way preferences
  for (const studentId of [...ungrouped]) {
    const student = studentMap.get(studentId);
    if (!student || !ungrouped.has(studentId)) continue;
    const oneWay = student.preferences.find(pid => ungrouped.has(pid));
    if (oneWay) {
      const group: Student[] = [student, studentMap.get(oneWay)!];
      ungrouped.delete(studentId);
      ungrouped.delete(oneWay);
      for (const rid of Array.from(ungrouped)) {
        if (group.length >= groupSize.max) break;
        group.push(studentMap.get(rid)!);
        ungrouped.delete(rid);
      }
      groups.push(group);
    }
  }

  // Remaining
  const remaining = [...ungrouped].map(id => studentMap.get(id)!);
  groups.push(...chunkArray(remaining, groupSize.max));

  return groups.filter(g => g.length > 0);
}

function skillBalancedMatching(students: Student[], groupSize: GroupSize): Student[][] {
  const groups: Student[][] = [];
  const ungrouped = [...students].sort((a, b) => b.skills.length - a.skills.length);

  while (ungrouped.length > 0) {
    const group: Student[] = [ungrouped.shift()!];
    const groupSkills = new Set(group[0].skills);

    for (let i = 0; i < groupSize.max - 1 && ungrouped.length > 0; i++) {
      let bestIdx = 0;
      let bestNew = 0;
      for (let j = 0; j < ungrouped.length; j++) {
        const newSkills = ungrouped[j].skills.filter(s => !groupSkills.has(s)).length;
        if (newSkills > bestNew) { bestNew = newSkills; bestIdx = j; }
      }
      const selected = ungrouped.splice(bestIdx, 1)[0];
      group.push(selected);
      selected.skills.forEach(s => groupSkills.add(s));
    }
    groups.push(group);
  }
  return groups;
}

function alphabeticalMatching(students: Student[], maxSize: number): Student[][] {
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));
  return chunkArray(sorted, maxSize);
}

function runMatching(strategy: Strategy = 'preference'): void {
  const data = loadData();
  const groupedIds = getGroupedIds(data);
  const available = data.students.filter(s => !groupedIds.has(s.id));

  if (available.length === 0) {
    console.log('✗ No available students to match');
    return;
  }

  console.log(`\nRunning ${strategy} matching for ${available.length} students...\n`);

  // Clear previous generated groups
  data.generatedGroups = [];

  let groups: Student[][];
  const { groupSize } = data.classInfo;

  switch (strategy) {
    case 'random':
      groups = randomMatching(available, groupSize.max);
      break;
    case 'skillBalanced':
      groups = skillBalancedMatching(available, groupSize);
      break;
    case 'alphabetical':
      groups = alphabeticalMatching(available, groupSize.max);
      break;
    default:
      groups = preferenceMatching(available, groupSize);
  }

  // Create groups in data
  groups.forEach(memberStudents => {
    data.generatedGroups.push({
      id: generateGroupId(),
      members: memberStudents.map(s => s.id),
      createdAt: new Date().toISOString(),
      isManual: false,
      projectName: null,
      notes: '',
    });
  });

  saveData(data);

  // Print results
  console.log(`✓ Created ${groups.length} groups:\n`);
  groups.forEach((group, idx) => {
    console.log(`  Group ${idx + 1}:`);
    group.forEach(s => console.log(`    • ${s.name}`));
    console.log('');
  });
}

// CLI execution
const strategy = (process.argv[2] || 'preference') as Strategy;
const validStrategies: Strategy[] = ['random', 'preference', 'skillBalanced', 'alphabetical'];

if (!validStrategies.includes(strategy)) {
  console.log('Usage: npm run match [strategy]');
  console.log(`Strategies: ${validStrategies.join(', ')}`);
} else {
  runMatching(strategy);
}
