import { Box, Container, Typography, Button, Stack } from '@mui/material';
import Link from "next/link";

export default function Home() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        gap: 4,
        py: 4 
      }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          WhisperNote
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          A modern, secure note-taking application for your thoughts and ideas.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            component={Link}
            href="/login"
            variant="contained"
            size="large"
          >
            Login
          </Button>
          <Button
            component={Link}
            href="/signup"
            variant="outlined"
            size="large"
          >
            Sign Up
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
