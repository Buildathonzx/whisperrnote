"use client";

import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Box, Fab, Dialog, DialogTitle, DialogContent, 
  DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Stack, Chip, Tab, Tabs, Switch, FormControlLabel, Autocomplete, Paper,
  IconButton, Card, CardContent, LinearProgress, Alert
} from '@mui/material';
import { 
  Add, FilterList, ViewModule, ViewList, Sort, Search, BookmarkBorder,
  Archive, Share, Delete, Pin, Edit, Visibility, Analytics, Label
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { account } from '@/lib/appwrite';
import { Note, Notebook } from '@/types/notes';
import { createNote, listNotes, createNotebook, listNotebooks, updateNote, generateAIMetadata } from '@/lib/notes';
import NoteComponent from './Note';
import { useRouter } from 'next/navigation';

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notes-tabpanel-${index}`}
      aria-labelledby={`notes-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [notebookDialogOpen, setNotebookDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({ 
    title: '', 
    content: '', 
    type: 'text' as const,
    notebook_id: '',
    tags: [] as string[],
    is_pinned: false,
    is_encrypted: true
  });
  const [newNotebook, setNewNotebook] = useState({
    title: '',
    description: '',
    color: '#3B82F6',
    is_encrypted: true
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [filters, setFilters] = useState({
    notebook_id: '',
    type: '',
    tags: [] as string[],
    is_pinned: false,
    is_archived: false
  });
  const [sortBy, setSortBy] = useState('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    fetchUserAndData();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch notes and notebooks in parallel
        const [notesData, notebooksData] = await Promise.all([
          listNotes(userId, filters),
          listNotebooks(userId)
        ]);
        
        // Transform notes data
        setNotes((notesData.documents || []).map((doc: any) => ({
          _id: doc.$id,
          notebook_id: doc.notebook_id,
          owner_id: doc.owner_id,
          title: doc.title,
          content: doc.content,
          type: doc.type || 'text',
          attachments: doc.attachments || [],
          tags: doc.tags || [],
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          is_pinned: doc.is_pinned || false,
          is_archived: doc.is_archived || false,
          is_deleted: doc.is_deleted || false,
          is_encrypted: doc.is_encrypted || false,
          shared_with: doc.shared_with || [],
          ai_metadata: doc.ai_metadata || {},
          extension_data: doc.extension_data || {},
          analytics: doc.analytics || {
            view_count: 0,
            last_accessed: '',
            edit_count: 0,
            share_count: 0
          }
        })));

        // Transform notebooks data
        setNotebooks((notebooksData.documents || []).map((doc: any) => ({
          _id: doc.$id,
          owner_id: doc.owner_id,
          title: doc.title,
          description: doc.description,
          color: doc.color,
          icon: doc.icon,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          shared_with: doc.shared_with || [],
          is_encrypted: doc.is_encrypted || false,
          metadata: doc.metadata || {}
        })));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, filters]);

  const handleCreateNote = async () => {
    if (!userId || !newNote.title.trim()) return;
    setCreating(true);
    try {
      // Generate AI metadata if enabled
      let aiMetadata = {};
      if (aiEnabled && newNote.content) {
        aiMetadata = await generateAIMetadata(newNote.content);
      }

      const doc = await createNote({
        ...newNote,
        owner_id: userId,
        attachments: [],
        shared_with: [],
        is_archived: false,
        is_deleted: false,
        ai_metadata: aiMetadata,
        extension_data: {},
        analytics: {
          view_count: 0,
          last_accessed: '',
          edit_count: 0,
          share_count: 0
        }
      });
      
      if (doc) {
        const note: Note = {
          _id: doc.$id,
          notebook_id: newNote.notebook_id || undefined,
          owner_id: userId,
          title: newNote.title,
          content: newNote.content,
          type: newNote.type,
          attachments: [],
          tags: newNote.tags,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          is_pinned: newNote.is_pinned,
          is_archived: false,
          is_deleted: false,
          is_encrypted: newNote.is_encrypted,
          shared_with: [],
          ai_metadata: aiMetadata,
          extension_data: {},
          analytics: {
            view_count: 0,
            last_accessed: '',
            edit_count: 0,
            share_count: 0
          }
        };
        setNotes(prev => [note, ...prev]);
        setOpen(false);
        setNewNote({ 
          title: '', 
          content: '', 
          type: 'text',
          notebook_id: '',
          tags: [],
          is_pinned: false,
          is_encrypted: true
        });
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateNotebook = async () => {
    if (!userId || !newNotebook.title.trim()) return;
    try {
      const doc = await createNotebook({
        ...newNotebook,
        owner_id: userId,
        shared_with: [],
        metadata: {}
      });
      
      if (doc) {
        const notebook: Notebook = {
          _id: doc.$id,
          owner_id: userId,
          title: newNotebook.title,
          description: newNotebook.description,
          color: newNotebook.color,
          created_at: doc.created_at,
          updated_at: doc.updated_at,
          shared_with: [],
          is_encrypted: newNotebook.is_encrypted,
          metadata: {}
        };
        setNotebooks(prev => [notebook, ...prev]);
        setNotebookDialogOpen(false);
        setNewNotebook({
          title: '',
          description: '',
          color: '#3B82F6',
          is_encrypted: true
        });
      }
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await updateNote(noteId, { is_deleted: true });
      setNotes(prev => prev.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handlePinNote = async (noteId: string, pinned: boolean) => {
    try {
      await updateNote(noteId, { is_pinned: pinned });
      setNotes(prev => prev.map(note => 
        note._id === noteId ? { ...note, is_pinned: pinned } : note
      ));
    } catch (error) {
      console.error('Failed to pin note:', error);
    }
  };

  const handleArchiveNote = async (noteId: string, archived: boolean) => {
    try {
      await updateNote(noteId, { is_archived: archived });
      setNotes(prev => prev.map(note => 
        note._id === noteId ? { ...note, is_archived: archived } : note
      ));
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.notebook_id && note.notebook_id !== filters.notebook_id) return false;
    if (filters.type && note.type !== filters.type) return false;
    if (filters.is_pinned && !note.is_pinned) return false;
    if (filters.is_archived !== note.is_archived) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => note.tags.includes(tag))) return false;
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'created_at':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'view_count':
        return (b.analytics?.view_count || 0) - (a.analytics?.view_count || 0);
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  const noteStats = {
    total: notes.filter(n => !n.is_deleted).length,
    pinned: notes.filter(n => n.is_pinned && !n.is_deleted).length,
    shared: notes.filter(n => n.shared_with.length > 0 && !n.is_deleted).length,
    archived: notes.filter(n => n.is_archived).length
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Loading your notes...</Typography>
      </Container>
    );
  }

  return (
    <MotionContainer 
      maxWidth="lg" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{ py: 4 }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #3B82F6 30%, #8B5CF6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Your Notes
            </Typography>
            
            {/* Stats */}
            <Stack direction="row" spacing={2}>
              <Chip label={`${noteStats.total} Total`} variant="outlined" />
              <Chip label={`${noteStats.pinned} Pinned`} color="warning" />
              <Chip label={`${noteStats.shared} Shared`} color="info" />
              {noteStats.archived > 0 && (
                <Chip label={`${noteStats.archived} Archived`} color="default" />
              )}
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              {viewMode === 'grid' ? <ViewModule /> : <ViewList />}
            </IconButton>
            
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setNotebookDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              New Notebook
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Notebook</InputLabel>
                <Select
                  value={filters.notebook_id}
                  label="Notebook"
                  onChange={(e) => setFilters({ ...filters, notebook_id: e.target.value })}
                >
                  <MenuItem value="">All Notebooks</MenuItem>
                  {notebooks.map((notebook) => (
                    <MenuItem key={notebook._id} value={notebook._id}>
                      {notebook.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.type}
                  label="Type"
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="text">📝 Text</MenuItem>
                  <MenuItem value="scribble">✏️ Scribble</MenuItem>
                  <MenuItem value="audio">🎵 Audio</MenuItem>
                  <MenuItem value="image">🖼️ Image</MenuItem>
                  <MenuItem value="file">📎 File</MenuItem>
                  <MenuItem value="math">🧮 Math</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="updated_at">Last Updated</MenuItem>
                  <MenuItem value="created_at">Created Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="view_count">Most Viewed</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch 
                    checked={filters.is_pinned} 
                    onChange={(e) => setFilters({ ...filters, is_pinned: e.target.checked })}
                  />
                }
                label="Pinned Only"
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={filters.is_archived} 
                    onChange={(e) => setFilters({ ...filters, is_archived: e.target.checked })}
                  />
                }
                label="Show Archived"
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Tabs */}
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="All Notes" />
          <Tab label="Recent" />
          <Tab label="Shared" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Content Tabs */}
      <TabPanel value={currentTab} index={0}>
        {sortedNotes.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notes found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your filters or search term'
                : 'Create your first note to get started'
              }
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
              Create Your First Note
            </Button>
          </Paper>
        ) : (
          <MotionGrid container spacing={3}>
            <AnimatePresence>
              {sortedNotes.map((note, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  md={viewMode === 'grid' ? 4 : 12} 
                  key={note._id}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <NoteComponent 
                      note={note}
                      onDelete={handleDeleteNote}
                      onPin={handlePinNote}
                      onArchive={handleArchiveNote}
                    />
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </MotionGrid>
        )}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Recent notes from the last 7 days
        </Alert>
        {/* Recent notes implementation */}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Notes shared with you or by you
        </Alert>
        {/* Shared notes implementation */}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Analytics and insights about your note usage
        </Alert>
        {/* Analytics implementation */}
      </TabPanel>

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        aria-label="add note" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
        }}
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(true)}
      >
        <Add />
      </Fab>

      {/* Create Note Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Note</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
            
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={6}
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Notebook</InputLabel>
                <Select
                  value={newNote.notebook_id}
                  label="Notebook"
                  onChange={(e) => setNewNote({ ...newNote, notebook_id: e.target.value })}
                >
                  <MenuItem value="">No Notebook</MenuItem>
                  {notebooks.map((notebook) => (
                    <MenuItem key={notebook._id} value={notebook._id}>
                      {notebook.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newNote.type}
                  label="Type"
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value as any })}
                >
                  <MenuItem value="text">📝 Text</MenuItem>
                  <MenuItem value="scribble">✏️ Scribble</MenuItem>
                  <MenuItem value="audio">🎵 Audio</MenuItem>
                  <MenuItem value="image">🖼️ Image</MenuItem>
                  <MenuItem value="file">📎 File</MenuItem>
                  <MenuItem value="math">🧮 Math</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={newNote.tags}
              onChange={(event, newValue) => setNewNote({ ...newNote, tags: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags..."
                />
              )}
            />

            <Stack direction="row" spacing={2}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={newNote.is_pinned} 
                    onChange={(e) => setNewNote({ ...newNote, is_pinned: e.target.checked })}
                  />
                }
                label="Pin Note"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={newNote.is_encrypted} 
                    onChange={(e) => setNewNote({ ...newNote, is_encrypted: e.target.checked })}
                  />
                }
                label="Encrypt Note"
              />

              <FormControlLabel
                control={
                  <Switch 
                    checked={aiEnabled} 
                    onChange={(e) => setAiEnabled(e.target.checked)}
                  />
                }
                label="Generate AI Insights"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNote} 
            variant="contained" 
            disabled={creating || !newNote.title.trim()}
          >
            {creating ? 'Creating...' : 'Create Note'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Notebook Dialog */}
      <Dialog open={notebookDialogOpen} onClose={() => setNotebookDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Notebook</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newNotebook.title}
              onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newNotebook.description}
              onChange={(e) => setNewNotebook({ ...newNotebook, description: e.target.value })}
            />

            <TextField
              label="Color"
              type="color"
              value={newNotebook.color}
              onChange={(e) => setNewNotebook({ ...newNotebook, color: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch 
                  checked={newNotebook.is_encrypted} 
                  onChange={(e) => setNewNotebook({ ...newNotebook, is_encrypted: e.target.checked })}
                />
              }
              label="Encrypt Notebook"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotebookDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateNotebook} 
            variant="contained" 
            disabled={!newNotebook.title.trim()}
          >
            Create Notebook
          </Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
}
