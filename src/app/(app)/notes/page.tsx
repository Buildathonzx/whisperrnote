"use client";

import { Container, Typography, Fab, Box, Grid } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Note } from "../../../types/notes";
import NoteComponent from "./Note";
import { motion } from "framer-motion";

const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

const dummyNotes: Note[] = [
  {
    id: "1",
    title: "First Note",
    content: "This is the content of the first note.",
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Second Note",
    content: "This is the content of the second note.",
    createdAt: new Date(),
  },
];

export default function NotesPage() {
  return (
    <MotionContainer 
      maxWidth="lg" 
      sx={{ py: 4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        px: 2 
      }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #3B82F6 30%, #EC4899 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Your Notes
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {dummyNotes.map((note, index) => (
          <MotionGrid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <NoteComponent note={note} />
          </MotionGrid>
        ))}
      </Grid>

      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
        }}
        component={motion.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Add />
      </Fab>
    </MotionContainer>
  );
}
