'use client';

import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Note as NoteIcon,
  Person as PersonIcon,
  Label as TagIcon,
  History as HistoryIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { logout } from '@/lib/auth';

interface SearchResult {
  id: string;
  type: 'note' | 'user' | 'tag';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
}

interface GlobalSearchProps {
  onSearchResult?: (result: SearchResult) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const mockRecentSearches = [
  'Project Alpha',
  'Meeting notes',
  'React components',
];

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'note',
    title: 'Project Alpha Documentation',
    subtitle: 'Last updated 2 hours ago',
    icon: <NoteIcon />,
  },
  {
    id: '2',
    type: 'note',
    title: 'Meeting Notes - Q1 Planning',
    subtitle: 'Last updated yesterday',
    icon: <NoteIcon />,
  },
  {
    id: '3',
    type: 'user',
    title: 'John Doe',
    subtitle: '@johndoe',
    icon: <PersonIcon />,
  },
  {
    id: '4',
    type: 'tag',
    title: 'project-management',
    subtitle: '12 notes',
    icon: <TagIcon />,
  },
];

export default function GlobalSearch({
  onSearchResult,
  placeholder = "Search notes, people, and tags...",
  showFilters = true,
}: GlobalSearchProps) {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      // Simulate search API call
      const filteredResults = mockSearchResults.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.subtitle?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filteredResults);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  const handleResultClick = (result: SearchResult) => {
    onSearchResult?.(result);
    setShowResults(false);
    setQuery('');
  };

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigateToNotes = () => {
    router.push('/notes');
    handleUserMenuClose();
  };

  const handleNavigateToTags = () => {
    router.push('/tags');
    handleUserMenuClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      authLogout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleUserMenuClose();
  };

  const filters = [
    { id: 'notes', label: 'Notes', icon: <NoteIcon /> },
    { id: 'people', label: 'People', icon: <PersonIcon /> },
    { id: 'tags', label: 'Tags', icon: <TagIcon /> },
  ];

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      {/* Search Input */}
      <TextField
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            borderRadius: '16px',
            '& fieldset': {
              border: `2px solid ${theme.palette.divider}`,
            },
            '&:hover fieldset': {
              border: `2px solid ${theme.palette.primary.main}40`,
            },
            '&.Mui-focused fieldset': {
              border: `2px solid ${theme.palette.primary.main}`,
            },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {query && (
                  <IconButton size="small" onClick={handleClear}>
                    <ClearIcon />
                  </IconButton>
                )}
                {showFilters && (
                  <IconButton size="small">
                    <FilterIcon />
                  </IconButton>
                )}
                {user && (
                  <IconButton 
                    size="small" 
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    {user.name ? (
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.75rem',
                          backgroundColor: 'primary.main'
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    ) : (
                      <AccountIcon />
                    )}
                  </IconButton>
                )}
              </InputAdornment>
            ),
          }
        }}
      />

      {/* Active Filters */}
      {showFilters && activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          {activeFilters.map((filter) => {
            const filterData = filters.find(f => f.id === filter);
            return (
              <Chip
                key={filter}
                label={filterData?.label}
                icon={filterData?.icon}
                onDelete={() => handleFilterToggle(filter)}
                size="small"
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiChip-deleteIcon': {
                    color: 'primary.contrastText',
                  },
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Search Results Dropdown */}
      {showResults && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1000,
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: '12px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `
              0 8px 32px rgba(0, 0, 0, 0.12),
              0 4px 16px rgba(0, 0, 0, 0.08)
            `,
          }}
        >
          {results.length > 0 ? (
            <List>
              {results.map((result, index) => (
                <ListItem
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  sx={{
                    borderRadius: '8px',
                    mx: 1,
                    mb: index === results.length - 1 ? 1 : 0,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: result.type === 'note' 
                        ? 'primary.main' 
                        : result.type === 'user' 
                          ? 'secondary.main' 
                          : 'success.main'
                    }}
                  >
                    {result.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.title}
                    secondary={result.subtitle}
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: 600,
                          fontSize: '0.9rem',
                        }
                      },
                      secondary: {
                        sx: {
                          fontSize: '0.8rem',
                        }
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : query ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No results found for "{query}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ px: 2, pb: 1, color: 'text.secondary' }}>
                Recent searches
              </Typography>
              <List>
                {mockRecentSearches.map((search, index) => (
                  <ListItem
                    key={index}
                    onClick={() => setQuery(search)}
                    sx={{
                      borderRadius: '8px',
                      mx: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '12px',
              minWidth: 180,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: `
                0 8px 32px rgba(0, 0, 0, 0.12),
                0 4px 16px rgba(0, 0, 0, 0.08)
              `,
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleNavigateToNotes}>
          <ListItemIcon>
            <NoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Notes" />
        </MenuItem>
        <MenuItem onClick={handleNavigateToTags}>
          <ListItemIcon>
            <TagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Tags" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </Box>
  );
}