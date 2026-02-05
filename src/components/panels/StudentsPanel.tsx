'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StudentCard } from '@/components/students/StudentCard';

export function StudentsPanel() {
  const { data, searchQuery, setSearchQuery, addStudent, removeStudent, getGroupedIds, updateStudentPreferences } =
    useAppStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [newStudent, setNewStudent] = useState({ name: '', phone: '', skills: '' });
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);

  const groupedIds = getGroupedIds();

  const filteredStudents = data.students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = data.students.find((s) => s.id === selectedStudentId);

  const handleAddStudent = () => {
    if (!newStudent.name.trim()) return;

    addStudent({
      name: newStudent.name,
      phone: newStudent.phone,
      skills: newStudent.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      preferences: [],
    });

    setNewStudent({ name: '', phone: '', skills: '' });
    setIsAddModalOpen(false);
  };

  const handleOpenDetail = (id: number) => {
    const student = data.students.find((s) => s.id === id);
    if (student) {
      setSelectedStudentId(id);
      setSelectedPreferences(student.preferences);
      setIsDetailModalOpen(true);
    }
  };

  const handleSavePreferences = () => {
    if (selectedStudentId !== null) {
      updateStudentPreferences(selectedStudentId, selectedPreferences);
      setIsDetailModalOpen(false);
    }
  };

  const handleDeleteStudent = () => {
    if (selectedStudentId !== null) {
      const isGrouped = groupedIds.has(selectedStudentId);
      if (isGrouped) {
        return; // Don't allow deleting grouped students
      }
      removeStudent(selectedStudentId);
      setIsDetailModalOpen(false);
    }
  };

  const togglePreference = (id: number) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h2 className="font-display text-3xl">Student Roster</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsAddModalOpen(true)}>
            <span>+</span> Add Student
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-secondary transition-colors"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            isGrouped={groupedIds.has(student.id)}
            onClick={() => handleOpenDetail(student.id)}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <div className="text-5xl mb-4 opacity-50">&#x1F465;</div>
          <p>No students found</p>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Student">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">Name</label>
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="Enter student name"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Phone</label>
            <input
              type="tel"
              value={newStudent.phone}
              onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
              placeholder="+972 XX-XXX-XXXX"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-2">Skills (comma separated)</label>
            <input
              type="text"
              value={newStudent.skills}
              onChange={(e) => setNewStudent({ ...newStudent, skills: e.target.value })}
              placeholder="React, Node.js, Python"
              className="w-full px-4 py-3 bg-bg-card border border-border rounded-xl text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddStudent}>Add Student</Button>
        </div>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedStudent?.name || 'Student'}
        size="large"
      >
        <div className="p-6">
          {selectedStudent && (
            <>
              <div className="mb-6 space-y-2 text-text-secondary">
                <p>
                  <strong className="text-text-primary">Phone:</strong> {selectedStudent.phone || 'Not provided'}
                </p>
                <p>
                  <strong className="text-text-primary">Skills:</strong>{' '}
                  {selectedStudent.skills.length > 0 ? selectedStudent.skills.join(', ') : 'None'}
                </p>
                <p>
                  <strong className="text-text-primary">Status:</strong>{' '}
                  {groupedIds.has(selectedStudent.id) ? 'In a group' : 'Available'}
                </p>
              </div>

              <h3 className="font-medium mb-2">Set Preferences</h3>
              <p className="text-sm text-text-muted mb-4">
                Select students this person prefers to work with:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {data.students
                  .filter((s) => s.id !== selectedStudentId)
                  .map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 px-3 py-2 bg-bg-elevated border rounded-lg cursor-pointer transition-colors ${
                        selectedPreferences.includes(s.id)
                          ? 'border-accent-primary bg-accent-primary/10'
                          : 'border-border hover:border-accent-secondary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPreferences.includes(s.id)}
                        onChange={() => togglePreference(s.id)}
                        className="accent-accent-primary"
                      />
                      <span className="text-sm">{s.name}</span>
                    </label>
                  ))}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-between p-6 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleDeleteStudent}
            disabled={selectedStudentId !== null && groupedIds.has(selectedStudentId)}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            Delete Student
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
