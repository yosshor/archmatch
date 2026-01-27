/**
 * Core type definitions for ArchMatch
 */

export interface Student {
  id: number;
  name: string;
  phone: string;
  skills: string[];
  preferences: number[]; // IDs of preferred teammates
  available: boolean;
}

export interface Group {
  id: string;
  members: number[]; // Student IDs
  createdAt: string;
  isManual: boolean; // true = pre-formed, false = auto-generated
  projectName: string | null;
  notes: string;
}

export interface GroupSize {
  min: number;
  max: number;
}

export interface ClassInfo {
  courseName: string;
  teacher: string;
  semester: string;
  groupSize: GroupSize;
}

export interface AppData {
  classInfo: ClassInfo;
  students: Student[];
  existingGroups: Group[];
  generatedGroups: Group[];
}

export type MatchingStrategy =
  | 'random'
  | 'preference'
  | 'skillBalanced'
  | 'alphabetical'
  | 'roundRobin';

export interface MatchingResult {
  success: boolean;
  groupsCreated: number;
  studentsMatched: number;
  strategy: MatchingStrategy;
  message?: string;
}

export interface MatchingStats {
  totalStudents: number;
  inExistingGroups: number;
  inGeneratedGroups: number;
  ungrouped: number;
  existingGroupCount: number;
  generatedGroupCount: number;
  totalGroups: number;
}

export interface GroupWithDetails extends Group {
  memberDetails: Student[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  group?: number;
  message: string;
}

export type TabName = 'students' | 'matching' | 'manual' | 'groups' | 'export';

export interface ExportedGroup {
  groupNumber: number;
  members: string;
  projectName: string;
  type: string;
}
