/**
 * Application State Store using Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppData, Student, MatchingStrategy, TabName, MatchingResult } from '@/types';
import { DEFAULT_DATA } from '@/lib/data';
import {
  generateMatches,
  createManualGroup,
  dissolveGroup,
  clearGeneratedGroups,
  getGroupedStudentIds,
  getMatchingStats,
} from '@/lib/matching-engine';

interface AppState {
  // Data
  data: AppData;

  // UI State
  activeTab: TabName;
  selectedStrategy: MatchingStrategy;
  searchQuery: string;
  toastMessage: string | null;

  // Actions - UI
  setActiveTab: (tab: TabName) => void;
  setSelectedStrategy: (strategy: MatchingStrategy) => void;
  setSearchQuery: (query: string) => void;
  showToast: (message: string) => void;
  clearToast: () => void;

  // Actions - Students
  addStudent: (student: Omit<Student, 'id' | 'available'>) => void;
  removeStudent: (id: number) => void;
  updateStudentPreferences: (id: number, preferences: number[]) => void;
  updateStudentSkills: (id: number, skills: string[]) => void;

  // Actions - Matching
  runMatching: () => MatchingResult;
  createGroup: (memberIds: number[]) => void;
  removeGroup: (groupId: string) => void;
  clearGenerated: () => void;

  // Actions - Data
  updateGroupSize: (min: number, max: number) => void;
  resetData: () => void;

  // Computed helpers
  getGroupedIds: () => Set<number>;
  getAvailableStudents: () => Student[];
  getStats: () => ReturnType<typeof getMatchingStats>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      data: structuredClone(DEFAULT_DATA),
      activeTab: 'students',
      selectedStrategy: 'preference',
      searchQuery: '',
      toastMessage: null,

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      showToast: (message) => {
        set({ toastMessage: message });
        setTimeout(() => set({ toastMessage: null }), 3000);
      },
      clearToast: () => set({ toastMessage: null }),

      // Student Actions
      addStudent: (student) => {
        const { data } = get();
        const newId = Math.max(...data.students.map((s) => s.id), 0) + 1;
        const newStudent: Student = {
          ...student,
          id: newId,
          available: true,
        };
        set({
          data: {
            ...data,
            students: [...data.students, newStudent],
          },
        });
        get().showToast(`Added ${student.name}`);
      },

      removeStudent: (id) => {
        const { data } = get();
        const student = data.students.find((s) => s.id === id);
        set({
          data: {
            ...data,
            students: data.students.filter((s) => s.id !== id),
          },
        });
        if (student) {
          get().showToast(`Removed ${student.name}`);
        }
      },

      updateStudentPreferences: (id, preferences) => {
        const { data } = get();
        set({
          data: {
            ...data,
            students: data.students.map((s) =>
              s.id === id ? { ...s, preferences } : s
            ),
          },
        });
        get().showToast('Preferences saved');
      },

      updateStudentSkills: (id, skills) => {
        const { data } = get();
        set({
          data: {
            ...data,
            students: data.students.map((s) =>
              s.id === id ? { ...s, skills } : s
            ),
          },
        });
      },

      // Matching Actions
      runMatching: () => {
        const { data, selectedStrategy } = get();
        const dataCopy = structuredClone(data);
        const result = generateMatches(dataCopy, selectedStrategy);

        if (result.success) {
          set({ data: dataCopy });
          get().showToast(`Created ${result.groupsCreated} groups`);
        } else {
          get().showToast(result.message || 'Matching failed');
        }

        return result;
      },

      createGroup: (memberIds) => {
        const { data } = get();
        if (memberIds.length < data.classInfo.groupSize.min) {
          get().showToast(`Select at least ${data.classInfo.groupSize.min} members`);
          return;
        }
        if (memberIds.length > data.classInfo.groupSize.max) {
          get().showToast(`Maximum group size is ${data.classInfo.groupSize.max}`);
          return;
        }

        const dataCopy = structuredClone(data);
        createManualGroup(dataCopy, memberIds);
        set({ data: dataCopy });
        get().showToast('Group created');
      },

      removeGroup: (groupId) => {
        const { data } = get();
        const dataCopy = structuredClone(data);
        dissolveGroup(dataCopy, groupId);
        set({ data: dataCopy });
        get().showToast('Group dissolved');
      },

      clearGenerated: () => {
        const { data } = get();
        const dataCopy = structuredClone(data);
        const count = clearGeneratedGroups(dataCopy);
        set({ data: dataCopy });
        get().showToast(`Cleared ${count} groups`);
      },

      // Data Actions
      updateGroupSize: (min, max) => {
        const { data } = get();
        set({
          data: {
            ...data,
            classInfo: {
              ...data.classInfo,
              groupSize: { min, max },
            },
          },
        });
      },

      resetData: () => {
        set({ data: structuredClone(DEFAULT_DATA) });
        get().showToast('Data reset to defaults');
      },

      // Computed Helpers
      getGroupedIds: () => {
        const { data } = get();
        return getGroupedStudentIds(data);
      },

      getAvailableStudents: () => {
        const { data } = get();
        const groupedIds = getGroupedStudentIds(data);
        return data.students.filter((s) => s.available && !groupedIds.has(s.id));
      },

      getStats: () => {
        const { data } = get();
        return getMatchingStats(data);
      },
    }),
    {
      name: 'archMatch_data',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
