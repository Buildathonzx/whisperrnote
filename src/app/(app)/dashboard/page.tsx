"use client";

import { Container, Grid, Paper, Typography, Button, Box, Card, CardContent, IconButton, LinearProgress, Stack, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { NoteAdd, ArrowUpward, ArrowDownward, Folder, Label, TrendingUp, Star, AccessTime } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, John
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your notes
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Notes', value: '42', icon: NoteAdd, trend: '+5 this week' },
          { title: 'Collections', value: '7', icon: Folder, trend: 'Most active: Work' },
          { title: 'Tags', value: '23', icon: Label, trend: '3 new this month' },
          { title: 'Storage Used', value: '28%', icon: TrendingUp, trend: '2.3 MB of 10 MB' },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <stat.icon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">{stat.title}</Typography>
                </Box>
                <Typography variant="h4" gutterBottom>{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.trend}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <MotionPaper
            elevation={2}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ p: 3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Recent Activity</Typography>
              <Button component={Link} href="/notes">View All Notes</Button>
            </Box>
            <List>
              {[
                { title: 'Project Ideas', time: '2 hours ago', icon: Star, action: 'Created new note' },
                { title: 'Meeting Notes', time: 'Yesterday', icon: AccessTime, action: 'Updated note' },
                { title: 'Tasks', time: '2 days ago', icon: NoteAdd, action: 'Shared note' },
              ].map((activity, index) => (
                <ListItem
                  key={activity.title}
                  component={motion.li}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItemIcon>
                    <activity.icon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.title}
                    secondary={`${activity.action} • ${activity.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </MotionPaper>
        </Grid>

        {/* Storage and Quick Actions */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <MotionPaper
              elevation={2}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" gutterBottom>Storage</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  2.3 MB of 10 MB used
                </Typography>
                <LinearProgress variant="determinate" value={23} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Button variant="outlined" fullWidth>Upgrade Storage</Button>
            </MotionPaper>

            <MotionPaper
              elevation={2}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              sx={{ p: 3 }}
            >
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<NoteAdd />}
                  component={Link}
                  href="/notes/new"
                >
                  Create New Note
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Folder />}
                  component={Link}
                  href="/notes/collections"
                >
                  Manage Collections
                </Button>
              </Stack>
            </MotionPaper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}