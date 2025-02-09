import React, { useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useBlockchain } from './providers/BlockchainProvider';
import { generateEncryptionKey } from '@/lib/encryption/crypto';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  noteId?: string;
  onSave?: () => void;
}

export default function NoteEditor({ 
  initialContent = '', 
  initialTitle = '',
  noteId,
  onSave 
}: NoteEditorProps) {
  const { client } = useBlockchain();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const handleSave = async () => {
    if (!client) {
      setError('Not connected to blockchain');
      return;
    }

    try {
      setIsSaving(true);
      const { publicKey, privateKey } = await generateEncryptionKey();
      
      if (noteId) {
        // Update existing note
        await client.updateNote(noteId, content, publicKey, {
          title,
          tags: [] // TODO: Add tag support
        });
      } else {
        // Create new note
        await client.createNote(content, title, publicKey);
      }

      // Store private key securely
      localStorage.setItem(`note_key_${noteId || 'new'}`, privateKey);
      
      setSuccess(true);
      onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="title"
          label="Note Title"
          name="title"
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
        />

        <Box sx={{ mt: 2, mb: 2 }}>
          <EditorContent editor={editor} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !title || !content}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Note'}
          </Button>
        </Box>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">
          Note saved successfully
        </Alert>
      </Snackbar>
    </Paper>
  );
}
