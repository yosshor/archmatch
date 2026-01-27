/**
 * Matching Strategies Module
 * Pure functions implementing different group matching algorithms
 */

import type { Student, GroupSize } from '@/types';

/**
 * Helper: Chunk array into groups of specified size
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  // Merge small last chunk with previous if needed
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1].push(...last);
  }

  return chunks;
}

/**
 * Random matching - shuffles students and chunks into groups
 */
export function randomMatching(students: Student[], groupSize: number): Student[][] {
  const shuffled = [...students].sort(() => Math.random() - 0.5);
  return chunkArray(shuffled, groupSize);
}

/**
 * Preference-based matching - prioritizes mutual preferences
 */
export function preferenceMatching(
  students: Student[],
  groupSize: GroupSize
): Student[][] {
  const groups: Student[][] = [];
  const ungrouped = new Set(students.map(s => s.id));
  const studentMap = new Map(students.map(s => [s.id, s]));

  // First pass: find mutual preferences
  for (const student of students) {
    if (!ungrouped.has(student.id)) continue;

    const mutualMatches = student.preferences.filter(prefId => {
      const preferred = studentMap.get(prefId);
      return (
        preferred &&
        ungrouped.has(prefId) &&
        preferred.preferences.includes(student.id)
      );
    });

    if (mutualMatches.length > 0) {
      const groupMembers: Student[] = [student];
      ungrouped.delete(student.id);

      for (const matchId of mutualMatches) {
        if (groupMembers.length >= groupSize.max) break;
        if (ungrouped.has(matchId)) {
          groupMembers.push(studentMap.get(matchId)!);
          ungrouped.delete(matchId);
        }
      }

      groups.push(groupMembers);
    }
  }

  // Second pass: handle remaining with one-way preferences
  for (const studentId of [...ungrouped]) {
    const student = studentMap.get(studentId);
    if (!student || !ungrouped.has(studentId)) continue;

    const oneWayMatch = student.preferences.find(prefId => ungrouped.has(prefId));

    if (oneWayMatch) {
      const groupMembers: Student[] = [student, studentMap.get(oneWayMatch)!];
      ungrouped.delete(studentId);
      ungrouped.delete(oneWayMatch);

      // Fill to max size
      for (const remainingId of Array.from(ungrouped)) {
        if (groupMembers.length >= groupSize.max) break;
        groupMembers.push(studentMap.get(remainingId)!);
        ungrouped.delete(remainingId);
      }

      groups.push(groupMembers);
    }
  }

  // Third pass: group remaining students randomly
  const remaining = [...ungrouped].map(id => studentMap.get(id)!);
  const remainingGroups = chunkArray(remaining, groupSize.max);
  groups.push(...remainingGroups);

  return groups.filter(g => g.length > 0);
}

/**
 * Skill-balanced matching - distributes skills evenly across groups
 */
export function skillBalancedMatching(
  students: Student[],
  groupSize: GroupSize
): Student[][] {
  const groups: Student[][] = [];
  const ungrouped = [...students].sort((a, b) => b.skills.length - a.skills.length);

  while (ungrouped.length > 0) {
    const group: Student[] = [];
    const firstStudent = ungrouped.shift()!;
    group.push(firstStudent);
    const groupSkills = new Set(firstStudent.skills);

    // Add students that complement skills
    for (let i = 0; i < groupSize.max - 1 && ungrouped.length > 0; i++) {
      let bestIndex = 0;
      let bestNewSkills = 0;

      for (let j = 0; j < ungrouped.length; j++) {
        const newSkills = ungrouped[j].skills.filter(s => !groupSkills.has(s)).length;
        if (newSkills > bestNewSkills) {
          bestNewSkills = newSkills;
          bestIndex = j;
        }
      }

      const selected = ungrouped.splice(bestIndex, 1)[0];
      group.push(selected);
      selected.skills.forEach(s => groupSkills.add(s));
    }

    groups.push(group);
  }

  return groups;
}

/**
 * Alphabetical matching - groups by name order
 */
export function alphabeticalMatching(students: Student[], groupSize: number): Student[][] {
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));
  return chunkArray(sorted, groupSize);
}

/**
 * Round-robin draft style matching
 */
export function roundRobinMatching(students: Student[], groupSize: number): Student[][] {
  const numGroups = Math.ceil(students.length / groupSize);
  const groups: Student[][] = Array.from({ length: numGroups }, () => []);
  const shuffled = [...students].sort(() => Math.random() - 0.5);

  shuffled.forEach((student, index) => {
    groups[index % numGroups].push(student);
  });

  return groups;
}
