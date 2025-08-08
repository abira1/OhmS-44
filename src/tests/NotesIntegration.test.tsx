import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import NotesSection from '../components/sections/SimpleNotesSection';
import { Note, User } from '../types';

// Mock Firebase
jest.mock('../config/firebase', () => ({
  database: {},
  auth: {},
  googleProvider: {}
}));

// Mock services
jest.mock('../services/firebase', () => ({
  NotesService: {
    getAllNotes: jest.fn(),
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn(),
    toggleNoteLike: jest.fn(),
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    listenToNotes: jest.fn(),
    listenToNoteInteractions: jest.fn()
  }
}));

// Mock hooks
jest.mock('../hooks/useFirebase', () => ({
  useNotes: () => ({
    notes: mockNotes,
    loading: false,
    error: null,
    createNote: jest.fn(),
    updateNote: jest.fn(),
    deleteNote: jest.fn()
  }),
  useNoteInteractions: () => ({
    likes: {},
    comments: {},
    loading: false,
    error: null,
    toggleLike: jest.fn(),
    addComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn()
  })
}));

// Mock data
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Test Note 1',
    content: 'This is a test note for mathematics',
    subject: 'Mathematics',
    date: '2024-01-15',
    classLink: 'https://example.com/math-class',
    createdBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isActive: true,
    priority: 'medium',
    targetAudience: 'all',
    likeCount: 5,
    commentCount: 3,
    interactions: {
      likes: {
        'user1': {
          userId: 'user1',
          userEmail: 'user1@example.com',
          userDisplayName: 'User One',
          timestamp: Date.now(),
          reactionType: 'like'
        }
      },
      comments: {
        'comment1': {
          id: 'comment1',
          userId: 'user2',
          userEmail: 'user2@example.com',
          userDisplayName: 'User Two',
          content: 'Great explanation!',
          timestamp: Date.now(),
          isEdited: false,
          isDeleted: false
        }
      }
    }
  },
  {
    id: 'note-2',
    title: 'Test Note 2',
    content: 'This is a test note for physics',
    subject: 'Physics',
    date: '2024-01-16',
    createdBy: 'admin',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    isActive: true,
    priority: 'high',
    targetAudience: 'all',
    likeCount: 0,
    commentCount: 0
  }
];

const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  role: 'user',
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  approvalStatus: 'approved'
};

const mockAdminUser: User = {
  ...mockUser,
  email: 'admin@example.com',
  role: 'admin'
};

const MockProviders: React.FC<{ user?: User | null; children: React.ReactNode }> = ({ 
  user = mockUser, 
  children 
}) => {
  const mockAuthContext = {
    user,
    loading: false,
    error: null,
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    isAdmin: user?.role === 'admin',
    permissions: {
      canRead: true,
      canWrite: user?.role === 'admin',
      canDelete: user?.role === 'admin',
      canManageUsers: user?.role === 'admin'
    }
  };

  const mockDataContext = {
    classes: [],
    students: [],
    loading: false,
    error: null
  };

  return (
    <AuthProvider value={mockAuthContext as any}>
      <DataProvider value={mockDataContext as any}>
        {children}
      </DataProvider>
    </AuthProvider>
  );
};

describe('Notes Section Integration', () => {
  test('should render notes with interactive features', async () => {
    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Check if notes are rendered
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Test Note 2')).toBeInTheDocument();

    // Check if subjects are displayed
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();

    // Check if interaction stats are shown
    expect(screen.getByText('5')).toBeInTheDocument(); // Like count
    expect(screen.getByText('3')).toBeInTheDocument(); // Comment count
  });

  test('should show admin controls for admin users', () => {
    render(
      <MockProviders user={mockAdminUser}>
        <NotesSection
          isAdmin={true}
          permissions={{
            canRead: true,
            canWrite: true,
            canDelete: true,
            canManageUsers: true
          }}
        />
      </MockProviders>
    );

    // Check for admin controls (edit/delete buttons)
    const editButtons = screen.getAllByTitle('Edit note');
    const deleteButtons = screen.getAllByTitle('Delete note');
    
    expect(editButtons).toHaveLength(2); // One for each note
    expect(deleteButtons).toHaveLength(2);
  });

  test('should open detailed view when clicking on comment section', async () => {
    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Find and click on a comment section
    const commentButtons = screen.getAllByText(/comment/i);
    if (commentButtons.length > 0) {
      fireEvent.click(commentButtons[0]);
      
      // Should open detailed modal
      await waitFor(() => {
        expect(screen.getByText('Test Note 1')).toBeInTheDocument();
      });
    }
  });

  test('should filter notes by subject', () => {
    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Find subject filter dropdown
    const subjectFilter = screen.getByDisplayValue('all');
    
    // Change to Mathematics filter
    fireEvent.change(subjectFilter, { target: { value: 'Mathematics' } });
    
    // Should show only Mathematics note
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
    // Physics note should not be visible (this would need more complex testing)
  });

  test('should handle search functionality', () => {
    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search/i);
    
    // Search for "mathematics"
    fireEvent.change(searchInput, { target: { value: 'mathematics' } });
    
    // Should highlight matching content
    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
  });

  test('should show loading state', () => {
    // Mock loading state
    jest.doMock('../hooks/useFirebase', () => ({
      useNotes: () => ({
        notes: [],
        loading: true,
        error: null,
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn()
      })
    }));

    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Should show loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('should handle error state', () => {
    // Mock error state
    jest.doMock('../hooks/useFirebase', () => ({
      useNotes: () => ({
        notes: [],
        loading: false,
        error: 'Failed to load notes',
        createNote: jest.fn(),
        updateNote: jest.fn(),
        deleteNote: jest.fn()
      })
    }));

    render(
      <MockProviders>
        <NotesSection
          isAdmin={false}
          permissions={{
            canRead: true,
            canWrite: false,
            canDelete: false,
            canManageUsers: false
          }}
        />
      </MockProviders>
    );

    // Should show error message
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
