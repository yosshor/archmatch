'use client';

import { useAppStore } from '@/store/useAppStore';
import { Toast } from '@/components/ui/Toast';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { StudentsPanel } from '@/components/panels/StudentsPanel';
import { MatchingPanel } from '@/components/panels/MatchingPanel';
import { ManualPanel } from '@/components/panels/ManualPanel';
import { GroupsPanel } from '@/components/panels/GroupsPanel';
import { ExportPanel } from '@/components/panels/ExportPanel';
import { clsx } from 'clsx';
import type { TabName } from '@/types';

const TABS: { id: TabName; icon: string; label: string }[] = [
  { id: 'students', icon: '●', label: 'Students' },
  { id: 'matching', icon: '◐', label: 'Auto-Match' },
  { id: 'manual', icon: '◧', label: 'Manual Groups' },
  { id: 'groups', icon: '◉', label: 'All Groups' },
  { id: 'export', icon: '▤', label: 'Export' },
];

export default function Home() {
  const { data, activeTab, setActiveTab, getStats } = useAppStore();
  const stats = getStats();

  return (
    <>
      {/* Hero */}
      <header className="relative bg-gradient-to-b from-bg-secondary to-bg-primary border-b border-white/10 px-6 py-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-1/2 -right-1/5 w-[600px] h-[600px] bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-1/3 -left-1/10 w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Logo + Theme Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-4xl text-accent-primary animate-pulse">◈</span>
              <span className="font-display text-2xl italic">ArchMatch</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-6xl mb-2">Software Architecture</h1>
          <p className="text-xl text-text-secondary mb-4">Project Group Formation</p>

          {/* Badges */}
          <div className="flex gap-3 mb-8">
            <span className="px-4 py-1 bg-bg-elevated border border-white/10 rounded-full text-sm text-text-secondary">
              Teacher: {data.classInfo.teacher}
            </span>
            <span className="px-4 py-1 bg-bg-elevated border border-white/10 rounded-full text-sm text-text-secondary">
              {data.classInfo.semester}
            </span>
          </div>

          {/* Stats */}
          <div className="flex gap-12">
            <div>
              <div className="font-display text-5xl italic text-accent-primary">
                {stats.totalStudents}
              </div>
              <div className="text-xs uppercase tracking-widest text-text-muted mt-1">
                Students
              </div>
            </div>
            <div>
              <div className="font-display text-5xl italic text-accent-primary">
                {stats.totalGroups}
              </div>
              <div className="text-xs uppercase tracking-widest text-text-muted mt-1">
                Groups
              </div>
            </div>
            <div>
              <div className="font-display text-5xl italic text-accent-primary">
                {stats.ungrouped}
              </div>
              <div className="text-xs uppercase tracking-widest text-text-muted mt-1">
                Ungrouped
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-bg-secondary border-b border-white/10 px-6 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-1 py-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-bg-card border border-accent-primary/40 text-text-primary shadow-lg shadow-accent-primary/10'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
              )}
            >
              <span className="opacity-70">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'students' && <StudentsPanel />}
        {activeTab === 'matching' && <MatchingPanel />}
        {activeTab === 'manual' && <ManualPanel />}
        {activeTab === 'groups' && <GroupsPanel />}
        {activeTab === 'export' && <ExportPanel />}
      </main>

      {/* Toast */}
      <Toast />
    </>
  );
}
