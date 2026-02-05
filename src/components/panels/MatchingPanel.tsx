'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { suggestStrategy } from '@/lib/matching-engine';
import type { MatchingStrategy } from '@/types';
import { clsx } from 'clsx';

const STRATEGIES: { id: MatchingStrategy; icon: string; title: string; description: string }[] = [
  {
    id: 'preference',
    icon: '♥',
    title: 'Preference Based',
    description: 'Match students based on their preferences for teammates',
  },
  {
    id: 'random',
    icon: '⚄',
    title: 'Random',
    description: 'Completely random group assignment',
  },
  {
    id: 'skillBalanced',
    icon: '⚖',
    title: 'Skill Balanced',
    description: 'Distribute skills evenly across groups',
  },
  {
    id: 'alphabetical',
    icon: 'A→Z',
    title: 'Alphabetical',
    description: 'Group by name order',
  },
  {
    id: 'roundRobin',
    icon: '↻',
    title: 'Round Robin',
    description: 'Draft-style distribution across groups',
  },
];

export function MatchingPanel() {
  const { data, selectedStrategy, setSelectedStrategy, runMatching, updateGroupSize, getStats } =
    useAppStore();

  const stats = getStats();
  const suggestion = suggestStrategy(data);

  const handleRunMatching = () => {
    runMatching();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-3xl mb-2">Auto-Match Generator</h2>
        <p className="text-text-secondary">
          {stats.ungrouped} students available for matching
        </p>
      </div>

      {/* Strategy Suggestion */}
      {suggestion.recommended !== selectedStrategy && (
        <div className="mb-6 px-4 py-3 bg-accent-secondary/10 border border-accent-secondary/30 rounded-xl text-sm">
          <span className="text-accent-secondary font-medium">Suggestion:</span>{' '}
          <span className="text-text-secondary">{suggestion.reason}.</span>{' '}
          <button
            onClick={() => setSelectedStrategy(suggestion.recommended)}
            className="text-accent-secondary hover:underline font-medium"
          >
            Use {STRATEGIES.find(s => s.id === suggestion.recommended)?.title}
          </button>
        </div>
      )}

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {STRATEGIES.map((strategy) => (
          <button
            key={strategy.id}
            onClick={() => setSelectedStrategy(strategy.id)}
            className={clsx(
              'p-6 bg-bg-card border-2 rounded-2xl text-center transition-all duration-200 hover:-translate-y-0.5 shadow-sm',
              selectedStrategy === strategy.id
                ? 'border-accent-primary shadow-lg shadow-accent-primary/20'
                : 'border-border hover:border-accent-secondary'
            )}
          >
            <div className="text-4xl mb-4">{strategy.icon}</div>
            <h3 className="font-medium mb-2">{strategy.title}</h3>
            <p className="text-sm text-text-muted">{strategy.description}</p>
          </button>
        ))}
      </div>

      {/* Group Size Config */}
      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <h3 className="font-medium mb-4 text-text-secondary">Group Size</h3>
        <div className="flex gap-8 items-end">
          <div>
            <label className="block text-sm text-text-muted mb-2">Min</label>
            <input
              type="number"
              min={2}
              max={data.classInfo.groupSize.max}
              value={data.classInfo.groupSize.min}
              onChange={(e) => {
                const val = Math.max(2, Math.min(Number(e.target.value), data.classInfo.groupSize.max));
                updateGroupSize(val, data.classInfo.groupSize.max);
              }}
              className="w-20 px-4 py-3 bg-bg-elevated border-2 border-border rounded-xl text-center text-xl text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Max</label>
            <input
              type="number"
              min={data.classInfo.groupSize.min}
              max={10}
              value={data.classInfo.groupSize.max}
              onChange={(e) => {
                const val = Math.max(data.classInfo.groupSize.min, Math.min(Number(e.target.value), 10));
                updateGroupSize(data.classInfo.groupSize.min, val);
              }}
              className="w-20 px-4 py-3 bg-bg-elevated border-2 border-border rounded-xl text-center text-xl text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          {data.classInfo.groupSize.min > data.classInfo.groupSize.max && (
            <p className="text-sm text-red-500">Min cannot exceed max</p>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="text-center py-8">
        <Button size="lg" onClick={handleRunMatching} disabled={stats.ungrouped === 0}>
          Generate Matches
        </Button>
        <p className="text-text-muted text-sm mt-4">
          {stats.ungrouped === 0
            ? 'All students are already in groups'
            : `Will create groups using ${STRATEGIES.find(s => s.id === selectedStrategy)?.title || selectedStrategy} strategy`}
        </p>
      </div>
    </div>
  );
}
