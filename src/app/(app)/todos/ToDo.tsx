"use client";

import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, CardActions, IconButton, Stack, Chip, Box, 
  Avatar, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Tooltip, LinearProgress, Checkbox 
} from '@mui/material';
import { 
  Edit, Delete, Share, AccessTime, PushPin, Archive, Lock, LockOpen, 
  Visibility, MoreVert, Comment, Download, Analytics, Label, CheckCircle,
  RadioButtonUnchecked, Flag, CalendarToday, Repeat, Link
} from '@mui/icons-material';
import { ToDo } from "../../../types/notes";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const MotionCard = motion(Card);

interface ToDoComponentProps {
  todo: ToDo;
  onEdit?: (todo: ToDo) => void;
  onDelete?: (todoId: string) => void;
  onShare?: (todoId: string) => void;
  onToggleStatus?: (todoId: string, status: ToDo['status']) => void;
  onArchive?: (todoId: string, archived: boolean) => void;
}

const priorityColors = {
  low: '#4CAF50',
  medium: '#FF9800', 
  high: '#F44336',
  urgent: '#9C27B0'
};

const statusIcons = {
  pending: <RadioButtonUnchecked />,
  in_progress: <AccessTime />,
  completed: <CheckCircle />,
  cancelled: <Archive />
};

export default function ToDoComponent({ 
  todo, 
  onEdit, 
  onDelete, 
  onShare, 
  onToggleStatus,
  onArchive 
}: ToDoComponentProps) {
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    router.push(`/todos/${todo._id}/edit`);
    handleMenuClose();
  };

  const handleShare = () => {
    setShareDialogOpen(true);
    handleMenuClose();
  };

  const handleToggleStatus = () => {
    const nextStatus = todo.status === 'completed' ? 'pending' : 'completed';
    onToggleStatus?.(todo._id, nextStatus);
    handleMenuClose();
  };

  const handleArchive = () => {
    onArchive?.(todo._id, true);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo?')) {
      onDelete?.(todo._id);
    }
    handleMenuClose();
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== 'completed';

  return (
    <>
      <MotionCard 
        whileHover={{ 
          y: -4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: todo.status === 'completed' 
            ? 'linear-gradient(145deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)'
            : isOverdue
            ? 'linear-gradient(145deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.05) 100%)'
            : 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
          backdropFilter: 'blur(10px)',
          border: todo.status === 'completed'
            ? '1px solid rgba(76,175,80,0.3)'
            : isOverdue
            ? '1px solid rgba(244,67,54,0.3)'
            : '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          opacity: todo.status === 'completed' ? 0.8 : 1
        }}
      >
        {/* Header with status icon and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={handleToggleStatus}>
              {statusIcons[todo.status]}
            </IconButton>
            <Chip 
              label={todo.priority}
              size="small"
              sx={{ 
                backgroundColor: priorityColors[todo.priority],
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
            {todo.is_encrypted ? <Lock color="primary" fontSize="small" /> : <LockOpen color="action" fontSize="small" />}
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
          {/* Title */}
          <Typography 
            variant="h6" 
            component="h3"
            sx={{ 
              mb: 1,
              fontWeight: 600,
              lineHeight: 1.3,
              cursor: 'pointer',
              textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={() => router.push(`/todos/${todo._id}`)}
          >
            {todo.title}
          </Typography>

          {/* Description */}
          {todo.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                mb: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.4
              }}
            >
              {todo.description}
            </Typography>
          )}

          {/* Due date and reminder */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            {todo.due_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday fontSize="small" color={isOverdue ? "error" : "action"} />
                <Typography 
                  variant="caption" 
                  color={isOverdue ? "error" : "text.secondary"}
                  sx={{ fontWeight: isOverdue ? 600 : 400 }}
                >
                  Due: {formatDate(todo.due_date)}
                </Typography>
              </Box>
            )}
            
            {todo.reminder && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Reminder: {formatDate(todo.reminder)}
                </Typography>
              </Box>
            )}

            {todo.recurrence && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Repeat fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Repeats {todo.recurrence.type}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
              {todo.tags.slice(0, 3).map((tag) => (
                <Chip 
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              ))}
              {todo.tags.length > 3 && (
                <Chip 
                  label={`+${todo.tags.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              )}
            </Stack>
          )}

          {/* Linked notes */}
          {todo.linked_notes && todo.linked_notes.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Link fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {todo.linked_notes.length} linked note{todo.linked_notes.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {/* Sharing indicator */}
          {todo.shared_with && todo.shared_with.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Share fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Shared with {todo.shared_with.length} user{todo.shared_with.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </CardContent>

        {/* Footer with dates and actions */}
        <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(todo.updated_at)}
          </Typography>
          
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" onClick={handleEdit}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleShare}
              disabled={!todo.is_encrypted}
            >
              <Share fontSize="small" />
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
        <MenuItem onClick={handleToggleStatus}>
          {statusIcons[todo.status]} 
          <Typography sx={{ ml: 1 }}>
            Mark as {todo.status === 'completed' ? 'Pending' : 'Complete'}
          </Typography>
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <Archive fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleShare} disabled={!todo.is_encrypted}>
          <Share fontSize="small" sx={{ mr: 1 }} />
          Share
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
        <DialogTitle>Share ToDo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share "{todo.title}" with other users or generate a public link.
          </Typography>
          {/* TODO: Implement sharing UI */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Share</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}