"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { listComments, createComment } from '@/lib/appwrite';
import type { Comments } from '@/types/appwrite.d';

interface CommentsProps {
  noteId: string;
}

export default function CommentsSection({ noteId }: CommentsProps) {
  const [comments, setComments] = useState<Comments[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await listComments(noteId);
        setComments(res.documents as Comments[]);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      }
    };
    fetchComments();
  }, [noteId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await createComment(noteId, newComment);
      setComments(prev => [comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ mt: 1 }}
          onClick={handleAddComment}
        >
          Add Comment
        </Button>
      </Box>
      <List>
        {comments.map((comment, index) => (
          <div key={comment.$id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={comment.content}
                secondary={`by ${comment.userId} on ${new Date(comment.$createdAt).toLocaleDateString()}`}
              />
            </ListItem>
            {index < comments.length - 1 && <Divider variant="inset" component="li" />}
          </div>
        ))}
      </List>
    </Box>
  );
}
