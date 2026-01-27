/**
 * Data Management Module
 * Handles loading, saving, and default data
 */

import type { AppData, Student } from '@/types';

const STORAGE_KEY = 'archMatch_data';

/**
 * Default application data with class roster
 */
export const DEFAULT_DATA: AppData = {
  classInfo: {
    courseName: 'Software Architecture',
    teacher: 'Osnat',
    semester: '2026A',
    groupSize: { min: 2, max: 3 },
  },
  students: [
    { id: 1, name: 'Shiran', phone: '+972 54-817-3333', skills: [], preferences: [], available: true },
    { id: 2, name: 'Aleen', phone: '+972 50-996-3333', skills: [], preferences: [], available: true },
    { id: 3, name: 'Alisa', phone: '+972 54-300-3333', skills: [], preferences: [], available: true },
    { id: 4, name: 'Eden Ivri', phone: '+972 50-815-3333', skills: [], preferences: [], available: true },
    { id: 5, name: 'Emeer', phone: '+972 54-777-3333', skills: [], preferences: [], available: true },
    { id: 6, name: 'Greg Stein', phone: '+972 54-542-3333', skills: [], preferences: [], available: true },
    { id: 7, name: 'Idan', phone: '+972 50-227-3333', skills: [], preferences: [], available: true },
    { id: 8, name: 'Lahad Ludar', phone: '+972 50-541-3333', skills: [], preferences: [], available: true },
    { id: 9, name: 'Moran', phone: '+972 50-570-3333', skills: [], preferences: [], available: true },
    { id: 10, name: 'Ntedri', phone: '+972 54-234-3333', skills: [], preferences: [], available: true },
    { id: 11, name: 'Omer Mintz', phone: '+972 50-205-3333', skills: [], preferences: [], available: true },
    { id: 12, name: 'Or', phone: '+972 50-933-3333', skills: [], preferences: [], available: true },
    { id: 13, name: 'Raphael', phone: '+972 54-755-3333', skills: [], preferences: [], available: true },
    { id: 14, name: 'Rona', phone: '+972 54-217-3333', skills: [], preferences: [], available: true },
    { id: 15, name: 'Roy Sharoni', phone: '+972 52-337-3333', skills: [], preferences: [], available: true },
    { id: 16, name: 'Salma', phone: '+972 54-685-3333', skills: [], preferences: [], available: true },
    { id: 17, name: 'Sam Rosenbaum', phone: '+972 52-397-3333', skills: [], preferences: [], available: true },
    { id: 18, name: 'Shahar', phone: '+972 50-666-3333', skills: [], preferences: [], available: true },
    { id: 19, name: 'Yehiel', phone: '+972 54-482-3333', skills: [], preferences: [], available: true },
  ],
  existingGroups: [],
  generatedGroups: [],
};

/**
 * Load data from localStorage (client-side only)
 */
export function loadData(): AppData {
  if (typeof window === 'undefined') {
    return structuredClone(DEFAULT_DATA);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AppData;
    }
  } catch (error) {
    console.error('Failed to load data:', error);
  }

  return structuredClone(DEFAULT_DATA);
}

/**
 * Save data to localStorage
 */
export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

/**
 * Reset data to defaults
 */
export function resetData(): AppData {
  const data = structuredClone(DEFAULT_DATA);
  saveData(data);
  return data;
}

/**
 * Add a new student
 */
export function addStudent(
  data: AppData,
  student: Omit<Student, 'id' | 'available'>
): Student {
  const newId = Math.max(...data.students.map(s => s.id), 0) + 1;
  const newStudent: Student = {
    ...student,
    id: newId,
    available: true,
  };
  data.students.push(newStudent);
  return newStudent;
}

/**
 * Remove a student by ID
 */
export function removeStudent(data: AppData, studentId: number): boolean {
  const index = data.students.findIndex(s => s.id === studentId);
  if (index !== -1) {
    data.students.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Update student details
 */
export function updateStudent(
  data: AppData,
  studentId: number,
  updates: Partial<Student>
): Student | null {
  const student = data.students.find(s => s.id === studentId);
  if (student) {
    Object.assign(student, updates);
    return student;
  }
  return null;
}

/**
 * Find student by name (partial match)
 */
export function findStudentByName(data: AppData, name: string): Student | undefined {
  const lower = name.toLowerCase();
  return data.students.find(s => s.name.toLowerCase().includes(lower));
}

/**
 * Export data as JSON string
 */
export function exportToJSON(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export groups as plain text
 */
export function exportToText(data: AppData): string {
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  let text = `${data.classInfo.courseName}\n`;
  text += `Teacher: ${data.classInfo.teacher}\n`;
  text += `Semester: ${data.classInfo.semester}\n`;
  text += `${'═'.repeat(50)}\n\n`;

  allGroups.forEach((group, idx) => {
    const members = group.members
      .map(id => data.students.find(s => s.id === id))
      .filter(Boolean);
    const type = group.isManual ? 'Pre-formed' : 'Auto-matched';

    text += `Group ${idx + 1} [${type}]\n`;
    text += `${'─'.repeat(30)}\n`;
    members.forEach(m => {
      if (m) text += `  • ${m.name}\n    ${m.phone}\n`;
    });
    text += '\n';
  });

  return text;
}

/**
 * Export groups as HTML
 */
export function exportToHTML(data: AppData): string {
  const allGroups = [...data.existingGroups, ...data.generatedGroups];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Groups - ${data.classInfo.courseName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #ff6b4a; padding-bottom: 10px; }
    .meta { color: #666; margin-bottom: 30px; }
    .group { background: white; padding: 20px; margin: 15px 0; border-radius: 12px; border-left: 4px solid #ff6b4a; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .group-title { font-weight: bold; font-size: 1.3em; margin-bottom: 15px; color: #1a1a2e; }
    .member { padding: 8px 0; border-bottom: 1px solid #eee; }
    .member:last-child { border-bottom: none; }
    .name { font-weight: 500; }
    .phone { color: #888; font-size: 0.9em; }
    .type { color: #888; font-size: 0.85em; background: #f0f0f0; padding: 2px 8px; border-radius: 4px; }
    @media print { body { background: white; } .group { box-shadow: none; border: 1px solid #ddd; } }
  </style>
</head>
<body>
  <h1>${data.classInfo.courseName}</h1>
  <div class="meta">
    <p><strong>Teacher:</strong> ${data.classInfo.teacher} | <strong>Semester:</strong> ${data.classInfo.semester}</p>
    <p><strong>Total Groups:</strong> ${allGroups.length} | <strong>Total Students:</strong> ${data.students.length}</p>
  </div>
  ${allGroups
    .map((group, idx) => {
      const members = group.members
        .map(id => data.students.find(s => s.id === id))
        .filter(Boolean);
      return `
  <div class="group">
    <div class="group-title">Group ${idx + 1} <span class="type">${group.isManual ? 'Pre-formed' : 'Auto-matched'}</span></div>
    ${members.map(m => (m ? `<div class="member"><span class="name">${m.name}</span> <span class="phone">${m.phone}</span></div>` : '')).join('')}
  </div>`;
    })
    .join('')}
</body>
</html>`;
}
