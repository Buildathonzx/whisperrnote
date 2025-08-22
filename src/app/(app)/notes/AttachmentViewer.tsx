"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Grid, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getFile, deleteFile } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AttachmentViewerProps {
  attachmentIds: string[];
  onAttachmentDeleted: (attachmentId: string) => void;
}

export default function AttachmentViewer({ attachmentIds, onAttachmentDeleted }: AttachmentViewerProps) {
  const [attachments, setAttachments] = useState<Models.File[]>([]);

  useEffect(() => {
    const fetchAttachments = async () => {
      const fetchedAttachments = await Promise.all(
        attachmentIds.map(id => getFile(id, 'notes-attachments'))
      );
      setAttachments(fetchedAttachments);
    };
    if (attachmentIds.length > 0) {
      fetchAttachments();
    }
  }, [attachmentIds]);

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId, 'notes-attachments');
      onAttachmentDeleted(fileId);
      setAttachments(prev => prev.filter(a => a.$id !== fileId));
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Attachments</Typography>
      <Grid container spacing={2}>
        {attachments.map(attachment => (
          <Grid item key={attachment.$id} xs={12} sm={6} md={4}>
            <Card>
              {attachment.mimeType.startsWith('image/') ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={getFile(attachment.$id, 'notes-attachments').href}
                  alt={attachment.name}
                />
              ) : (
                <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h5">{attachment.name}</Typography>
                </Box>
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {attachment.name}
                </Typography>
                <IconButton onClick={() => handleDelete(attachment.$id)}>
                  <Delete />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
