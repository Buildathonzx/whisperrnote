import { Card, CardContent, Typography, CardActions, IconButton, Stack, Chip } from '@mui/material';
import { Edit, Delete, Share, AccessTime } from '@mui/icons-material';
import { Note } from "../../../types/notes";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

export default function NoteComponent({ note }: { note: Note }) {
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
        background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600,
            mb: 2,
            color: 'primary.main'
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
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {note.createdAt.toLocaleDateString(undefined, { 
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', p: 1.5 }}>
        <IconButton 
          size="small" 
          component={motion.button}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Edit fontSize="small" />
        </IconButton>
        <IconButton 
          size="small"
          color="error"
          component={motion.button}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Delete fontSize="small" />
        </IconButton>
        <IconButton 
          size="small"
          color="primary"
          component={motion.button}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share fontSize="small" />
        </IconButton>
      </CardActions>
    </MotionCard>
  );
}
