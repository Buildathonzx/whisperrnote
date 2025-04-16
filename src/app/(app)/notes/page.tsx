"use client";

import { Container, Typography, Fab, Box, Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Note } from "../../../types/notes";
import NoteComponent from "./Note";
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { account } from '@/lib/appwrite';

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user and fetch notes
    const fetchUserAndNotes = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        const res = await fetch(`/api/notes?userId=${user.$id}`);
        const data = await res.json();
        setNotes(data.notes?.documents || []);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndNotes();
  }, []);

  const handleCreate = async () => {
    if (!userId) return;
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newNote.title,
        content: newNote.content,
        userId,
        isPublic: false,
        tags: []
      })
    });
    const data = await res.json();
    if (data.note) {
      setNotes((prev) => [data.note, ...prev]);
      setOpen(false);
      setNewNote({ title: '', content: '' });
    }
  };

  return (
    <MotionContainer 
      maxWidth="lg" 
      sx={{ py: 4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: 2 
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Your Notes
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {notes.map((note, index) => (
          <MotionGrid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <NoteComponent note={note} />
          </MotionGrid>
        ))}
      </Grid>

      <Fab 
        color="primary" 
        aria-label="add" 
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>New Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newNote.title}
            onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            minRows={4}
            value={newNote.content}
            onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </MotionContainer>
  );
}
