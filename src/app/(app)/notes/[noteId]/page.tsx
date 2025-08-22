"use client";

import { Container, Paper, TextField, Button, Box, IconButton, Stack, Chip, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Input, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from '@mui/material';
import { ArrowBack, Save, Share, Delete, Label as TagIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getNote as appwriteGetNote, updateNote as appwriteUpdateNote, deleteNote as appwriteDeleteNote, uploadFile, deleteFile } from '@/lib/appwrite';
import type { Notes } from '@/types/appwrite.d';
import CommentsSection from '../Comments';
import CollaboratorsSection from '../Collaborators';
import TagManager from '../TagManager';
import AttachmentViewer from '../AttachmentViewer';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      try {
        const data = await appwriteGetNote(noteId);
        setNote({
          id: data.id,
          userId: data.userId,
          title: data.title || '',
          content: data.content || '',
          tags: data.tags || [],
          isPublic: data.isPublic || false,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
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
      await appwriteUpdateNote(noteId, note);
      const updated = await appwriteGetNote(noteId);
      setNote(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await appwriteDeleteNote(noteId);
    setIsDeleteDialogOpen(false);
    router.push('/notes');
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    try {
      const uploadedFile = await uploadFile(file, 'notes-attachments');
      const attachmentId = uploadedFile.$id;
      const updatedAttachments = [...(note.attachments || []), attachmentId];
      setNote(prev => ({ ...prev, attachments: updatedAttachments }));
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    try {
      await deleteFile(attachmentId, 'notes-attachments');
      const updatedAttachments = (note.attachments || []).filter(id => id !== attachmentId);
      setNote(prev => ({ ...prev, attachments: updatedAttachments }));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
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
          <FormControlLabel
            control={
              <Switch
                checked={note.isPublic || false}
                onChange={(e) => setNote(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
            }
            label="Public"
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={note.status || ''}
              label="Status"
              onChange={(e) => setNote(prev => ({ ...prev, status: e.target.value as any }))}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
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
          <TagManager
            selectedTags={note.tags || []}
            onChange={(tags) => setNote(prev => ({ ...prev, tags }))}
          />
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
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Attachments
          </Typography>
          <Input
            type="file"
            onChange={handleAttachmentUpload}
          />
          <AttachmentViewer
            attachmentIds={note.attachments || []}
            onAttachmentDeleted={handleRemoveAttachment}
          />
        </Box>
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
      <CommentsSection noteId={noteId} />
      <CollaboratorsSection noteId={noteId} />
    </Container>
  );
}