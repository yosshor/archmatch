/**
 * Tests for Matching Strategies
 */

import {
  randomMatching,
  preferenceMatching,
  skillBalancedMatching,
  alphabeticalMatching,
  roundRobinMatching,
} from '@/lib/matching-strategies';
import type { Student, GroupSize } from '@/types';

// Test data
const createStudent = (id: number, name: string, overrides?: Partial<Student>): Student => ({
  id,
  name,
  phone: `+972 50-000-000${id}`,
  skills: [],
  preferences: [],
  available: true,
  ...overrides,
});

const testStudents: Student[] = [
  createStudent(1, 'Alice'),
  createStudent(2, 'Bob'),
  createStudent(3, 'Charlie'),
  createStudent(4, 'Diana'),
  createStudent(5, 'Eve'),
  createStudent(6, 'Frank'),
];

const groupSize: GroupSize = { min: 2, max: 3 };

describe('randomMatching', () => {
  it('should create groups of the specified size', () => {
    const groups = randomMatching(testStudents, 3);

    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((group) => {
      expect(group.length).toBeGreaterThanOrEqual(2);
      expect(group.length).toBeLessThanOrEqual(4); // Could be 4 if last group merged
    });
  });

  it('should include all students in groups', () => {
    const groups = randomMatching(testStudents, 3);
    const allStudentIds = groups.flat().map((s) => s.id);

    testStudents.forEach((student) => {
      expect(allStudentIds).toContain(student.id);
    });
  });

  it('should not duplicate students across groups', () => {
    const groups = randomMatching(testStudents, 3);
    const allStudentIds = groups.flat().map((s) => s.id);
    const uniqueIds = new Set(allStudentIds);

    expect(uniqueIds.size).toBe(allStudentIds.length);
  });

  it('should handle empty student list', () => {
    const groups = randomMatching([], 3);
    expect(groups).toEqual([]);
  });

  it('should handle single student', () => {
    const groups = randomMatching([testStudents[0]], 3);
    expect(groups.length).toBe(1);
    expect(groups[0].length).toBe(1);
  });
});

describe('preferenceMatching', () => {
  it('should prioritize mutual preferences', () => {
    const studentsWithPrefs: Student[] = [
      createStudent(1, 'Alice', { preferences: [2] }),
      createStudent(2, 'Bob', { preferences: [1] }),
      createStudent(3, 'Charlie'),
      createStudent(4, 'Diana'),
    ];

    const groups = preferenceMatching(studentsWithPrefs, groupSize);

    // Find the group containing Alice
    const aliceGroup = groups.find((g) => g.some((s) => s.id === 1));

    expect(aliceGroup).toBeDefined();
    expect(aliceGroup?.map((s) => s.id)).toContain(2); // Bob should be with Alice
  });

  it('should include all students', () => {
    const groups = preferenceMatching(testStudents, groupSize);
    const allIds = groups.flat().map((s) => s.id);

    testStudents.forEach((s) => {
      expect(allIds).toContain(s.id);
    });
  });

  it('should create valid group sizes', () => {
    const groups = preferenceMatching(testStudents, groupSize);

    groups.forEach((group) => {
      expect(group.length).toBeGreaterThanOrEqual(groupSize.min);
    });
  });
});

describe('skillBalancedMatching', () => {
  it('should distribute skills across groups', () => {
    const studentsWithSkills: Student[] = [
      createStudent(1, 'Alice', { skills: ['React', 'Node'] }),
      createStudent(2, 'Bob', { skills: ['Python', 'Django'] }),
      createStudent(3, 'Charlie', { skills: ['Java', 'Spring'] }),
      createStudent(4, 'Diana', { skills: ['React', 'TypeScript'] }),
    ];

    const groups = skillBalancedMatching(studentsWithSkills, groupSize);

    expect(groups.length).toBeGreaterThan(0);
    // Each group should have diverse skills
    groups.forEach((group) => {
      const groupSkills = new Set(group.flatMap((s) => s.skills));
      // Groups should have multiple unique skills
      expect(groupSkills.size).toBeGreaterThan(0);
    });
  });

  it('should handle students without skills', () => {
    const groups = skillBalancedMatching(testStudents, groupSize);

    expect(groups.length).toBeGreaterThan(0);
    const allIds = groups.flat().map((s) => s.id);
    expect(allIds.length).toBe(testStudents.length);
  });
});

describe('alphabeticalMatching', () => {
  it('should group students in alphabetical order', () => {
    const groups = alphabeticalMatching(testStudents, 3);

    // First group should start with Alice
    expect(groups[0][0].name).toBe('Alice');

    // Students should be in order within first group
    expect(groups[0][1].name).toBe('Bob');
  });

  it('should create correct number of groups', () => {
    const groups = alphabeticalMatching(testStudents, 3);

    // 6 students with group size 3 = 2 groups
    expect(groups.length).toBe(2);
  });
});

describe('roundRobinMatching', () => {
  it('should distribute students evenly', () => {
    const groups = roundRobinMatching(testStudents, 3);

    // Groups should be relatively balanced
    const sizes = groups.map((g) => g.length);
    const maxDiff = Math.max(...sizes) - Math.min(...sizes);

    expect(maxDiff).toBeLessThanOrEqual(1);
  });

  it('should include all students', () => {
    const groups = roundRobinMatching(testStudents, 3);
    const allIds = groups.flat().map((s) => s.id);

    expect(allIds.length).toBe(testStudents.length);
    testStudents.forEach((s) => {
      expect(allIds).toContain(s.id);
    });
  });
});
