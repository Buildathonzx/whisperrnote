"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Box, Stack,
  TextField, IconButton, Chip, Paper, List, ListItem, ListItemText,
  InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Autocomplete, Accordion, AccordionSummary, AccordionDetails,
  Avatar, Tooltip, LinearProgress, Divider
} from '@mui/material';
import {
  Search, FilterList, Clear, TrendingUp, Schedule,
  ExpandMore, Person, Notes, Assignment, Share,
  Psychology, AutoAwesome, Category, Tag
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/auth';
import { searchContent, listNotes, listToDos } from '../../../lib/notes';
import { Note, ToDo, SearchFilters } from '../../../types/notes';

const MotionCard = motion(Card);
const MotionPaper = motion(Paper);

interface SearchResult {
  type: 'note' | 'todo';
  item: Note | ToDo;
  relevanceScore: number;
  matchedFields: string[];
  aiInsights?: {
    summary: string;
    relevantTopics: string[];
    suggestedActions: string[];
  };
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['note', 'todo'],
    tags: [],
    dateRange: undefined,
    notebooks: []
  });
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableNotebooks, setAvailableNotebooks] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
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
    const loadMetadata = async () => {
      if (!userId) return;

      try {
        const [notes, todos] = await Promise.all([
          listNotes(userId),
          listToDos(userId)
        ]);

        // Extract unique tags and notebooks
        const allTags = new Set<string>();
        const allNotebooks = new Set<string>();

        notes.forEach(note => {
          note.tags?.forEach(tag => allTags.add(tag));
          if (note.notebook_id) allNotebooks.add(note.notebook_id);
        });

        todos.forEach(todo => {
          todo.tags?.forEach(tag => allTags.add(tag));
        });

        setAvailableTags(Array.from(allTags));
        setAvailableNotebooks(Array.from(allNotebooks));
      } catch (error) {
        console.error('Error loading metadata:', error);
      }
    };

    loadMetadata();
  }, [userId]);

  const performSearch = useCallback(async (query: string) => {
    if (!userId || !query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchContent(userId, query, filters);
      
      // Simulate AI-enhanced search results with relevance scoring
      const enhancedResults: SearchResult[] = results.map(item => {
        const isNote = 'content' in item;
        const relevanceScore = calculateRelevanceScore(item, query);
        const matchedFields = findMatchedFields(item, query);
        
        return {
          type: isNote ? 'note' : 'todo',
          item,
          relevanceScore,
          matchedFields,
          aiInsights: generateAIInsights(item, query)
        };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(enhancedResults);
      
      // Add to recent searches
      setRecentSearches(prev => {
        const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  const calculateRelevanceScore = (item: Note | ToDo, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title match (highest weight)
    if (item.title.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Content match
    if ('content' in item && item.content.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Description match for todos
    if ('description' in item && item.description?.toLowerCase().includes(queryLower)) {
      score += 5;
    }
    
    // Tags match
    if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) {
      score += 3;
    }
    
    // Recency bonus
    const daysSinceUpdate = (Date.now() - new Date(item.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 5 - daysSinceUpdate);
    
    return Math.round(score * 10) / 10;
  };

  const findMatchedFields = (item: Note | ToDo, query: string): string[] => {
    const fields: string[] = [];
    const queryLower = query.toLowerCase();
    
    if (item.title.toLowerCase().includes(queryLower)) fields.push('title');
    if ('content' in item && item.content.toLowerCase().includes(queryLower)) fields.push('content');
    if ('description' in item && item.description?.toLowerCase().includes(queryLower)) fields.push('description');
    if (item.tags?.some(tag => tag.toLowerCase().includes(queryLower))) fields.push('tags');
    
    return fields;
  };

  const generateAIInsights = (item: Note | ToDo, query: string) => {
    // Simulate AI insights generation
    const insights = {
      summary: `This ${item.type || 'item'} matches your search for "${query}" and appears to be relevant based on its content.`,
      relevantTopics: item.tags?.slice(0, 3) || ['general'],
      suggestedActions: [
        'Review and update',
        'Add to favorites',
        'Share with team'
      ]
    };
    
    return insights;
  };

  const ResultCard = ({ result }: { result: SearchResult }) => (
    <MotionCard
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      sx={{ mb: 2, cursor: 'pointer' }}
      onClick={() => {
        const path = result.type === 'note' 
          ? `/notes/${result.item._id}` 
          : `/todos/${result.item._id}`;
        router.push(path);
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Avatar sx={{ 
                width: 24, 
                height: 24, 
                bgcolor: result.type === 'note' ? 'primary.main' : 'secondary.main' 
              }}>
                {result.type === 'note' ? <Notes fontSize="small" /> : <Assignment fontSize="small" />}
              </Avatar>
              <Typography variant="h6" component="h3" noWrap>
                {result.item.title}
              </Typography>
              <Chip 
                label={`${result.relevanceScore}% match`} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {'content' in result.item 
                ? result.item.content.substring(0, 150) + '...'
                : result.item.description?.substring(0, 150) + '...' || 'No description'
              }
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {result.matchedFields.map(field => (
                <Chip 
                  key={field} 
                  label={`Matched in ${field}`} 
                  size="small" 
                  variant="outlined" 
                  color="success"
                />
              ))}
            </Stack>
          </Box>
        </Box>
        
        {result.aiInsights && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Psychology color="primary" fontSize="small" />
                AI Insights
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Typography variant="body2">
                  {result.aiInsights.summary}
                </Typography>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Relevant Topics:
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    {result.aiInsights.relevantTopics.map(topic => (
                      <Chip key={topic} label={topic} size="small" />
                    ))}
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Suggested Actions:
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    {result.aiInsights.suggestedActions.map(action => (
                      <Typography key={action} variant="body2" sx={{ fontSize: '0.75rem' }}>
                        • {action}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </MotionCard>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Smart Search
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find your notes and todos with AI-powered search and insights
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search your notes and todos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && performSearch(searchQuery)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={1}>
                  {searchQuery && (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton 
                    size="small" 
                    onClick={() => performSearch(searchQuery)}
                    disabled={loading}
                  >
                    <Search />
                  </IconButton>
                </Stack>
              </InputAdornment>
            )
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        {/* Filters */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Content Type</InputLabel>
              <Select
                multiple
                value={filters.types}
                label="Content Type"
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  types: e.target.value as string[]
                }))}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="note">Notes</MenuItem>
                <MenuItem value="todo">Todos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              multiple
              size="small"
              options={availableTags}
              value={filters.tags}
              onChange={(_, newValue) => setFilters(prev => ({
                ...prev,
                tags: newValue
              }))}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Select tags" />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
            />
          </Grid>
        </Grid>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !searchQuery && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Recent searches:
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {recentSearches.map(search => (
                <Chip
                  key={search}
                  label={search}
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery(search);
                    performSearch(search);
                  }}
                  icon={<Schedule fontSize="small" />}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Found {searchResults.length} results
            </Typography>
            
            {searchResults.map((result, index) => (
              <ResultCard key={`${result.type}-${result.item._id}`} result={result} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {searchQuery && !loading && searchResults.length === 0 && (
        <MotionPaper
          sx={{ p: 4, textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </MotionPaper>
      )}
    </Container>
  );
}