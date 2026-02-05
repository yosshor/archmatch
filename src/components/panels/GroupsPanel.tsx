'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GroupCard } from '@/components/groups/GroupCard';

export function GroupsPanel() {
  const { data, removeGroup, clearGenerated } = useAppStore();
  const [confirmClear, setConfirmClear] = useState(false);

  const existingCount = data.existingGroups.length;
  const generatedCount = data.generatedGroups.length;

  const handleClearGenerated = () => {
    clearGenerated();
    setConfirmClear(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="font-display text-3xl">All Project Groups</h2>
        {generatedCount > 0 && (
          <Button variant="secondary" onClick={() => setConfirmClear(true)}>
            Clear Auto-Generated
          </Button>
        )}
      </div>

      {/* Existing Groups */}
      <section className="mb-10">
        <h3 className="font-display text-xl italic text-text-secondary mb-4 pb-2 border-b border-border">
          Pre-formed Groups ({existingCount})
        </h3>

        {existingCount === 0 ? (
          <div className="text-center py-8 text-text-muted">No pre-formed groups</div>
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
      </section>

      {/* Generated Groups */}
      <section>
        <h3 className="font-display text-xl italic text-text-secondary mb-4 pb-2 border-b border-border">
          Auto-Matched Groups ({generatedCount})
        </h3>

        {generatedCount === 0 ? (
          <div className="text-center py-8 text-text-muted">
            Run auto-match to generate groups
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.generatedGroups.map((group, idx) => {
              const members = group.members
                .map((id) => data.students.find((s) => s.id === id))
                .filter(Boolean) as typeof data.students;

              return (
                <GroupCard
                  key={group.id}
                  group={group}
                  groupNumber={existingCount + idx + 1}
                  members={members}
                  onDissolve={() => removeGroup(group.id)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Confirm Clear Modal */}
      <Modal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear Auto-Generated Groups"
      >
        <div className="p-6">
          <p className="text-text-secondary">
            This will remove all {generatedCount} auto-generated groups. Students will become available for re-matching.
          </p>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="ghost" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button onClick={handleClearGenerated}>
            Clear {generatedCount} Groups
          </Button>
        </div>
      </Modal>
    </div>
  );
}
