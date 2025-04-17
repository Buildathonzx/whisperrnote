"use client";

import { Container, Typography, Paper, Avatar, Box, Button, Grid, Stack, Chip, Divider } from '@mui/material';
import { Edit, AccessTime, NoteAdd, Folder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';

const MotionPaper = motion(Paper);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setError('Failed to load user info'))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map((n) => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <MotionPaper
            elevation={2}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ p: 3, textAlign: 'center' }}
          >
            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    margin: '0 auto 1rem',
                    bgcolor: 'primary.main',
                    fontSize: '3rem'
                  }}
                >
                  {getInitials(user?.name, user?.email)}
                </Avatar>
                <Typography variant="h5" gutterBottom>{user?.name || 'No Name'}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email || 'No Email'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  sx={{ mt: 2 }}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </MotionPaper>
        </Grid>

        {/* Stats and Activity */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <MotionPaper
              elevation={2}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Grid container>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>42</Typography>
                  <Typography variant="body2" color="text.secondary">Total Notes</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>7</Typography>
                  <Typography variant="body2" color="text.secondary">Collections</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>15</Typography>
                  <Typography variant="body2" color="text.secondary">Shared Notes</Typography>
                </Grid>
              </Grid>
            </MotionPaper>

            {/* Recent Activity */}
            <MotionPaper
              elevation={2}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <NoteAdd color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">Created new note "Project Ideas"</Typography>
                    <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Folder color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">Created new collection "Work"</Typography>
                    <Typography variant="caption" color="text.secondary">Yesterday</Typography>
                  </Box>
                </Box>
              </Stack>
            </MotionPaper>

            {/* Most Used Tags */}
            <MotionPaper
              elevation={2}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" gutterBottom>Most Used Tags</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="work" color="primary" variant="outlined" />
                <Chip label="ideas" color="primary" variant="outlined" />
                <Chip label="personal" color="primary" variant="outlined" />
                <Chip label="todo" color="primary" variant="outlined" />
                <Chip label="projects" color="primary" variant="outlined" />
              </Box>
            </MotionPaper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}