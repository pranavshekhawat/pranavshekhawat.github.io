import React, { useState, useEffect } from 'react';
import { subscribeToUserCollection, addUserDoc, updateUserDoc, deleteUserDoc } from '../utils/userDataHelper';
import LabNavbar from './LabNavbar';

/**
 * LabNotes - General lab journal and notes
 * Route: /lab/notes
 * 
 * Features:
 * - Rich text notes with categories
 * - Search and filter
 * - Pin important notes
 * - Tags for organization
 * - Export notes
 */

const NOTE_CATEGORIES = [
  { id: 'general', label: '📝 General', color: '#607d8b' },
  { id: 'recipe_idea', label: '💡 Recipe Ideas', color: '#ff9800' },
  { id: 'experiment', label: '🧪 Experiments', color: '#9c27b0' },
  { id: 'technique', label: '🔧 Techniques', color: '#2196f3' },
  { id: 'supplier', label: '🏪 Suppliers', color: '#4caf50' },
  { id: 'troubleshooting', label: '🔍 Troubleshooting', color: '#f44336' },
  { id: 'learning', label: '📚 Learning', color: '#00bcd4' },
];

function LabNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  // New note form state
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [],
    pinned: false,
  });
  const [tagInput, setTagInput] = useState('');

  // Load notes
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = subscribeToUserCollection('notes', (data) => {
        // Sort by createdAt descending
        const sorted = [...data].sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setNotes(sorted);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading notes:', error);
      setLoading(false);
    }
    return () => unsub();
  }, []);

  // Filter notes
  const filteredNotes = notes.filter(note => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = note.title?.toLowerCase().includes(query);
      const matchesContent = note.content?.toLowerCase().includes(query);
      const matchesTags = note.tags?.some(t => t.toLowerCase().includes(query));
      if (!matchesTitle && !matchesContent && !matchesTags) return false;
    }
    
    // Category filter
    if (filterCategory !== 'all' && note.category !== filterCategory) return false;
    
    // Pinned filter
    if (showPinnedOnly && !note.pinned) return false;
    
    return true;
  });

  // Sort: pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // Create new note
  const createNote = async () => {
    if (!newNote.title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      await addUserDoc('notes', {
        ...newNote,
      });
      setNewNote({ title: '', content: '', category: 'general', tags: [], pinned: false });
      setEditMode(false);
      setSelectedNote(null);
    } catch (error) {
      alert('Failed to create note: ' + error.message);
    }
  };

  // Update note
  const updateNote = async () => {
    if (!selectedNote?.id) return;

    try {
      await updateUserDoc('notes', selectedNote.id, {
        ...newNote,
      });
      setEditMode(false);
      setSelectedNote({ ...selectedNote, ...newNote });
    } catch (error) {
      alert('Failed to update note: ' + error.message);
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    if (window.confirm('Delete this note permanently?')) {
      try {
        await deleteUserDoc('notes', noteId);
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
        }
      } catch (error) {
        alert('Failed to delete note: ' + error.message);
      }
    }
  };

  // Toggle pin
  const togglePin = async (note) => {
    try {
      await updateUserDoc('notes', note.id, { pinned: !note.pinned });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !newNote.tags.includes(tagInput.trim())) {
      setNewNote(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag) => {
    setNewNote(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  // Start editing existing note
  const startEdit = (note) => {
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category || 'general',
      tags: note.tags || [],
      pinned: note.pinned || false,
    });
    setEditMode(true);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    if (selectedNote) {
      setNewNote({
        title: selectedNote.title,
        content: selectedNote.content,
        category: selectedNote.category || 'general',
        tags: selectedNote.tags || [],
        pinned: selectedNote.pinned || false,
      });
    } else {
      setNewNote({ title: '', content: '', category: 'general', tags: [], pinned: false });
    }
  };

  // Export notes
  const exportNotes = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      notes: sortedNotes,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-notes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div>
        <LabNavbar />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: '2em', marginBottom: 16 }}>⏳</div>
          <div>Loading notes...</div>
        </div>
      </div>
    );
  }

  const getCategoryInfo = (categoryId) => NOTE_CATEGORIES.find(c => c.id === categoryId) || NOTE_CATEGORIES[0];

  return (
    <div>
      <LabNavbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 100px)', overflow: 'hidden' }}>
        {/* Left Sidebar - Notes List */}
        <div style={{ 
          width: 350, 
          borderRight: '1px solid #e0e0e0', 
          display: 'flex', 
          flexDirection: 'column',
          background: '#fafafa',
        }}>
          {/* Search & Filters */}
          <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
            <input
              type="text"
              placeholder="🔍 Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #ddd',
                borderRadius: 8,
                fontSize: '0.95em',
                marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: '0.85em',
                }}
              >
                <option value="all">All Categories</option>
                {NOTE_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowPinnedOnly(!showPinnedOnly)}
                style={{
                  padding: '8px 12px',
                  background: showPinnedOnly ? '#ffc107' : '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                📌
              </button>
            </div>
          </div>

          {/* New Note Button */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
            <button
              onClick={() => {
                setSelectedNote(null);
                setNewNote({ title: '', content: '', category: 'general', tags: [], pinned: false });
                setEditMode(true);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '1em',
              }}
            >
              + New Note
            </button>
          </div>

          {/* Notes List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {sortedNotes.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
                {searchQuery || filterCategory !== 'all' ? 'No matching notes' : 'No notes yet. Create your first note!'}
              </div>
            ) : (
              sortedNotes.map(note => {
                const catInfo = getCategoryInfo(note.category);
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setEditMode(false);
                      setNewNote({
                        title: note.title,
                        content: note.content,
                        category: note.category || 'general',
                        tags: note.tags || [],
                        pinned: note.pinned || false,
                      });
                    }}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      background: selectedNote?.id === note.id ? '#e3f2fd' : '#fff',
                      borderLeft: `4px solid ${catInfo.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      {note.pinned && <span>📌</span>}
                      <span style={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {note.title || 'Untitled'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85em', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.content?.substring(0, 80) || 'No content'}
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.75em', color: '#999' }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                      {note.tags?.length > 0 && (
                        <span style={{ marginLeft: 8 }}>
                          {note.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                          {note.tags.length > 2 && ` +${note.tags.length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: 12, borderTop: '1px solid #e0e0e0', background: '#fff', fontSize: '0.85em', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
            <span>{sortedNotes.length} note(s)</span>
            <button onClick={exportNotes} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer' }}>
              Export All
            </button>
          </div>
        </div>

        {/* Right Panel - Note View/Edit */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {!selectedNote && !editMode ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4em', marginBottom: 16 }}>📝</div>
                <div>Select a note or create a new one</div>
              </div>
            </div>
          ) : editMode ? (
            /* Edit Mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: 'none',
                    borderBottom: '2px solid #e0e0e0',
                    fontSize: '1.5em',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    padding: '8px 14px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    fontSize: '0.95em',
                  }}
                >
                  {NOTE_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newNote.pinned}
                    onChange={(e) => setNewNote(prev => ({ ...prev, pinned: e.target.checked }))}
                  />
                  📌 Pin note
                </label>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {newNote.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 10px',
                      background: '#e3f2fd',
                      borderRadius: 12,
                      fontSize: '0.85em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, color: '#666' }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      fontSize: '0.9em',
                    }}
                  />
                  <button
                    onClick={addTag}
                    style={{
                      padding: '8px 14px',
                      background: '#f5f5f5',
                      border: '1px solid #ddd',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Content */}
              <textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                style={{
                  flex: 1,
                  padding: 16,
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  fontSize: '1em',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: '10px 20px',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={selectedNote ? updateNote : createNote}
                  style={{
                    padding: '10px 24px',
                    background: '#4caf50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {selectedNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.6em' }}>
                      {selectedNote.pinned && <span style={{ marginRight: 8 }}>📌</span>}
                      {selectedNote.title}
                    </h1>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12, color: '#666', fontSize: '0.9em' }}>
                      <span style={{
                        padding: '3px 10px',
                        background: getCategoryInfo(selectedNote.category).color,
                        color: '#fff',
                        borderRadius: 4,
                        fontSize: '0.85em',
                      }}>
                        {getCategoryInfo(selectedNote.category).label}
                      </span>
                      <span>Created: {new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                      {selectedNote.updatedAt !== selectedNote.createdAt && (
                        <span>Updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => togglePin(selectedNote)}
                      style={{
                        padding: '8px 12px',
                        background: selectedNote.pinned ? '#ffc107' : '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      📌
                    </button>
                    <button
                      onClick={() => startEdit(selectedNote)}
                      style={{
                        padding: '8px 16px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      style={{
                        padding: '8px 12px',
                        background: '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {selectedNote.tags?.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedNote.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '4px 10px',
                        background: '#e3f2fd',
                        borderRadius: 12,
                        fontSize: '0.85em',
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.8, 
                  fontSize: '1.05em',
                  color: '#333',
                }}>
                  {selectedNote.content || 'No content'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LabNotes;
