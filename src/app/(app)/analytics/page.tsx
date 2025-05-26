"use client";

import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Stack,
  Select, MenuItem, FormControl, InputLabel, Paper, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp, Visibility, Edit, Share, Notes, Assignment,
  Schedule, PieChart, BarChart, Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth';
import { getAnalyticsSummary, listNotes, listToDos } from '../../lib/notes';
import { Analytics, Note, ToDo } from '../../types/notes';

const MotionContainer = motion(Container);
const MotionCard = motion(Card);

interface AnalyticsSummary {
  totalNotes: number;
  totalTodos: number;
  totalViews: number;
  totalEdits: number;
  totalShares: number;
  topNotes: { note: Note; views: number }[];
  activityByDay: { date: string; views: number; edits: number }[];
  contentTypes: { type: string; count: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.$id);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/auth/login');
      }
    };

    initUser();
  }, [router]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        
        // Get analytics data
        const analyticsData = await getAnalyticsSummary(userId, timeRange);
        const notes = await listNotes(userId);
        const todos = await listToDos(userId);

        // Process analytics
        const viewEvents = analyticsData.filter(a => a.event_type === 'view');
        const editEvents = analyticsData.filter(a => a.event_type === 'edit');
        const shareEvents = analyticsData.filter(a => a.event_type === 'share');

        // Group by resource to find top notes
        const notesViews = viewEvents.reduce((acc, event) => {
          if (event.resource_type === 'note') {
            acc[event.resource_id] = (acc[event.resource_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const topNotes = Object.entries(notesViews)
          .map(([noteId, views]) => ({
            note: notes.find(n => n._id === noteId)!,
            views
          }))
          .filter(item => item.note)
          .sort((a, b) => b.views - a.views)
          .slice(0, 5);

        // Group activity by day
        const activityByDay = analyticsData.reduce((acc, event) => {
          const date = new Date(event.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { date, views: 0, edits: 0 };
          }
          if (event.event_type === 'view') acc[date].views++;
          if (event.event_type === 'edit') acc[date].edits++;
          return acc;
        }, {} as Record<string, { date: string; views: number; edits: number }>);

        // Content types distribution
        const contentTypes = notes.reduce((acc, note) => {
          const type = note.type || 'text';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setAnalytics({
          totalNotes: notes.length,
          totalTodos: todos.length,
          totalViews: viewEvents.length,
          totalEdits: editEvents.length,
          totalShares: shareEvents.length,
          topNotes,
          activityByDay: Object.values(activityByDay),
          contentTypes: Object.entries(contentTypes).map(([type, count]) => ({ type, count }))
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [userId, timeRange]);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <MotionCard
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 600 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </MotionCard>
  );

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <LinearProgress sx={{ width: 200 }} />
        </Box>
      </Container>
    );
  }

  return (
    <MotionContainer
      maxWidth="xl"
      sx={{ py: 4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <MenuItem value="day">Last Day</MenuItem>
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh data">
            <IconButton onClick={() => window.location.reload()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Notes"
            value={analytics?.totalNotes || 0}
            icon={<Notes fontSize="large" />}
            color="#2196F3"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={analytics?.totalViews || 0}
            icon={<Visibility fontSize="large" />}
            color="#4CAF50"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Edits"
            value={analytics?.totalEdits || 0}
            icon={<Edit fontSize="large" />}
            color="#FF9800"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Shares"
            value={analytics?.totalShares || 0}
            icon={<Share fontSize="large" />}
            color="#9C27B0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Notes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Most Viewed Notes
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Note</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Views</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.topNotes.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {item.note.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={item.note.type} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {item.views}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Content Types */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChart color="primary" />
                Content Distribution
              </Typography>
              
              <Stack spacing={2}>
                {analytics?.contentTypes.map((item, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {item.type}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.count}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / (analytics?.totalNotes || 1)) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: `hsl(${index * 60}, 70%, 50%)`
                        }
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChart color="primary" />
                Activity Timeline
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Views</TableCell>
                      <TableCell align="right">Edits</TableCell>
                      <TableCell align="right">Total Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.activityByDay.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(day.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">{day.views}</TableCell>
                        <TableCell align="right">{day.edits}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {day.views + day.edits}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </MotionContainer>
  );
}