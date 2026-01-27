/**
 * Matching Engine
 * Orchestrates the matching process and manages results
 */

import type {
  AppData,
  Student,
  Group,
  MatchingStrategy,
  MatchingResult,
  MatchingStats,
  ValidationIssue,
} from '@/types';

import {
  randomMatching,
  preferenceMatching,
  skillBalancedMatching,
  alphabeticalMatching,
  roundRobinMatching,
} from './matching-strategies';

/**
 * Generate a unique group ID
 */
function generateGroupId(): string {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get IDs of all students currently in groups
 */
export function getGroupedStudentIds(data: AppData): Set<number> {
  const ids = new Set<number>();
  [...data.existingGroups, ...data.generatedGroups].forEach(group => {
    group.members.forEach(id => ids.add(id));
  });
  return ids;
}

/**
 * Get available students (not in any group)
 */
export function getAvailableStudents(data: AppData): Student[] {
  const groupedIds = getGroupedStudentIds(data);
  return data.students.filter(s => s.available && !groupedIds.has(s.id));
}

/**
 * Run the matching algorithm with specified strategy
 */
export function generateMatches(
  data: AppData,
  strategy: MatchingStrategy = 'preference'
): MatchingResult {
  const availableStudents = getAvailableStudents(data);

  if (availableStudents.length === 0) {
    return {
      success: false,
      groupsCreated: 0,
      studentsMatched: 0,
      strategy,
      message: 'No available students to match',
    };
  }

  const { groupSize } = data.classInfo;
  let studentGroups: Student[][];

  switch (strategy) {
    case 'random':
      studentGroups = randomMatching(availableStudents, groupSize.max);
      break;
    case 'preference':
      studentGroups = preferenceMatching(availableStudents, groupSize);
      break;
    case 'skillBalanced':
      studentGroups = skillBalancedMatching(availableStudents, groupSize);
      break;
    case 'alphabetical':
      studentGroups = alphabeticalMatching(availableStudents, groupSize.max);
      break;
    case 'roundRobin':
      studentGroups = roundRobinMatching(availableStudents, groupSize.max);
      break;
    default:
      studentGroups = randomMatching(availableStudents, groupSize.max);
  }

  // Clear previous generated groups
  data.generatedGroups = [];

  // Create new groups
  studentGroups.forEach(groupStudents => {
    const group: Group = {
      id: generateGroupId(),
      members: groupStudents.map(s => s.id),
      createdAt: new Date().toISOString(),
      isManual: false,
      projectName: null,
      notes: '',
    };
    data.generatedGroups.push(group);
  });

  return {
    success: true,
    groupsCreated: studentGroups.length,
    studentsMatched: availableStudents.length,
    strategy,
  };
}

/**
 * Create a manual (pre-formed) group
 */
export function createManualGroup(data: AppData, memberIds: number[]): Group {
  const group: Group = {
    id: generateGroupId(),
    members: memberIds,
    createdAt: new Date().toISOString(),
    isManual: true,
    projectName: null,
    notes: '',
  };
  data.existingGroups.push(group);
  return group;
}

/**
 * Dissolve (remove) a group
 */
export function dissolveGroup(data: AppData, groupId: string): boolean {
  const existingIndex = data.existingGroups.findIndex(g => g.id === groupId);
  if (existingIndex !== -1) {
    data.existingGroups.splice(existingIndex, 1);
    return true;
  }

  const generatedIndex = data.generatedGroups.findIndex(g => g.id === groupId);
  if (generatedIndex !== -1) {
    data.generatedGroups.splice(generatedIndex, 1);
    return true;
  }

  return false;
}

/**
 * Clear all generated groups
 */
export function clearGeneratedGroups(data: AppData): number {
  const count = data.generatedGroups.length;
  data.generatedGroups = [];
  return count;
}

/**
 * Get matching statistics
 */
export function getMatchingStats(data: AppData): MatchingStats {
  const totalStudents = data.students.length;
  const inExistingGroups = data.existingGroups.reduce(
    (sum, g) => sum + g.members.length,
    0
  );
  const inGeneratedGroups = data.generatedGroups.reduce(
    (sum, g) => sum + g.members.length,
    0
  );

  return {
    totalStudents,
    inExistingGroups,
    inGeneratedGroups,
    ungrouped: totalStudents - inExistingGroups - inGeneratedGroups,
    existingGroupCount: data.existingGroups.length,
    generatedGroupCount: data.generatedGroups.length,
    totalGroups: data.existingGroups.length + data.generatedGroups.length,
  };
}

/**
 * Validate group configuration
 */
export function validateGroups(data: AppData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allGroups = [...data.existingGroups, ...data.generatedGroups];
  const { groupSize } = data.classInfo;

  allGroups.forEach((group, index) => {
    if (group.members.length < groupSize.min) {
      issues.push({
        type: 'warning',
        group: index + 1,
        message: `Group ${index + 1} has only ${group.members.length} members (minimum: ${groupSize.min})`,
      });
    }
    if (group.members.length > groupSize.max) {
      issues.push({
        type: 'error',
        group: index + 1,
        message: `Group ${index + 1} exceeds maximum size (${group.members.length} > ${groupSize.max})`,
      });
    }
  });

  // Check for duplicate assignments
  const assigned = new Map<number, number>();
  allGroups.forEach((group, gIndex) => {
    group.members.forEach(memberId => {
      if (assigned.has(memberId)) {
        const student = data.students.find(s => s.id === memberId);
        issues.push({
          type: 'error',
          message: `${student?.name || memberId} is assigned to multiple groups`,
        });
      }
      assigned.set(memberId, gIndex);
    });
  });

  return issues;
}

/**
 * Suggest optimal strategy based on data
 */
export function suggestStrategy(data: AppData): {
  recommended: MatchingStrategy;
  reason: string;
} {
  const hasPreferences = data.students.some(s => s.preferences.length > 0);
  const hasSkills = data.students.some(s => s.skills.length > 0);

  if (hasPreferences) {
    return {
      recommended: 'preference',
      reason: 'Students have indicated preferences',
    };
  }

  if (hasSkills) {
    return {
      recommended: 'skillBalanced',
      reason: 'Students have skills defined',
    };
  }

  return {
    recommended: 'random',
    reason: 'No preferences or skills defined',
  };
}
