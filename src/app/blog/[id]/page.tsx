'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container, Typography, Box, Avatar, CircularProgress, Chip } from '@mui/material';
import { getNote, getUser } from '@/lib/appwrite';
import type { Notes, Users } from '@/types/appwrite.d';

export default function BlogDetailPage() {
  const params = useParams();
  const noteId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';
  const [note, setNote] = useState<Notes | null>(null);
  const [author, setAuthor] = useState<Users | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      if (!noteId) return;
      const n = await getNote(noteId);
      setNote(n);
      if (n?.userId) {
        const u = await getUser(n.userId);
        setAuthor(u);
      }
      setLoading(false);
    };
    fetchNote();
  }, [noteId]);

  if (loading || !note) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 4 }}>
        {note.coverImage && (
          <Box sx={{ mb: 2 }}>
            <img
              src={note.coverImage}
              alt={note.title || 'Blog Cover'}
              style={{
                width: '100%',
                maxHeight: 320,
                objectFit: 'cover',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
              }}
            />
          </Box>
        )}
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          {note.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 1 }}>
            {author?.name ? author.name[0] : author?.email ? author.email[0] : '?'}
          </Avatar>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {author?.name || author?.email || 'Unknown'}
          </Typography>
          <Chip label={note.status || 'Published'} color="primary" size="small" sx={{ mr: 2 }} />
          <Typography variant="caption" color="text.secondary">
            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
          </Typography>
        </Box>
        {note.excerpt && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {note.excerpt}
          </Typography>
        )}
      </Box>
      <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 2, boxShadow: 1 }}>
        {/* Render note content as markdown or HTML */}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: '1.15rem' }}>
          {note.content}
        </Typography>
      </Box>
    </Container>
  );
}
