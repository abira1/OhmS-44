import React, { useState, useMemo } from 'react';
import { BookOpenIcon, PlusIcon, XIcon, LinkIcon, CalendarIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Permissions } from '../../types';
import { useData } from '../../context/DataContext';
import { useNotes } from '../../hooks/useFirebase';
import { Note } from '../../types/database';
import { mockClasses } from '../../data/mockData';
import SectionLoader from '../SectionLoader';
import { useNotesSearch } from '../../hooks/useSearch';
import { RetroSearchInput } from '../ui/SearchInput';
import { HighlightedText, TruncatedHighlightedText } from '../ui/HighlightedText';
import { useAccessibility } from '../../hooks/useAccessibility';

interface NotesSectionProps {
  isAdmin: boolean;
  permissions: Permissions;
}

const NotesSection: React.FC<NotesSectionProps> = ({ isAdmin, permissions }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { announceToScreenReader } = useAccessibility();

  // Get classes data from context
  const { classes } = useData();

  // Get notes data from Firebase
  const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes();

  // Search functionality
  const {
    filteredItems: searchFilteredNotes,
    isSearching,
    hasResults,
    hasSearchTerm,
    getHighlightedValue
  } = useNotesSearch(notes || [], searchTerm);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    subject: '',
    classLink: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });

  // Collect subjects from routine data and classes
  const subjects = useMemo(() => {
    const subjectSet = new Set<string>();

    // Add subjects from mock routine data
    mockClasses.forEach(cls => {
      if (cls.subject) {
        subjectSet.add(cls.subject);
      }
    });

    // Add subjects from DataContext classes
    Object.values(classes).forEach(cls => {
      if (cls.subject) {
        subjectSet.add(cls.subject);
      }
    });

    // Convert to sorted array and add "Other" option
    const sortedSubjects = Array.from(subjectSet).sort();
    return [...sortedSubjects, 'Other'];
  }, [classes]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteData = {
        ...newNote,
        createdBy: 'admin', // In real app, this would come from auth context
        isActive: true,
        priority: 'medium' as const,
        targetAudience: 'all' as const
      };

      const result = await createNote(noteData);
      if (result.success) {
        setNewNote({
          title: '',
          content: '',
          subject: '',
          classLink: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
      } else {
        console.error('Failed to create note:', result.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleEditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      const result = await updateNote(editingNote.id, newNote);
      if (result.success) {
        setEditingNote(null);
        setNewNote({
          title: '',
          content: '',
          subject: '',
          classLink: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
      } else {
        console.error('Failed to update note:', result.error);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const result = await deleteNote(noteId);
      if (result.success) {
        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete note:', result.error);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      subject: note.subject,
      classLink: note.classLink || '',
      date: note.date
    });
    setShowAddForm(true);
  };

  // Show loading state
  if (loading) {
    return <SectionLoader section="notes" />;
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-vhs flex items-center">
            <BookOpenIcon className="mr-2 h-6 w-6 sm:h-8 sm:w-8 text-retro-purple dark:text-retro-teal" />
            Class Notes
          </h2>
        </div>
        <div className="neu-card p-8 sm:p-12 text-center">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <BookOpenIcon className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-xl font-bold">Error Loading Notes</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-vhs flex items-center">
            <BookOpenIcon className="mr-2 h-6 w-6 sm:h-8 sm:w-8 text-retro-purple dark:text-retro-teal" />
            Class Notes
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Filter:</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center"
              >
                {showAddForm ? (
                  <>
                    <XIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Note
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full">
          <RetroSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search notes by title, content, or subject..."
            isLoading={isSearching}
            resultsCount={hasSearchTerm ? searchFilteredNotes.length : undefined}
            aria-label="Search class notes"
            aria-describedby="search-help"
            onClear={() => {
              setSearchTerm('');
              announceToScreenReader('Search cleared, showing all notes');
            }}
          />
          <div id="search-help" className="sr-only">
            Search through note titles, content, and subjects. Use the clear button or press Escape to reset.
          </div>
        </div>
      </div>

      {/* Add/Edit Note Form */}
      {showAddForm && isAdmin && (
        <div className="neu-card p-6">
          <h3 className="text-xl font-vhs text-retro-purple dark:text-retro-teal mb-4">
            {editingNote ? 'Edit Note' : 'Create New Note'}
          </h3>
          <form onSubmit={editingNote ? handleEditNote : handleAddNote} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <select
                  value={newNote.subject}
                  onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  value={newNote.date}
                  onChange={(e) => setNewNote({ ...newNote, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Note title"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content</label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 h-32"
                placeholder="Note content..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Class Link (Optional)</label>
              <input
                type="url"
                value={newNote.classLink}
                onChange={(e) => setNewNote({ ...newNote, classLink: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="https://meet.google.com/... or https://zoom.us/..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="retro-btn bg-retro-purple dark:bg-retro-teal text-white flex-1"
              >
                {editingNote ? 'Update Note' : 'Create Note'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingNote(null);
                  setNewNote({
                    title: '',
                    content: '',
                    subject: '',
                    classLink: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }}
                className="retro-btn bg-gray-500 text-white px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes Display */}
      {(() => {
        // Start with search-filtered notes if there's a search term
        let baseNotes = hasSearchTerm ? searchFilteredNotes : notes;

        // Apply subject filter
        const filteredNotes = filterSubject === 'all'
          ? baseNotes
          : baseNotes.filter(note => note.subject === filterSubject);

        return filteredNotes.length === 0 ? (
        <div className="neu-card p-8 sm:p-12 text-center">
          <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
            {hasSearchTerm ? (
              <SearchIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
            ) : (
              <BookOpenIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {hasSearchTerm ? 'No Matching Notes Found' : 'No Notes Available'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {hasSearchTerm ? (
              <>
                No notes match your search for "<span className="font-medium text-retro-purple dark:text-retro-teal">{searchTerm}</span>".
                {filterSubject !== 'all' && (
                  <> Try searching in all subjects or adjusting your search terms.</>
                )}
              </>
            ) : isAdmin ? (
              "Start creating class notes to help students access important information and class links."
            ) : (
              "No class notes have been posted yet. Check back later for important updates and class links."
            )}
          </p>
          {hasSearchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('all');
                announceToScreenReader('Search and filters cleared, showing all notes');
              }}
              className="retro-btn bg-retro-purple text-white hover:bg-retro-purple/80 transition-colors"
            >
              Clear Search & Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.id} className="neu-card p-4 sm:p-6 hover:shadow-lg transition-shadow relative">
              {/* Admin Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditNote(note);
                    }}
                    className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                    title="Edit note"
                  >
                    <EditIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(note.id);
                    }}
                    className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400 rounded transition-colors"
                    title="Delete note"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-retro-purple/20 dark:bg-retro-teal/20 text-retro-purple dark:text-retro-teal px-2 py-1 rounded-md font-vhs">
                  <HighlightedText
                    text={note.subject}
                    highlightedText={hasSearchTerm ? getHighlightedValue(note, 'subject') : undefined}
                  />
                </span>
                <span className="text-xs bg-retro-yellow/20 dark:bg-retro-blue/20 text-retro-orange dark:text-retro-yellow px-2 py-1 rounded-md font-vhs flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {new Date(note.date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-vhs text-retro-purple dark:text-retro-teal mb-2">
                <HighlightedText
                  text={note.title}
                  highlightedText={hasSearchTerm ? getHighlightedValue(note, 'title') : undefined}
                />
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <TruncatedHighlightedText
                  text={note.content}
                  highlightedText={hasSearchTerm ? getHighlightedValue(note, 'content') : undefined}
                  maxLength={150}
                  className="line-clamp-3"
                />
              </div>
              {note.classLink && (
                <a
                  href={note.classLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center justify-center w-full mt-3"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Join Class / Access Resource
                </a>
              )}


              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neu-card max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-vhs text-retro-purple dark:text-retro-teal mb-4">
                Delete Note
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteNote(showDeleteConfirm)}
                  className="retro-btn bg-red-500 text-white flex-1"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="retro-btn bg-gray-500 text-white flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default NotesSection;
