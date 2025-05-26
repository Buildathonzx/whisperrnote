"use client";

import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, CardActions, IconButton, Stack, Chip, Box, 
  Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Tooltip, LinearProgress 
} from '@mui/material';
import { 
  Edit, Delete, Share, AccessTime, PushPin, Archive, Lock, LockOpen, 
  Visibility, MoreVert, Comment, Download, Analytics, Label
} from '@mui/icons-material';
import { Note } from "../../../types/notes";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const MotionCard = motion(Card);

interface NoteComponentProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onShare?: (noteId: string) => void;
  onPin?: (noteId: string, pinned: boolean) => void;
  onArchive?: (noteId: string, archived: boolean) => void;
}

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800', 
  high: '#F44336',
  urgent: '#9C27B0'
};

const typeIcons = {
  text: '📝',
  scribble: '✏️',
  audio: '🎵',
  image: '🖼️',
  file: '📎',
  math: '🧮'
};

export default function NoteComponent({ 
  note, 
  onEdit, 
  onDelete, 
  onShare, 
  onPin, 
  onArchive 
}: NoteComponentProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const router = useRouter();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => typeIcons[type as keyof typeof typeIcons] || '📝';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    router.push(`/notes/${note._id}/edit`);
    handleMenuClose();
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handlePin = () => {
    onPin?.(note._id, !note.is_pinned);
    handleMenuClose();
  };

  const handleArchive = () => {
    onArchive?.(note._id, !note.is_archived);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note._id);
    }
    handleMenuClose();
  };

  const readingTimeMinutes = note.ai_metadata?.readingTime || 
    Math.ceil((note.content?.split(' ').length || 0) / 200);

  return (
    <>
      <MotionCard 
        whileHover={{ 
          y: -8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: note.is_pinned 
            ? 'linear-gradient(145deg, rgba(255,235,59,0.1) 0%, rgba(255,235,59,0.05) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(10px)',
          border: note.is_pinned 
            ? '1px solid rgba(255,235,59,0.3)'
            : '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          opacity: note.is_archived ? 0.7 : 1,
          cursor: 'pointer'
        }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('.menu-button')) {
            router.push(`/notes/${note._id}`);
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                {getTypeIcon(note.type)}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexGrow: 1
                }}
              >
                {note.title}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {note.is_pinned && (
                <PushPin sx={{ fontSize: 16, color: 'warning.main' }} />
              )}
              {note.is_encrypted && (
                <Lock sx={{ fontSize: 16, color: 'primary.main' }} />
              )}
              {note.shared_with.length > 0 && (
                <Share sx={{ fontSize: 16, color: 'info.main' }} />
              )}
              <IconButton 
                size="small" 
                onClick={handleMenuOpen}
                className="menu-button"
                sx={{ ml: 1 }}
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>

          {/* Content Preview */}
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.5
            }}
          >
            {note.content || 'No content'}
          </Typography>

          {/* AI Insights */}
          {note.ai_metadata?.summary && (
            <Box sx={{ mb: 2, p: 1, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                AI Summary:
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {note.ai_metadata.summary}
              </Typography>
            </Box>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {note.tags.length > 3 && (
                <Chip
                  label={`+${note.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          )}

          {/* Metadata */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(note.updated_at)}
              </Typography>
            </Box>
            
            {readingTimeMinutes > 0 && (
              <Typography variant="caption" color="text.secondary">
                {readingTimeMinutes} min read
              </Typography>
            )}
          </Box>

          {/* Analytics Summary */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {note.analytics?.view_count || 0}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Edit sx={{ fontSize: 12, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {note.analytics?.edit_count || 0}
              </Typography>
            </Box>

            {note.analytics?.share_count > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Share sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {note.analytics.share_count}
                </Typography>
              </Box>
            )}
          </Box>

          {/* AI Topics */}
          {note.ai_metadata?.topics && note.ai_metadata.topics.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Topics: {note.ai_metadata.topics.slice(0, 3).join(', ')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </MotionCard>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1, fontSize: 20 }} />
          Share
        </MenuItem>
        <MenuItem onClick={handlePin}>
          <PushPin sx={{ mr: 1, fontSize: 20 }} />
          {note.is_pinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <Archive sx={{ mr: 1, fontSize: 20 }} />
          {note.is_archived ? 'Unarchive' : 'Archive'}
        </MenuItem>
        <MenuItem onClick={() => setShowAnalytics(true)}>
          <Analytics sx={{ mr: 1, fontSize: 20 }} />
          Analytics
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Analytics Dialog */}
      <Dialog 
        open={showAnalytics} 
        onClose={() => setShowAnalytics(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Note Analytics</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Engagement
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{note.analytics?.view_count || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Views</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{note.analytics?.edit_count || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Edits</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">{note.analytics?.share_count || 0}</Typography>
                  <Typography variant="caption" color="text.secondary">Shares</Typography>
                </Box>
              </Box>
            </Box>

            {note.ai_metadata?.sentiment && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  AI Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sentiment: {note.ai_metadata.sentiment}
                </Typography>
                {note.ai_metadata.keyPoints && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">Key Points:</Typography>
                    <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                      {note.ai_metadata.keyPoints.slice(0, 3).map((point, index) => (
                        <li key={index}>
                          <Typography variant="caption">{point}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Last Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {note.analytics?.last_accessed 
                  ? formatDate(note.analytics.last_accessed)
                  : 'Never accessed'
                }
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnalytics(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Share Note</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share "{note.title}" with others
          </Typography>
          <Typography variant="caption" color="info.main">
            Sharing functionality will be implemented with the backend integration.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShareDialogOpen(false)}>
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const typeIcons = {
  text: '📝',
  scribble: '✏️',
  audio: '🎵',
  image: '🖼️',
  file: '📎',
  math: '🧮'
};

export default function NoteComponent({ 
  note, 
  onEdit, 
  onDelete, 
  onShare, 
  onPin, 
  onArchive 
}: NoteComponentProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => typeIcons[type as keyof typeof typeIcons] || '📝';

  return (
    <MotionCard 
      whileHover={{ 
        y: -8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: note.is_pinned 
          ? 'linear-gradient(145deg, rgba(255,235,59,0.1) 0%, rgba(255,235,59,0.05) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(10px)',
        border: note.is_pinned 
          ? '1px solid rgba(255,235,59,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        opacity: note.is_archived ? 0.7 : 1
      }}
    >
      {/* Header with type icon and encryption status */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
        <Typography sx={{ fontSize: '1.2rem' }}>
          {getTypeIcon(note.type)}
        </Typography>
        {note.is_encrypted ? (
          <Lock sx={{ fontSize: 16, color: 'primary.main' }} />
        ) : (
          <LockOpen sx={{ fontSize: 16, color: 'text.secondary' }} />
        )}
        {note.is_pinned && (
          <PushPin sx={{ fontSize: 16, color: 'warning.main' }} />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            mb: 2,
            color: 'primary.main',
            pr: 4 // Account for top-right icons
          }}
        >
          {note.title}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {note.content}
        </Typography>

        {/* Tags */}
        {note.tags.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {note.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {note.tags.length > 3 && (
              <Chip
                label={`+${note.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        )}

        {/* Shared with indicator */}
        {note.shared_with.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Share sx={{ fontSize: 14, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              Shared with {note.shared_with.length} user{note.shared_with.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Analytics (toggleable) */}
        {showAnalytics && note.analytics && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              📊 Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="caption">
                👁️ {note.analytics.view_count} views
              </Typography>
              <Typography variant="caption">
                ✏️ {note.analytics.edit_count} edits
              </Typography>
              <Typography variant="caption">
                📤 {note.analytics.share_count} shares
              </Typography>
            </Box>
          </Box>
        )}

        {/* AI Metadata */}
        {note.ai_metadata.summary && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, opacity: 0.8 }}>
            <Typography variant="caption" display="block" gutterBottom>
              🤖 AI Summary
            </Typography>
            <Typography variant="caption">
              {note.ai_metadata.summary}
            </Typography>
          </Box>
        )}

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(note.updated_at)}
            </Typography>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            sx={{ opacity: 0.7 }}
          >
            <Visibility sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 1.5 }}>
        <Box>
          <IconButton 
            size="small" 
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit?.(note)}
          >
            <Edit fontSize="small" />
          </IconButton>
          
          <IconButton 
            size="small"
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShare?.(note._id)}
            disabled={!note.is_encrypted}
          >
            <Share fontSize="small" />
          </IconButton>
        </Box>

        <Box>
          <IconButton 
            size="small"
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPin?.(note._id, !note.is_pinned)}
            color={note.is_pinned ? 'warning' : 'default'}
          >
            <PushPin fontSize="small" />
          </IconButton>

          <IconButton 
            size="small"
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onArchive?.(note._id, !note.is_archived)}
            color={note.is_archived ? 'info' : 'default'}
          >
            <Archive fontSize="small" />
          </IconButton>

          <IconButton 
            size="small"
            color="error"
            component={motion.button}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete?.(note._id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>
    </MotionCard>
  );
}
