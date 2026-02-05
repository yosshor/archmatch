'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { GroupCard } from '@/components/groups/GroupCard';
import { clsx } from 'clsx';

export function ManualPanel() {
  const { data, createGroup, removeGroup, getGroupedIds } = useAppStore();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const groupedIds = getGroupedIds();

  const toggleMember = (id: number) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleCreateGroup = () => {
    if (selectedMembers.length >= data.classInfo.groupSize.min) {
      createGroup(selectedMembers);
      setSelectedMembers([]);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-3xl mb-2">Manual Group Entry</h2>
        <p className="text-text-secondary">Add groups that are already formed</p>
      </div>

      {/* Create Group Form */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="font-medium mb-4">Create Pre-formed Group</h3>

        <p className="text-sm text-text-muted mb-4">
          Select members ({data.classInfo.groupSize.min}-{data.classInfo.groupSize.max} students):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6 max-h-64 overflow-y-auto">
          {data.students.map((student) => {
            const isGrouped = groupedIds.has(student.id);
            const isSelected = selectedMembers.includes(student.id);

            return (
              <button
                key={student.id}
                onClick={() => !isGrouped && toggleMember(student.id)}
                disabled={isGrouped}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 border-2 rounded-lg text-left transition-colors text-sm',
                  isGrouped
                    ? 'opacity-40 cursor-not-allowed border-border bg-bg-elevated'
                    : isSelected
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-border bg-bg-elevated hover:border-accent-secondary'
                )}
              >
                <span
                  className={clsx(
                    'w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-accent-primary border-accent-primary'
                      : 'border-text-muted bg-bg-secondary'
                  )}
                >
                  {isSelected && (
                    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-white">
                      <path
                        fill="currentColor"
                        d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
                      />
                    </svg>
                  )}
                </span>
                <span className="truncate">
                  {student.name} {isGrouped && '(grouped)'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {selectedMembers.length} selected
          </p>
          <Button
            onClick={handleCreateGroup}
            disabled={
              selectedMembers.length < data.classInfo.groupSize.min ||
              selectedMembers.length > data.classInfo.groupSize.max
            }
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Existing Manual Groups */}
      <div>
        <h3 className="font-display text-xl italic text-text-secondary mb-4 pb-2 border-b border-border">
          Pre-formed Groups
        </h3>

        {data.existingGroups.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>No pre-formed groups yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.existingGroups.map((group, idx) => {
              const members = group.members
                .map((id) => data.students.find((s) => s.id === id))
                .filter(Boolean) as typeof data.students;

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  groupNumber={idx + 1}
                  members={members}
                  onDissolve={() => removeGroup(group.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
