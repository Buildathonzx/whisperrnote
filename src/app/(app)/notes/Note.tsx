import { Card, CardContent, Typography, CardActions, IconButton } from '@mui/material';
import { Edit, Delete, Share } from '@mui/icons-material';
import { Note } from "../../../../types/notes";

export default function NoteComponent({ note }: { note: Note }) {
  return (
    <Card sx={{ 
      mb: 2, 
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3,
      }
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {note.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {note.content}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Created: {note.createdAt.toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="edit">
          <Edit />
        </IconButton>
        <IconButton aria-label="delete">
          <Delete />
        </IconButton>
        <IconButton aria-label="share">
          <Share />
        </IconButton>
      </CardActions>
    </Card>
  );
}
