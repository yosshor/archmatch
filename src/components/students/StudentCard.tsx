'use client';

import type { Student } from '@/types';
import { clsx } from 'clsx';

interface StudentCardProps {
  student: Student;
  isGrouped: boolean;
  onClick: () => void;
}

export function StudentCard({ student, isGrouped, onClick }: StudentCardProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative bg-bg-card border border-gray-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 overflow-hidden group shadow-sm',
        'hover:-translate-y-1 hover:shadow-lg hover:border-accent-primary/40',
        isGrouped && 'opacity-50'
      )}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 w-1 h-full bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Grouped badge */}
      {isGrouped && (
        <span className="absolute top-4 right-4 px-2 py-0.5 bg-accent-tertiary text-white text-xs rounded-md">
          In Group
        </span>
      )}

      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-br from-accent-secondary to-accent-tertiary rounded-full flex items-center justify-center text-white font-semibold text-lg mb-4">
        {initials}
      </div>

      {/* Info */}
      <h3 className="font-medium text-lg mb-1">{student.name}</h3>
      <p className="text-text-muted text-sm mb-3">{student.phone}</p>

      {/* Skills */}
      {student.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {student.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-bg-elevated rounded text-xs text-text-secondary"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
