import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import { Menu as MenuIcon, NoteAlt } from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <NoteAlt sx={{ mr: 2, color: 'primary.main' }} />
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

        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={Link} href="/notes">
                My Notes
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} href="/login">
                Login
              </MenuItem>
              <MenuItem onClick={handleClose} component={Link} href="/signup">
                Sign Up
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={Link} href="/notes" color="inherit">
              My Notes
            </Button>
            <Button component={Link} href="/login" variant="text">
              Login
            </Button>
            <Button 
              component={Link} 
              href="/signup" 
              variant="contained" 
              color="primary"
              sx={{ color: 'white' }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
