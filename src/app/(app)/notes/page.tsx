"use client";

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Typography, Box, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Stack, Chip, Paper, IconButton, Card, CardContent,
  Alert,
  Tab,
  Tabs,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Add, Search, ViewModule, ViewList } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { listNotes as appwriteListNotes, createNote as appwriteCreateNote, updateNote as appwriteUpdateNote, deleteNote as appwriteDeleteNote } from '@/lib/appwrite';
import { useLoading } from '@/components/ui/LoadingContext';
import type { Notes, Tags } from '@/types/appwrite.d';
import NoteComponent from './Note';
import NoteViewer from './NoteViewer';
import { Drawer } from '@mui/material';

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
  const { showLoading, hideLoading } = useLoading();
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
    status: '',
    tags: []
  });
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedNote, setSelectedNote] = useState<Notes | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNoteClick = (note: Notes) => {
    setSelectedNote(note);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedNote(null);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      showLoading('Loading your notes...');
      try {
        const res = await appwriteListNotes();
        setNotes(Array.isArray(res.documents) ? res.documents as Notes[] : []);
      } catch (error) {
        setNotes([]);
        console.error('Failed to fetch notes:', error);
      } finally {
        hideLoading();
      }
    };
    fetchNotes();
  }, [showLoading, hideLoading]);

  // Create Note
  const handleCreateNote = async () => {
    if (!newNote.title?.trim()) return;
    setCreating(true);
    try {
      const doc = await appwriteCreateNote({
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
      await appwriteDeleteNote(noteId);
      setNotes((prev) => prev.filter((note) => (note as any).$id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleTogglePublic = async (noteId: string, isPublic: boolean) => {
    try {
      await appwriteUpdateNote(noteId, { isPublic });
      setNotes((prev) =>
        prev.map((note) =>
          (note as any).$id === noteId ? { ...note, isPublic } : note
        )
      );
    } catch (error) {
      console.error('Failed to toggle public status:', error);
    }
  };

  // Filtering & Sorting
  const filteredNotes = notes.filter((note) => {
    if (searchTerm && !note.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !note.content?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filters.status && note.status !== filters.status) {
      return false;
    }
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
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
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
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.paper' }}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
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
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'background.paper' }}>
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
                    onClick={() => handleNoteClick(note)}
                    style={{ cursor: 'pointer' }}
                  >
                    <NoteComponent
                      note={note}
                      onDelete={handleDeleteNote}
                      onTogglePublic={handleTogglePublic}
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
        <MotionGrid container spacing={3}>
          <AnimatePresence>
            {sortedNotes
              .filter(note => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return new Date(note.updatedAt || '') > sevenDaysAgo;
              })
              .map((note, index) => (
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
                  />
                </motion.div>
              </Grid>
            ))}
          </AnimatePresence>
        </MotionGrid>
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total Notes</Typography>
              <Typography variant="h4">{notes.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Public Notes</Typography>
              <Typography variant="h4">{notes.filter(n => n.isPublic).length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Private Notes</Typography>
              <Typography variant="h4">{notes.filter(n => !n.isPublic).length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Notes by Status</Typography>
              <Typography>Drafts: {notes.filter(n => n.status === 'draft').length}</Typography>
              <Typography>Published: {notes.filter(n => n.status === 'published').length}</Typography>
              <Typography>Archived: {notes.filter(n => n.status === 'archived').length}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add note"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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
            <FormControlLabel
              control={
                <Switch
                  checked={newNote.isPublic || false}
                  onChange={(e) => setNewNote({ ...newNote, isPublic: e.target.checked })}
                />
              }
              label="Public Note"
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

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', md: '60%', lg: '50%' },
            height: '100%',
          },
        }}
      >
        <NoteViewer note={selectedNote} onClose={handleDrawerClose} />
      </Drawer>
    </MotionContainer>
  );
}