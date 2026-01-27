/**
 * Tests for Matching Engine
 */

import {
  generateMatches,
  createManualGroup,
  dissolveGroup,
  clearGeneratedGroups,
  getGroupedStudentIds,
  getAvailableStudents,
  getMatchingStats,
  validateGroups,
  suggestStrategy,
} from '@/lib/matching-engine';
import type { AppData, Student } from '@/types';

// Helper to create test data
const createTestData = (): AppData => ({
  classInfo: {
    courseName: 'Test Course',
    teacher: 'Test Teacher',
    semester: '2026A',
    groupSize: { min: 2, max: 3 },
  },
  students: [
    { id: 1, name: 'Alice', phone: '', skills: [], preferences: [], available: true },
    { id: 2, name: 'Bob', phone: '', skills: [], preferences: [], available: true },
    { id: 3, name: 'Charlie', phone: '', skills: [], preferences: [], available: true },
    { id: 4, name: 'Diana', phone: '', skills: [], preferences: [], available: true },
    { id: 5, name: 'Eve', phone: '', skills: [], preferences: [], available: true },
    { id: 6, name: 'Frank', phone: '', skills: [], preferences: [], available: true },
  ],
  existingGroups: [],
  generatedGroups: [],
});

describe('getGroupedStudentIds', () => {
  it('should return empty set when no groups exist', () => {
    const data = createTestData();
    const ids = getGroupedStudentIds(data);

    expect(ids.size).toBe(0);
  });

  it('should return all grouped student IDs', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'group1',
      members: [1, 2],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });

    const ids = getGroupedStudentIds(data);

    expect(ids.size).toBe(2);
    expect(ids.has(1)).toBe(true);
    expect(ids.has(2)).toBe(true);
  });

  it('should include IDs from both existing and generated groups', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'existing1',
      members: [1, 2],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });
    data.generatedGroups.push({
      id: 'generated1',
      members: [3, 4],
      createdAt: new Date().toISOString(),
      isManual: false,
      projectName: null,
      notes: '',
    });

    const ids = getGroupedStudentIds(data);

    expect(ids.size).toBe(4);
    expect(ids.has(1)).toBe(true);
    expect(ids.has(3)).toBe(true);
  });
});

describe('getAvailableStudents', () => {
  it('should return all students when no groups exist', () => {
    const data = createTestData();
    const available = getAvailableStudents(data);

    expect(available.length).toBe(6);
  });

  it('should exclude grouped students', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'group1',
      members: [1, 2],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });

    const available = getAvailableStudents(data);

    expect(available.length).toBe(4);
    expect(available.map((s) => s.id)).not.toContain(1);
    expect(available.map((s) => s.id)).not.toContain(2);
  });
});

describe('generateMatches', () => {
  it('should create groups with random strategy', () => {
    const data = createTestData();
    const result = generateMatches(data, 'random');

    expect(result.success).toBe(true);
    expect(result.groupsCreated).toBeGreaterThan(0);
    expect(data.generatedGroups.length).toBeGreaterThan(0);
  });

  it('should clear previous generated groups', () => {
    const data = createTestData();
    data.generatedGroups.push({
      id: 'old',
      members: [1],
      createdAt: new Date().toISOString(),
      isManual: false,
      projectName: null,
      notes: '',
    });

    generateMatches(data, 'random');

    // Old group should be replaced
    expect(data.generatedGroups.every((g) => g.id !== 'old')).toBe(true);
  });

  it('should not match students already in existing groups', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'existing1',
      members: [1, 2],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });

    const result = generateMatches(data, 'random');

    expect(result.studentsMatched).toBe(4); // 6 - 2 = 4
    const generatedIds = data.generatedGroups.flatMap((g) => g.members);
    expect(generatedIds).not.toContain(1);
    expect(generatedIds).not.toContain(2);
  });

  it('should fail when no students available', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'all',
      members: [1, 2, 3, 4, 5, 6],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });

    const result = generateMatches(data, 'random');

    expect(result.success).toBe(false);
    expect(result.message).toContain('No available');
  });
});

