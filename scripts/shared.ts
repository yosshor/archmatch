/**
 * Shared utilities for CLI scripts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AppData, Student, Group, GroupSize } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_FILE = join(__dirname, '..', 'data', 'students.json');

export const DEFAULT_DATA: AppData = {
  classInfo: {
    courseName: 'Software Architecture',
    teacher: 'Osnat',
    semester: '2026A',
    groupSize: { min: 2, max: 3 },
  },
  students: [
    { id: 1, name: 'Shiran', phone: '+972 54-817-9003', skills: [], preferences: [], available: true },
    { id: 2, name: 'Aleen', phone: '+972 50-996-3822', skills: [], preferences: [], available: true },
    { id: 3, name: 'Alisa', phone: '+972 54-300-2705', skills: [], preferences: [], available: true },
    { id: 4, name: 'Eden Ivri', phone: '+972 50-815-2342', skills: [], preferences: [], available: true },
    { id: 5, name: 'Emeer', phone: '+972 54-777-6964', skills: [], preferences: [], available: true },
    { id: 6, name: 'Greg Stein', phone: '+972 54-542-6544', skills: [], preferences: [], available: true },
    { id: 7, name: 'Idan', phone: '+972 50-227-4422', skills: [], preferences: [], available: true },
    { id: 8, name: 'Lahad Ludar', phone: '+972 50-541-4584', skills: [], preferences: [], available: true },
    { id: 9, name: 'Moran', phone: '+972 50-570-5649', skills: [], preferences: [], available: true },
    { id: 10, name: 'Ntedri', phone: '+972 54-234-3219', skills: [], preferences: [], available: true },
    { id: 11, name: 'Omer Mintz', phone: '+972 50-205-7449', skills: [], preferences: [], available: true },
    { id: 12, name: 'Or', phone: '+972 50-933-4629', skills: [], preferences: [], available: true },
    { id: 13, name: 'Raphael', phone: '+972 54-755-4904', skills: [], preferences: [], available: true },
    { id: 14, name: 'Rona', phone: '+972 54-217-4218', skills: [], preferences: [], available: true },
    { id: 15, name: 'Roy Sharoni', phone: '+972 52-337-5304', skills: [], preferences: [], available: true },
    { id: 16, name: 'Salma', phone: '+972 54-685-8836', skills: [], preferences: [], available: true },
    { id: 17, name: 'Sam Rosenbaum', phone: '+972 52-397-7770', skills: [], preferences: [], available: true },
    { id: 18, name: 'Shahar', phone: '+972 50-666-1717', skills: [], preferences: [], available: true },
    { id: 19, name: 'Yehiel', phone: '+972 54-482-7374', skills: [], preferences: [], available: true },
  ],
  existingGroups: [],
  generatedGroups: [],
};

export function loadData(): AppData {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return structuredClone(DEFAULT_DATA);
}

export function saveData(data: AppData): void {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function findStudentByName(data: AppData, name: string): Student | undefined {
  const lower = name.toLowerCase();
  return data.students.find(s => s.name.toLowerCase().includes(lower));
}

export function getGroupedIds(data: AppData): Set<number> {
  const ids = new Set<number>();
  [...data.existingGroups, ...data.generatedGroups].forEach(g => {
    g.members.forEach(id => ids.add(id));
  });
  return ids;
}

export function generateGroupId(): string {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  if (chunks.length > 1 && chunks[chunks.length - 1].length < 2) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1].push(...last);
  }
  return chunks;
}
