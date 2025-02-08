"use client";

import { Container, Grid, Paper, Typography, Button, Box, Card, CardContent, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Folder, MoreVert, NoteAdd, Delete, Edit, Share } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';

const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

interface Collection {
  id: string;
  name: string;
  noteCount: number;
  lastUpdated: string;
}

export default function CollectionsPage() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Example collections data
  const collections: Collection[] = [
    { id: '1', name: 'Work', noteCount: 15, lastUpdated: '2 hours ago' },
    { id: '2', name: 'Personal', noteCount: 8, lastUpdated: 'Yesterday' },
    { id: '3', name: 'Projects', noteCount: 12, lastUpdated: '3 days ago' },
    { id: '4', name: 'Ideas', noteCount: 5, lastUpdated: 'Last week' },
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, collectionId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCollection(collectionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCollection(null);
  };

  const handleCreateCollection = () => {
    // TODO: Implement collection creation
    setIsCreateDialogOpen(false);
    setNewCollectionName('');
  };

  const handleDeleteCollection = () => {
    // TODO: Implement collection deletion
    setIsDeleteDialogOpen(false);
    handleMenuClose();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
        <Typography variant="h4" component="h1">
          Collections
        </Typography>
        <Button
          variant="contained"
          startIcon={<NoteAdd />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          New Collection
        </Button>
      </Box>

      <Grid container spacing={3}>
        {collections.map((collection, index) => (
          <MotionGrid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <MotionCard
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Folder color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h6">{collection.name}</Typography>
                  </Box>
                  <IconButton onClick={(e) => handleMenuOpen(e, collection.id)}>
                    <MoreVert />
                  </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {collection.noteCount} notes
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated {collection.lastUpdated}
                </Typography>
              </CardContent>
            </MotionCard>
          </MotionGrid>
        ))}
      </Grid>

      {/* Collection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem component={Link} href={`/collections/${selectedCollection}`}>
          <Edit sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setIsDeleteDialogOpen(true);
        }} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create Collection Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCollection} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Collection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this collection? All notes within this collection will be moved to the root level.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCollection} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}