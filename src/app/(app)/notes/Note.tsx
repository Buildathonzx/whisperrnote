"use client";

import React, { useState } from 'react';
import {
  Card, CardContent, Typography, CardActions, IconButton, Stack, Chip, Box,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Tooltip
} from '@mui/material';
import { Edit, Delete, Share, AccessTime, PushPin, Archive, Lock, LockOpen, Visibility, MoreVert, Analytics } from '@mui/icons-material';
import type { Notes } from "@/types/appwrite.d";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const MotionCard = motion(Card);

interface NoteComponentProps {
  note: Notes;
  onEdit?: (note: Notes) => void;
  onDelete?: (noteId: string) => void;
  onShare?: (noteId: string) => void;
  onTogglePublic?: (noteId: string, isPublic: boolean) => void;
}

export default function NoteComponent({
  note,
  onEdit,
  onDelete,
  onShare,
  onTogglePublic
}: NoteComponentProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const router = useRouter();

  // Reading time calculation (basic: 200 words per minute)
  const readingTimeMinutes = note.content
    ? Math.max(1, Math.ceil(note.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))
    : 1;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    // fallback for invalid date
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    router.push(`/notes/${note.$id}`);
    handleMenuClose();
  };

  const handleShare = () => {
    // Open share dialog instead of direct call
    setShareDialogOpen(true);
    handleMenuClose();
    onShare?.(note.$id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete?.(note.$id);
    }
    handleMenuClose();
  };

  const handleTogglePublic = () => {
    onTogglePublic?.(note.$id, !note.isPublic);
    handleMenuClose();
  };

  // Use only valid properties from Notes type
  const isPublic = note.isPublic ?? false;
  const isEncrypted = (note as any).isEncrypted ?? note.is_encrypted;

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
          backdropFilter: 'blur(10px)',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem' }}>
              📝
            </Typography>
            {isPublic ? <LockOpen color="action" fontSize="small" /> : <Lock color="primary" fontSize="small" />}
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ ml: 'auto' }}
          >
            <MoreVert />
          </IconButton>
        </Box>
        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{
              mb: 1,
              fontWeight: 600,
              lineHeight: 1.3,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => router.push(`/notes/${note.$id}`)}
          >
            {note.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.4
            }}
          >
            {note.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
            {note.content && note.content.length > 150 && '...'}
          </Typography>
          {/* Attachments indicator */}
          {note.attachments && note.attachments.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                📎 {note.attachments.length} attachment{note.attachments.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              ))}
              {note.tags.length > 3 && (
                <Chip
                  label={`+${note.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              )}
            </Stack>
          )}
          {/* Analytics preview */}
          {note.analytics && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Tooltip title="View count">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {note.analytics.view_count || 0}
                  </Typography>
                </Box>
              </Tooltip>
              
              <Tooltip title="Reading time">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTime fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {readingTimeMinutes}m
                  </Typography>
                </Box>
              </Tooltip>

              {note.shared_with && note.shared_with.length > 0 && (
                <Tooltip title={`Shared with ${note.shared_with.length} user${note.shared_with.length > 1 ? 's' : ''}`}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Share fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {note.shared_with.length}
                    </Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>
          )}
        </CardContent>

        {/* Footer with dates and actions */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {/* Try both snake_case and camelCase */}
            {formatDate(note.updatedAt ?? note.updated_at)}
          </Typography>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={handleEdit}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleShare}
              disabled={isEncrypted === false}
            >
              <Share fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => setShowAnalytics(true)}>
              <Analytics fontSize="small" />
            </IconButton>
          </Stack>
        </CardActions>
      </MotionCard>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleTogglePublic}>
          <LockOpen fontSize="small" sx={{ mr: 1 }} />
          {isPublic ? 'Make Private' : 'Make Public'}
        </MenuItem>
        <MenuItem onClick={handleShare} disabled={isEncrypted === false}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => setShowAnalytics(true)}>
          <Analytics fontSize="small" sx={{ mr: 1 }} />
          Analytics
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

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
            Share "{note.title}" with other users or generate a public link.
          </Typography>
          {/* TODO: Implement sharing UI */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Share</Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog 
        open={showAnalytics} 
        onClose={() => setShowAnalytics(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Note Analytics</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="h6">{note.analytics?.view_count || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Views</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{note.analytics?.edit_count || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Edits</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{note.analytics?.share_count || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Shares</Typography>
            </Box>
            <Box>
              <Typography variant="h6">{readingTimeMinutes}m</Typography>
              <Typography variant="caption" color="text.secondary">Reading Time</Typography>
            </Box>
          </Box>
          
          {note.ai_metadata && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>AI Insights</Typography>
              {note.ai_metadata.topics && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Topics:</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {note.ai_metadata.topics.map((topic: string) => (
                      <Chip key={topic} label={topic} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}
              {note.ai_metadata.keyPoints && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Key Points:</Typography>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {note.ai_metadata.keyPoints.map((point: string, index: number) => (
                      <li key={index}>
                        <Typography variant="caption">{point}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAnalytics(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}