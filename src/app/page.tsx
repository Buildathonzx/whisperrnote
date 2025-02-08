import { Box, Container, Typography, Button, Stack, Paper, Grid } from '@mui/material';
import { Security, Speed, Create } from '@mui/icons-material';
import Link from "next/link";

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 8
      }}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                WhisperNote
              </Typography>
              <Typography variant="h5" paragraph>
                A modern, secure note-taking application for your thoughts and ideas.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  href="/signup"
                  variant="outlined"
                  size="large"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Secure
              </Typography>
              <Typography color="text.secondary">
                Your notes are encrypted and secure
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Fast
              </Typography>
              <Typography color="text.secondary">
                Lightning-fast performance
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
              <Create sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Easy to Use
              </Typography>
              <Typography color="text.secondary">
                Simple and intuitive interface
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
