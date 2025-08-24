'use client';

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Avatar,
  AvatarGroup,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  Lock as PrivateIcon,
  Group as CollaborativeIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface NoteCardProps {
  id: string;
  title: string;
  excerpt: string;
  tags: { name: string; color: string }[];
  collaborators?: { id: string; name: string; avatar?: string }[];
  isPrivate: boolean;
  isFavorite: boolean;
  commentCount: number;
  lastModified: string;
  onClick?: () => void;
}

export default function NoteCard({
  id,
  title,
  excerpt,
  tags,
  collaborators = [],
  isPrivate,
  isFavorite,
  commentCount,
  lastModified,
  onClick,
}: NoteCardProps) {
  const theme = useTheme();
  const [favorite, setFavorite] = useState(isFavorite);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Share note:', id);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('More actions for note:', id);
  };

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 8px 20px rgba(0, 0, 0, 0.1),
            inset 0 1px 2px rgba(255, 255, 255, 0.1)
          `,
        },
        '&:active': {
          transform: 'translateY(-4px) scale(1.01)',
        },
      }}
    >
      {/* Header with status indicators */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          p: 2,
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {isPrivate ? (
            <PrivateIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          ) : (
            <CollaborativeIcon sx={{ fontSize: 16, color: 'primary.main' }} />
          )}
          {collaborators.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: '0.7rem' } }}>
              {collaborators.map((collaborator) => (
                <Avatar key={collaborator.id} src={collaborator.avatar}>
                  {collaborator.name.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Box>
        
        <IconButton
          size="small"
          onClick={handleMoreClick}
          sx={{
            opacity: 0.7,
            '&:hover': { opacity: 1 },
          }}
        >
          <MoreIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pt: 0, pb: 1 }}>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 1,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
            mb: 2,
          }}
        >
          {excerpt}
        </Typography>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag.name}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            ))}
            {tags.length > 3 && (
              <Chip
                label={`+${tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        )}
      </CardContent>

      {/* Footer */}
      <CardActions
        sx={{
          justifyContent: 'space-between',
          px: 2,
          pb: 2,
          pt: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {lastModified}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {commentCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {commentCount}
              </Typography>
            </Box>
          )}
          
          <IconButton
            size="small"
            onClick={handleShareClick}
            sx={{ p: 0.5 }}
          >
            <ShareIcon sx={{ fontSize: 16 }} />
          </IconButton>
          
          <IconButton
            size="small"
            onClick={handleFavoriteClick}
            sx={{
              p: 0.5,
              color: favorite ? 'error.main' : 'text.secondary',
              '&:hover': {
                color: 'error.main',
                transform: 'scale(1.1)',
              },
            }}
          >
            <FavoriteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
}