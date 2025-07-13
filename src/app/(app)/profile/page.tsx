"use client";

import { Container, Typography, Paper, Avatar, Box, Button, Grid, Stack, Chip, Divider } from '@mui/material';
import { Edit, AccessTime, NoteAdd, Folder } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { account } from '@/lib/appwrite';
import { getUmiAccount } from '@/integrations/umi/wallet';
import { UmiCounterContract } from '@/integrations/umi/contract';

const MotionPaper = motion(Paper);

const umiEnabled = process.env.NEXT_PUBLIC_INTEGRATION_TOGGLE_UMI === 'true';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [umiWallet, setUmiWallet] = useState<string | null>(null);
  const [umiError, setUmiError] = useState('');
  const [counter, setCounter] = useState<number | null>(null);
  const [counterLoading, setCounterLoading] = useState(false);
  const [counterError, setCounterError] = useState('');

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

  const handleConnectUmiWallet = async () => {
    try {
      const address = await getUmiAccount();
      setUmiWallet(address);
      setUmiError('');
    } catch (err) {
      setUmiError('Failed to connect Umi wallet');
    }
  };

  const fetchCounter = async () => {
    setCounterLoading(true);
    try {
      const contract = new UmiCounterContract();
      const res = await contract.getCounter();
      // Parse result as needed, assuming res is a BigInt or number
      setCounter(Number(res));
      setCounterError('');
    } catch (err) {
      setCounterError('Failed to fetch counter');
    } finally {
      setCounterLoading(false);
    }
  };

  const handleIncrementCounter = async () => {
    setCounterLoading(true);
    try {
      const contract = new UmiCounterContract();
      await contract.incrementCounter();
      await fetchCounter();
    } catch (err) {
      setCounterError('Failed to increment counter');
    } finally {
      setCounterLoading(false);
    }
  };

  useEffect(() => {
    if (umiEnabled) fetchCounter();
  }, [umiEnabled]);

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
          {umiEnabled && (
            <Paper elevation={1} sx={{ mt: 3, p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" gutterBottom>
                Umi Integration
              </Typography>
              {umiWallet ? (
                <Typography variant="body2" color="primary">
                  Connected Wallet: {umiWallet}
                </Typography>
              ) : (
                <Button variant="contained" onClick={handleConnectUmiWallet}>
                  Connect Umi Wallet
                </Button>
              )}
              {umiError && (
                <Typography color="error" variant="caption">
                  {umiError}
                </Typography>
              )}
              {/* Counter Contract Section */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Counter Contract
              </Typography>
              {counterLoading ? (
                <Typography>Loading counter...</Typography>
              ) : counterError ? (
                <Typography color="error">{counterError}</Typography>
              ) : (
                <Typography variant="body2">
                  Counter Value: {counter !== null ? counter : 'N/A'}
                </Typography>
              )}
              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={handleIncrementCounter}
                disabled={counterLoading || !umiWallet}
              >
                Increment Counter
              </Button>
            </Paper>
          )}
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