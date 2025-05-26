"use client";

import React from 'react';
import {
  Paper, Box, Typography, List, ListItem, ListItemText, Divider,
  IconButton, Tooltip, Chip, Stack, LinearProgress, Card, CardContent
} from '@mui/material';
import { Psychology, Refresh, Lightbulb, TrendingUp, Schedule } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Note } from '../types/notes';

const MotionPaper = motion(Paper);

interface NoteInsightsProps {
  note?: Note;
  content?: string;
  onApplySuggestion?: (suggestion: string) => void;
  onRefresh?: () => void;
}

export default function NoteInsights({ note, content, onApplySuggestion, onRefresh }: NoteInsightsProps) {
  // Use note's AI metadata if available, otherwise generate mock insights
  const insights = note?.ai_metadata || {
    readingTime: Math.ceil((content?.split(' ').length || 0) / 200),
    topics: ['General'],
    keyPoints: [],
    sentiment: 'neutral',
    summary: content?.substring(0, 150) + (content && content.length > 150 ? '...' : ''),
    suggestions: [
      'Consider breaking down the long paragraph into smaller sections',
      'Add code examples to illustrate the concepts',
      'Include a summary section at the end'
    ]
  };

  const analytics = note?.analytics || {
    view_count: 0,
    edit_count: 0,
    share_count: 0,
    last_accessed: new Date().toISOString()
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#F44336';
      case 'neutral': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getClarity = (content: string) => {
    if (!content) return 0;
    const sentences = content.split('.').filter(s => s.trim().length > 0);
    const avgWordsPerSentence = content.split(' ').length / sentences.length;
    return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 2));
  };

  const clarity = getClarity(content || note?.content || '');

  return (
    <MotionPaper
      elevation={2}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: 3, height: '100%', overflow: 'auto' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology color="primary" />
          AI Insights
        </Typography>
        <Tooltip title="Refresh analysis">
          <IconButton size="small" onClick={onRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ p: 1 }}>
          <CardContent sx={{ p: '8px !important' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Reading Time
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule fontSize="small" />
              {insights.readingTime}m
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ p: 1 }}>
          <CardContent sx={{ p: '8px !important' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Views
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp fontSize="small" />
              {analytics.view_count}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <List dense>
        {/* Topics */}
        <ListItem sx={{ px: 0 }}>
          <ListItemText 
            primary="Suggested Topics"
            secondary={
              <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                {insights.topics?.map((topic, index) => (
                  <Chip 
                    key={index}
                    label={topic}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Stack>
            }
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        {/* Key Points */}
        {insights.keyPoints && insights.keyPoints.length > 0 && (
          <>
            <ListItem sx={{ px: 0, display: 'block' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Key Concepts</Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {insights.keyPoints.map((point, index) => (
                  <Typography 
                    key={index}
                    component="li" 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 0.5 }}
                  >
                    {point}
                  </Typography>
                ))}
              </Box>
            </ListItem>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Improvements */}
        {insights.suggestions && insights.suggestions.length > 0 && (
          <>
            <ListItem sx={{ px: 0, display: 'block' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="primary" fontSize="small" />
                Suggestions for Improvement
              </Typography>
              <Stack spacing={1}>
                {insights.suggestions.map((suggestion, index) => (
                  <Paper 
                    key={index}
                    variant="outlined" 
                    sx={{ p: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => onApplySuggestion?.(suggestion)}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {suggestion}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </ListItem>

            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Content Analysis */}
        <ListItem sx={{ px: 0, display: 'block' }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Content Analysis</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Sentiment</Typography>
              <Chip 
                label={insights.sentiment || 'neutral'}
                size="small"
                sx={{ 
                  backgroundColor: getSentimentColor(insights.sentiment || 'neutral'),
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Clarity Score</Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(clarity)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={clarity} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  bgcolor: clarity > 70 ? '#4CAF50' : clarity > 40 ? '#FF9800' : '#F44336'
                }
              }}
            />
          </Box>

          {note && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Edit Count</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics.edit_count}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Share Count</Typography>
                <Typography variant="body2" color="text.secondary">
                  {analytics.share_count}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Last Accessed</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(analytics.last_accessed).toLocaleDateString()}
                </Typography>
              </Box>
            </>
          )}
        </ListItem>

        {/* Summary */}
        {insights.summary && (
          <>
            <Divider sx={{ my: 2 }} />
            <ListItem sx={{ px: 0, display: 'block' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Summary</Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="body2" color="text.secondary">
                  {insights.summary}
                </Typography>
              </Paper>
            </ListItem>
          </>
        )}
      </List>
    </MotionPaper>
  );
}