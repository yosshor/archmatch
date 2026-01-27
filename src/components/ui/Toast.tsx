'use client';

import { useAppStore } from '@/store/useAppStore';
import { clsx } from 'clsx';

export function Toast() {
  const message = useAppStore((state) => state.toastMessage);

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-accent-success text-bg-primary rounded-xl font-medium z-[100] transition-all duration-300',
        message
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-24 pointer-events-none'
      )}
    >
      {message}
    </div>
  );
}
