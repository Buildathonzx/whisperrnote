"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { listCollaborators, createCollaborator, deleteCollaborator } from '@/lib/appwrite';
import type { Collaborators, Users } from '@/types/appwrite.d';
import { listUsers } from '@/lib/appwrite';

interface CollaboratorsProps {
  noteId: string;
}

export default function CollaboratorsSection({ noteId }: CollaboratorsProps) {
  const [collaborators, setCollaborators] = useState<Collaborators[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [permission, setPermission] = useState('read');

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const res = await listCollaborators(noteId);
        setCollaborators(res.documents as Collaborators[]);
      } catch (error) {
        console.error('Failed to fetch collaborators:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await listUsers();
        setUsers(res.documents as Users[]);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchCollaborators();
    fetchUsers();
  }, [noteId]);

  const handleAddCollaborator = async () => {
    if (!newCollaboratorEmail.trim()) return;
    const user = users.find(u => u.email === newCollaboratorEmail);
    if (!user) {
      alert('User not found');
      return;
    }
    try {
      const collaborator = await createCollaborator({
        noteId,
        userId: user.$id,
        permission,
      });
      setCollaborators(prev => [collaborator, ...prev]);
      setNewCollaboratorEmail('');
    } catch (error) {
      console.error('Failed to add collaborator:', error);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      await deleteCollaborator(collaboratorId);
      setCollaborators(prev => prev.filter(c => c.$id !== collaboratorId));
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Collaborators</Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="User email"
          value={newCollaboratorEmail}
          onChange={(e) => setNewCollaboratorEmail(e.target.value)}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Permission</InputLabel>
          <Select
            value={permission}
            label="Permission"
            onChange={(e) => setPermission(e.target.value)}
          >
            <MenuItem value="read">Read</MenuItem>
            <MenuItem value="write">Write</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleAddCollaborator}
        >
          Add Collaborator
        </Button>
      </Box>
      <List>
        {collaborators.map((collaborator, index) => (
          <div key={collaborator.$id}>
            <ListItem
              secondaryAction={
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveCollaborator(collaborator.$id)}
                >
                  Remove
                </Button>
              }
            >
              <ListItemText
                primary={collaborator.userId}
                secondary={collaborator.permission}
              />
            </ListItem>
            {index < collaborators.length - 1 && <Divider variant="inset" component="li" />}
          </div>
        ))}
      </List>
    </Box>
  );
}
