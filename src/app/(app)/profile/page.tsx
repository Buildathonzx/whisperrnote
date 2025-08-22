"use client";

import { Container, Typography, Paper, Avatar, Box, Button, Grid, Stack, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Edit, AccessTime, NoteAdd, Folder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { account, updateUser, uploadProfilePicture, getProfilePicture, listNotes, listTags, listCollaborators, listActivityLogs } from '@/lib/appwrite';
const MotionPaper = motion(Paper);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>({});
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    totalNotes: 0,
    totalTags: 0,
    sharedNotes: 0,
  });
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const user = await account.get();
        setUser(user);
        setEditUser(user);
        if (user.prefs?.profilePicId) {
          const url = await getProfilePicture(user.prefs.profilePicId);
          setProfilePicUrl(url.href);
        }

        const notesRes = await listNotes();
        const tagsRes = await listTags();
        const activityLogRes = await listActivityLogs();

        const sharedNotes = notesRes.documents.filter(note => note.collaborators && note.collaborators.length > 0);

        setStats({
          totalNotes: notesRes.total,
          totalTags: tagsRes.total,
          sharedNotes: sharedNotes.length,
        });

        setActivityLog(activityLogRes.documents);
        setTags(tagsRes.documents.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0)));

      } catch (error) {
        setError('Failed to load user info');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndStats();
  }, []);

  const handleOpenEditDialog = () => {
    setEditUser(user);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveChanges = async () => {
    try {
      if (profilePic) {
        const uploadedFile = await uploadProfilePicture(profilePic);
        await updateUser(user.$id, { ...editUser, prefs: { ...user.prefs, profilePicId: uploadedFile.$id } });
      } else {
        await updateUser(user.$id, editUser);
      }
      const updatedUser = await account.get();
      setUser(updatedUser);
      handleCloseEditDialog();
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

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
            sx={{ p: 3, textAlign: 'center', backgroundColor: 'background.paper' }}
          >
            {loading ? (
              <Typography>Loading...</Typography>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <>
                <Avatar
                  src={profilePicUrl || undefined}
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
                  onClick={handleOpenEditDialog}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </MotionPaper>
        </Grid>
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editUser.name || ''}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Wallet Address"
              type="text"
              fullWidth
              variant="standard"
              value={editUser.walletAddress || ''}
              onChange={(e) => setEditUser({ ...editUser, walletAddress: e.target.value })}
            />
            <Button
              variant="contained"
              component="label"
              sx={{ mt: 2 }}
            >
              Upload Profile Picture
              <input
                type="file"
                hidden
                onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save</Button>
          </DialogActions>
        </Dialog>
        {/* Stats and Activity */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <MotionPaper
              elevation={2}
              sx={{ backgroundColor: 'background.paper' }}
            >
              <Grid container>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>{stats.totalNotes}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Notes</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>{stats.totalTags}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Tags</Typography>
                </Grid>
                <Grid item xs={4} sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" gutterBottom>{stats.sharedNotes}</Typography>
                  <Typography variant="body2" color="text.secondary">Shared Notes</Typography>
                </Grid>
              </Grid>
            </MotionPaper>

            {/* Recent Activity */}
            <MotionPaper
              elevation={2}
              sx={{ p: 3, backgroundColor: 'background.paper' }}
            >
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <Stack spacing={2}>
                {activityLog.slice(0, 5).map((activity) => (
                  <Box key={activity.$id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <NoteAdd color="primary" />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">{activity.action} {activity.targetType} "{activity.targetId}"</Typography>
                      <Typography variant="caption" color="text.secondary">{new Date(activity.timestamp).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </MotionPaper>

            {/* Most Used Tags */}
            <MotionPaper
              elevation={2}
              sx={{ p: 3, backgroundColor: 'background.paper' }}
            >
              <Typography variant="h6" gutterBottom>Most Used Tags</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.slice(0, 5).map(tag => (
                  <Chip key={tag.$id} label={tag.name} variant="outlined" />
                ))}
              </Box>
            </MotionPaper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}