/**
 * Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { StudentCard } from '@/components/students/StudentCard';
import { GroupCard } from '@/components/groups/GroupCard';
import type { Student, Group } from '@/types';

describe('Button Component', () => {
  it('should render children correctly', () => {
    render(<Button>Click Me</Button>);

    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText('Click Me'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply primary variant styles by default', () => {
    render(<Button>Primary</Button>);

    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-gradient-to-br');
  });

  it('should apply secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByText('Secondary');
    expect(button).toHaveClass('bg-bg-elevated');
  });

  it('should apply ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByText('Ghost');
    expect(button).toHaveClass('bg-transparent');
  });

  it('should apply different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('px-3');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('px-8');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});

describe('StudentCard Component', () => {
  const mockStudent: Student = {
    id: 1,
    name: 'Alice Johnson',
    phone: '+972 50-123-4567',
    skills: ['React', 'TypeScript'],
    preferences: [],
    available: true,
  };

  it('should render student name', () => {
    render(
      <StudentCard student={mockStudent} isGrouped={false} onClick={jest.fn()} />
    );

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('should render student phone', () => {
    render(
      <StudentCard student={mockStudent} isGrouped={false} onClick={jest.fn()} />
    );

    expect(screen.getByText('+972 50-123-4567')).toBeInTheDocument();
  });

  it('should display initials in avatar', () => {
    render(
      <StudentCard student={mockStudent} isGrouped={false} onClick={jest.fn()} />
    );

    expect(screen.getByText('AJ')).toBeInTheDocument();
  });

  it('should render skills as tags', () => {
    render(
      <StudentCard student={mockStudent} isGrouped={false} onClick={jest.fn()} />
    );

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('should show "In Group" badge when grouped', () => {
    render(
      <StudentCard student={mockStudent} isGrouped={true} onClick={jest.fn()} />
    );

    expect(screen.getByText('In Group')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(
      <StudentCard student={mockStudent} isGrouped={false} onClick={handleClick} />
    );

    fireEvent.click(screen.getByText('Alice Johnson'));

    expect(handleClick).toHaveBeenCalled();
  });

  it('should have reduced opacity when grouped', () => {
    const { container } = render(
      <StudentCard student={mockStudent} isGrouped={true} onClick={jest.fn()} />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('opacity-50');
  });
});

describe('GroupCard Component', () => {
  const mockGroup: Group = {
    id: 'group-1',
    members: [1, 2],
    createdAt: new Date().toISOString(),
    isManual: true,
    projectName: null,
    notes: '',
  };

  const mockMembers: Student[] = [
    { id: 1, name: 'Alice', phone: '+972 50-111-1111', skills: [], preferences: [], available: true },
    { id: 2, name: 'Bob', phone: '+972 50-222-2222', skills: [], preferences: [], available: true },
  ];

  it('should render group number', () => {
    render(
      <GroupCard
        group={mockGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={jest.fn()}
      />
    );

    expect(screen.getByText('Group 1')).toBeInTheDocument();
  });

  it('should show "Pre-formed" badge for manual groups', () => {
    render(
      <GroupCard
        group={mockGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={jest.fn()}
      />
    );

    expect(screen.getByText('Pre-formed')).toBeInTheDocument();
  });

  it('should show "Auto-matched" badge for generated groups', () => {
    const autoGroup = { ...mockGroup, isManual: false };
    render(
      <GroupCard
        group={autoGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={jest.fn()}
      />
    );

    expect(screen.getByText('Auto-matched')).toBeInTheDocument();
  });

  it('should render all member names', () => {
    render(
      <GroupCard
        group={mockGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={jest.fn()}
      />
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('should render member phone numbers', () => {
    render(
      <GroupCard
        group={mockGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={jest.fn()}
      />
    );

    expect(screen.getByText('+972 50-111-1111')).toBeInTheDocument();
    expect(screen.getByText('+972 50-222-2222')).toBeInTheDocument();
  });

  it('should call onDissolve when dissolve button is clicked', () => {
    const handleDissolve = jest.fn();
    render(
      <GroupCard
        group={mockGroup}
        groupNumber={1}
        members={mockMembers}
        onDissolve={handleDissolve}
      />
    );

    fireEvent.click(screen.getByText('Dissolve'));

    expect(handleDissolve).toHaveBeenCalled();
  });
});
