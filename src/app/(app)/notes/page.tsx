"use client";

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Stack, Chip, Paper, IconButton, Card, CardContent,
  LinearProgress, Alert,
  Tab,
  Tabs
} from '@mui/material';
import { Add, Search, ViewModule, ViewList } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { listNotes, createNote, updateNote, deleteNote } from '@/lib/appwrite';
import type { Notes, Tags } from '@/types/appwrite.d';
import NoteComponent from './Note';

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

// TabPanel helper
function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notes-tabpanel-${index}`}
      aria-labelledby={`notes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function NotesPage() {
  // States
  const [notes, setNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Notes>>({
    title: '',
    content: '',
    tags: [],
    isPublic: false
  });
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({
    type: '',
    isPinned: false,
    isArchived: false,
    tags: []
  });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const res = await listNotes();
        setNotes(Array.isArray(res.documents) ? res.documents as Notes[] : []);
      } catch (error) {
        setNotes([]);
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Create Note
  const handleCreateNote = async () => {
    if (!newNote.title?.trim()) return;
    setCreating(true);
    try {
      const doc = await createNote({
        ...newNote,
        tags: Array.isArray(newNote.tags) ? newNote.tags : [],
        isPublic: !!newNote.isPublic
      });
      if (doc) {
        setNotes((prev) => [doc, ...prev]);
        setOpen(false);
        setNewNote({
          title: '',
          content: '',
          tags: [],
          isPublic: false
        });
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setCreating(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((note) => note.$id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  // Pin Note
  const handlePinNote = async (noteId: string, pinned: boolean) => {
    try {
      await updateNote(noteId, { isPinned: pinned });
      setNotes((prev) =>
        prev.map((note) =>
          note.$id === noteId ? { ...note, isPinned: pinned } : note
        )
      );
    } catch (error) {
      console.error('Failed to pin note:', error);
    }
  };

  // Archive Note
  const handleArchiveNote = async (noteId: string, archived: boolean) => {
    try {
      await updateNote(noteId, { isArchived: archived });
      setNotes((prev) =>
        prev.map((note) =>
          note.$id === noteId ? { ...note, isArchived: archived } : note
        )
      );
    } catch (error) {
      console.error('Failed to archive note:', error);
    }
  };

  // Filtering & Sorting
  const filteredNotes = notes.filter((note) => {
    if (searchTerm && !note.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !note.content?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Remove references to fields not in Notes type
    if (filters.tags.length > 0 && !filters.tags.some((tag: string) => note.tags?.includes(tag))) return false;
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'createdAt':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      default:
        return new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime();
    }
  });

  const noteStats = {
    total: notes.length
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
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              {viewMode === 'grid' ? <ViewModule /> : <ViewList />}
            </IconButton>
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
          </Stack>
        </Paper>
        {/* Tabs */}
        <Tabs value={currentTab} onChange={(_e: any, newValue: React.SetStateAction<number>) => setCurrentTab(newValue)}>
          <Tab label="All Notes" />
          <Tab label="Recent" />
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
              {searchTerm
                ? 'Try adjusting your search term'
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
                  key={note.$id}
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
            <TextField
              label="Tags (comma separated)"
              fullWidth
              value={Array.isArray(newNote.tags) ? newNote.tags.join(', ') : ''}
              onChange={(e) => setNewNote({ ...newNote, tags: e.target.value.split(',').map(tag => tag.trim()) })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateNote}
            variant="contained"
            disabled={creating || !newNote.title?.trim()}
          >
            {creating ? 'Creating...' : 'Create Note'}
          </Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
}