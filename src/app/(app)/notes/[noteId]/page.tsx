"use client";

import { Container, Paper, TextField, Button, Box, IconButton } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

export default function NotePage({ params }: { params: { noteId: string } }) {
  const router = useRouter();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => router.back()}
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowBack />
        </IconButton>
      </Box>

      <MotionPaper
        elevation={2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ p: 3 }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="Title"
          sx={{ 
            mb: 3,
            '& .MuiInputBase-input': {
              fontSize: '2rem',
              fontWeight: 600
            }
          }}
        />
        
        <TextField
          fullWidth
          multiline
          variant="standard"
          placeholder="Start writing your note..."
          minRows={12}
          sx={{
            '& .MuiInputBase-input': {
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }
          }}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            component={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Changes
          </Button>
        </Box>
      </MotionPaper>
    </Container>
  );
}