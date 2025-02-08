"use client";

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { Menu as MenuIcon } from '@mui/icons-material';
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
          {/* Replace the note icon with a small logo */}
          <Box sx={{ mr: 2 }}>
            <Image 
              src="/logo/whisperrnote.png" 
              alt="WhisperNote Logo" 
              width={40} 
              height={40} 
              style={{ borderRadius: '4px' }}
            />
          </Box>
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
