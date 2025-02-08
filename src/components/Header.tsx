import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import { NoteAlt } from '@mui/icons-material';

export default function Header() {
  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <NoteAlt sx={{ mr: 2 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 700,
            }}
          >
            WhisperNote
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={Link} href="/login" variant="text">
            Login
          </Button>
          <Button component={Link} href="/signup" variant="contained">
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
