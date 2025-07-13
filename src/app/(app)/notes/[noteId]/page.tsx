"use client";

import { Container, Paper, TextField, Button, Box, IconButton, Stack, Chip, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ArrowBack, Save, Share, Delete, Label as TagIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getNote, updateNote, deleteNote } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';

const MotionPaper = motion(Paper);

export default function NotePage({ params }: { params: { noteId: string } }) {
  const router = useRouter();
  const { noteId } = params;
  const [note, setNote] = useState<Partial<Notes>>({
    title: '',
    content: '',
    tags: [],
    isPublic: false
  });
  const [newTag, setNewTag] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const data = await getNote(noteId);
        setNote({
          title: data.title || '',
          content: data.content || '',
          tags: data.tags || [],
          isPublic: data.isPublic || false
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchNote();
  }, [noteId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNote(noteId, note);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteNote(noteId);
    setIsDeleteDialogOpen(false);
    router.push('/notes');
  };

  const addTag = () => {
    if (newTag && !note.tags?.includes(newTag)) {
      setNote(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNote(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <IconButton
          onClick={() => router.back()}
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowBack />
        </IconButton>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setIsDeleteDialogOpen(true)}
            startIcon={<Delete />}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<Share />}
          >
            Share
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={isSaving}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Box>
      <MotionPaper
        elevation={2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ p: 3 }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Title"
          value={note.title}
          onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
          sx={{
            mb: 3,
            '& .MuiInputBase-input': {
              fontSize: '2rem',
              fontWeight: 600
            }
          }}
        />
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
            {(note.tags || []).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => removeTag(tag)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Stack>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Add a tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button
              startIcon={<TagIcon />}
              onClick={addTag}
              variant="outlined"
              size="small"
            >
              Add Tag
            </Button>
          </Box>
        </Box>
        <TextField
          fullWidth
          multiline
          variant="standard"
          placeholder="Start writing your note..."
          value={note.content}
          onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
          minRows={12}
          sx={{
            '& .MuiInputBase-input': {
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }
          }}
        />
      </MotionPaper>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this note? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}