describe('createManualGroup', () => {
  it('should create a manual group', () => {
    const data = createTestData();
    const group = createManualGroup(data, [1, 2, 3]);

    expect(group.isManual).toBe(true);
    expect(group.members).toEqual([1, 2, 3]);
    expect(data.existingGroups.length).toBe(1);
  });

  it('should generate unique group IDs', () => {
    const data = createTestData();
    const group1 = createManualGroup(data, [1, 2]);
    const group2 = createManualGroup(data, [3, 4]);

    expect(group1.id).not.toBe(group2.id);
  });
});

describe('dissolveGroup', () => {
  it('should remove an existing group', () => {
    const data = createTestData();
    const group = createManualGroup(data, [1, 2]);

    const result = dissolveGroup(data, group.id);

    expect(result).toBe(true);
    expect(data.existingGroups.length).toBe(0);
  });

  it('should return false for non-existent group', () => {
    const data = createTestData();
    const result = dissolveGroup(data, 'nonexistent');

    expect(result).toBe(false);
  });
});

describe('clearGeneratedGroups', () => {
  it('should remove all generated groups', () => {
    const data = createTestData();
    generateMatches(data, 'random');

    expect(data.generatedGroups.length).toBeGreaterThan(0);

    const count = clearGeneratedGroups(data);

    expect(count).toBeGreaterThan(0);
    expect(data.generatedGroups.length).toBe(0);
  });

  it('should not affect existing groups', () => {
    const data = createTestData();
    createManualGroup(data, [1, 2]);
    generateMatches(data, 'random');

    clearGeneratedGroups(data);

    expect(data.existingGroups.length).toBe(1);
  });
});

describe('getMatchingStats', () => {
  it('should return correct stats', () => {
    const data = createTestData();
    createManualGroup(data, [1, 2]);
    generateMatches(data, 'random');

    const stats = getMatchingStats(data);

    expect(stats.totalStudents).toBe(6);
    expect(stats.inExistingGroups).toBe(2);
    expect(stats.inGeneratedGroups).toBe(4);
    expect(stats.ungrouped).toBe(0);
    expect(stats.existingGroupCount).toBe(1);
    expect(stats.generatedGroupCount).toBeGreaterThan(0);
  });
});

describe('validateGroups', () => {
  it('should return no issues for valid groups', () => {
    const data = createTestData();
    createManualGroup(data, [1, 2, 3]);
    createManualGroup(data, [4, 5, 6]);

    const issues = validateGroups(data);

    expect(issues.length).toBe(0);
  });

  it('should warn about small groups', () => {
    const data = createTestData();
    data.existingGroups.push({
      id: 'small',
      members: [1],
      createdAt: new Date().toISOString(),
      isManual: true,
      projectName: null,
      notes: '',
    });

    const issues = validateGroups(data);

    expect(issues.some((i) => i.type === 'warning')).toBe(true);
  });

  it('should error on duplicate assignments', () => {
    const data = createTestData();
    data.existingGroups.push(
      {
        id: 'g1',
        members: [1, 2],
        createdAt: new Date().toISOString(),
        isManual: true,
        projectName: null,
        notes: '',
      },
      {
        id: 'g2',
        members: [2, 3], // Student 2 is duplicated
        createdAt: new Date().toISOString(),
        isManual: true,
        projectName: null,
        notes: '',
      }
    );

    const issues = validateGroups(data);

    expect(issues.some((i) => i.type === 'error')).toBe(true);
  });
});

describe('suggestStrategy', () => {
  it('should suggest preference when students have preferences', () => {
    const data = createTestData();
    data.students[0].preferences = [2];

    const suggestion = suggestStrategy(data);

    expect(suggestion.recommended).toBe('preference');
  });

  it('should suggest skillBalanced when students have skills', () => {
    const data = createTestData();
    data.students[0].skills = ['React'];

    const suggestion = suggestStrategy(data);

    expect(suggestion.recommended).toBe('skillBalanced');
  });

  it('should suggest random when no data available', () => {
    const data = createTestData();

    const suggestion = suggestStrategy(data);

    expect(suggestion.recommended).toBe('random');
  });
});
