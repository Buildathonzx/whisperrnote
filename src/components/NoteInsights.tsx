"use client";

import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Psychology,
  Lightbulb,
  Category,
  Schedule,
  AutoAwesome,
  Info,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

interface NoteInsightsProps {
  content: string;
  onApplySuggestion?: (suggestion: string) => void;
}

export default function NoteInsights({ content, onApplySuggestion }: NoteInsightsProps) {
  // This would be replaced with actual AI analysis in production
  const mockInsights = {
    readingTime: '3 min read',
    topicSuggestions: ['Technology', 'Programming', 'Web Development'],
    keyConcepts: [
      'React Components',
      'State Management',
      'Performance Optimization'
    ],
    improvements: [
      'Consider breaking down the long paragraph into smaller sections',
      'Add code examples to illustrate the concepts',
      'Include a summary section at the end'
    ],
    sentiment: 'Technical/Educational',
    clarity: 85
  };

  return (
    <MotionPaper
      elevation={2}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      sx={{ p: 3, height: '100%' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology color="primary" />
          AI Insights
        </Typography>
        <Tooltip title="Refresh analysis">
          <IconButton size="small">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <List dense>
        <ListItem>
          <ListItemIcon>
            <Schedule color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Reading Time"
            secondary={mockInsights.readingTime}
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <Category color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Suggested Topics"
            secondary={
              <Box sx={{ mt: 1 }}>
                {mockInsights.topicSuggestions.map((topic) => (
                  <Chip
                    key={topic}
                    label={topic}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            }
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemIcon>
            <Lightbulb color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Key Concepts"
            secondary={
              <List dense>
                {mockInsights.keyConcepts.map((concept, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      • {concept}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            }
          />
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem sx={{ display: 'block' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutoAwesome color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2">
              Suggested Improvements
            </Typography>
          </Box>
          <List dense>
            {mockInsights.improvements.map((improvement, index) => (
              <ListItem 
                key={index}
                sx={{ 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {improvement}
                </Typography>
                <Button 
                  size="small"
                  onClick={() => onApplySuggestion?.(improvement)}
                >
                  Apply
                </Button>
              </ListItem>
            ))}
          </List>
        </ListItem>

        <Divider sx={{ my: 2 }} />

        <ListItem>
          <ListItemIcon>
            <Info color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Content Analysis"
            secondary={
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" gutterBottom>
                  Type: {mockInsights.sentiment}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Clarity Score:
                  </Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={mockInsights.clarity}
                      size={24}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption">
                        {mockInsights.clarity}%
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            }
          />
        </ListItem>
      </List>
    </MotionPaper>
  );
}