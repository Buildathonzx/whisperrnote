import React, { useState } from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Box, Chip, Menu, MenuItem } from '@mui/material';
import { Share, MoreVert, Lock, LockOpen, Edit, Delete } from '@mui/icons-material';
import Link from 'next/link';

interface NoteCardProps {
  id: string;
  title: string;
  updatedAt: Date;
  isEncrypted: boolean;
  sharedWith: string[];
  onDelete?: () => Promise<void>;
  onShare?: () => void;
}

export default function NoteCard({
  id,
  title,
  updatedAt,
  isEncrypted,
  sharedWith,
  onDelete,
  onShare
}: NoteCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
        handleMenuClose();
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      handleMenuClose();
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="h2" noWrap>
            {title}
          </Typography>
          {isEncrypted ? <Lock color="primary" /> : <LockOpen color="action" />}
        </Box>

        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date(updatedAt).toLocaleDateString()}
        </Typography>

        {sharedWith.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" display="block" gutterBottom>
              Shared with:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {sharedWith.map((user) => (
                <Chip
                  key={user}
                  label={user}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions disableSpacing>
        <IconButton 
          component={Link} 
          href={`/notes/${id}`}
          aria-label="edit note"
        >
          <Edit />
        </IconButton>
        
        <IconButton 
          aria-label="share note"
          onClick={handleShare}
          disabled={!isEncrypted}
        >
          <Share />
        </IconButton>

        <IconButton
          aria-label="note options"
          onClick={handleMenuOpen}
          sx={{ marginLeft: 'auto' }}
        >
          <MoreVert />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleDelete} disabled={isDeleting}>
            <Delete sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
}
