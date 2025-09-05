"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { getNoteAttachment, deleteNoteAttachment, storage, APPWRITE_BUCKET_NOTES_ATTACHMENTS } from '@/lib/appwrite';
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
        attachmentIds.map(id => getNoteAttachment(id))
      );
      setAttachments(fetchedAttachments);
    };
    if (attachmentIds.length > 0) {
      fetchAttachments();
    }
  }, [attachmentIds]);

  const handleDelete = async (fileId: string) => {
    try {
      await deleteNoteAttachment(fileId);
      onAttachmentDeleted(fileId);
      setAttachments(prev => prev.filter(a => a.$id !== fileId));
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const getImageUrl = (fileId: string): string => {
    const url = storage.getFileView(APPWRITE_BUCKET_NOTES_ATTACHMENTS, fileId);
    return typeof url === 'string' ? url : String(url);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Attachments</Typography>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <div key={attachment.$id}>
            <Card>
              {attachment.mimeType.startsWith('image/') ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={getImageUrl(attachment.$id)}
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
          </div>
        ))}
      </div>
    </Box>
  );
}
