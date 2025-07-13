'use client';

import { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardMedia, Box, CircularProgress, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { listPublicNotes, getUser } from '@/lib/appwrite';
import type { Notes, Users } from '@/types/appwrite.d';
import Link from 'next/link';

const MotionCard = motion(Card);

// Hardcoded featured note IDs (replace with actual IDs)
const FEATURED_NOTE_IDS: never[] = [
  // Example: '664e1a2b003e2bb950f7', '664e1a2b003e2bb950f8'
];

export default function BlogPage() {
  const [featuredNotes, setFeaturedNotes] = useState<Notes[]>([]);
  const [publicNotes, setPublicNotes] = useState<Notes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      // Fetch featured notes
      const featured: Notes[] = [];
      for (const id of FEATURED_NOTE_IDS) {
        try {
          const note = await listPublicNotes([id]);
          if (note && note.documents && note.documents.length > 0) {
            featured.push(note.documents[0]);
          }
        } catch {}
      }
      setFeaturedNotes(featured);

      // Fetch all public notes (blogs)
      const res = await listPublicNotes();
      setPublicNotes(res.documents || []);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Blog
      </Typography>
      {/* Featured Blogs */}
      {featuredNotes.length > 0 && (
        <>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Featured Blogs
          </Typography>
          <Grid container spacing={4}>
            {featuredNotes.map((note) => (
              <Grid item xs={12} md={4} key={note.$id}>
                <Link href={`/blog/${note.$id}`} passHref>
                  <MotionCard
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    sx={{ cursor: 'pointer', height: '100%' }}
                  >
                    {/* Optionally display cover image if available */}
                    {note.coverImage && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={note.coverImage}
                        alt={note.title || 'Blog Cover'}
                      />
                    )}
                    <CardContent>
                      <Chip label="Featured" color="primary" sx={{ mb: 1 }} />
                      <Typography variant="h5" component="div">
                        {note.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {note.excerpt || (note.content ? note.content.substring(0, 100) + '...' : '')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <AuthorInfo userId={note.userId || ''} />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                        </Typography>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Link>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      {/* All Public Blogs */}
      <Typography variant="h5" sx={{ mt: 6, mb: 2 }}>
        All Blogs
      </Typography>
      <Grid container spacing={4}>
        {publicNotes.map((note) => (
          <Grid item xs={12} md={4} key={note.$id}>
            <Link href={`/blog/${note.$id}`} passHref>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{ cursor: 'pointer', height: '100%' }}
              >
                {note.coverImage && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={note.coverImage}
                    alt={note.title || 'Blog Cover'}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" component="div">
                    {note.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {note.excerpt || (note.content ? note.content.substring(0, 100) + '...' : '')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AuthorInfo userId={note.userId || ''} />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </MotionCard>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

// Helper to display author info
function AuthorInfo({ userId }: { userId: string }) {
  const [author, setAuthor] = useState<Users | null>(null);

  useEffect(() => {
    if (userId) {
      getUser(userId).then(setAuthor).catch(() => setAuthor(null));
    }
  }, [userId]);

  if (!author) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', mr: 1 }}>
        {author.name ? author.name[0] : author.email ? author.email[0] : '?'}
      </Avatar>
      <Typography variant="caption">{author.name || author.email || 'Unknown'}</Typography>
    </Box>
  );
}
