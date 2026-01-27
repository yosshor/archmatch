'use client';

import type { Group, Student } from '@/types';
import { Button } from '@/components/ui/Button';

interface GroupCardProps {
  group: Group;
  groupNumber: number;
  members: Student[];
  onDissolve: () => void;
}

export function GroupCard({ group, groupNumber, members, onDissolve }: GroupCardProps) {
  return (
    <div className="bg-bg-card border border-gray-300 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-bg-elevated border-b border-gray-200">
        <span className="font-display text-xl italic">Group {groupNumber}</span>
        <span
          className={`px-2 py-0.5 rounded text-xs text-white ${
            group.isManual ? 'bg-accent-secondary' : 'bg-accent-tertiary'
          }`}
        >
          {group.isManual ? 'Pre-formed' : 'Auto-matched'}
        </span>
      </div>

      {/* Members */}
      <div className="p-5">
        {members.map((member) => {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('');
          return (
            <div
              key={member.id}
              className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-accent-secondary to-accent-tertiary rounded-full flex items-center justify-center text-white font-medium text-sm">
                {initials}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{member.name}</div>
                <div className="text-text-muted text-xs">{member.phone}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="px-5 py-3 bg-bg-elevated flex justify-end">
        <Button variant="ghost" size="sm" onClick={onDissolve}>
          Dissolve
        </Button>
      </div>
    </div>
  );
}
