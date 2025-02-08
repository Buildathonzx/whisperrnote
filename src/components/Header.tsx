"use client";

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme, Menu, MenuItem, Switch, Stack } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { Menu as MenuIcon, Settings, AccountCircle, Dashboard, Description, Group, Keyboard } from '@mui/icons-material';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import KeyboardShortcuts from './KeyboardShortcuts';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
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
                display: { xs: 'none', sm: 'block' }
              }}
            >
              WhisperNote
            </Typography>
            
            <Box sx={{ mx: 4, flexGrow: 1, maxWidth: 600 }}>
              <GlobalSearch />
            </Box>
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
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleClose} component={Link} href="/dashboard">
                  <Dashboard sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/notes">
                  <Description sx={{ mr: 1 }} /> Notes
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/shared">
                  <Group sx={{ mr: 1 }} /> Shared
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} href="/settings">
                  <Settings sx={{ mr: 1 }} /> Settings
                </MenuItem>
                <MenuItem onClick={() => setShowKeyboardShortcuts(true)}>
                  <Keyboard sx={{ mr: 1 }} /> Keyboard Shortcuts
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                color="inherit"
                component={Link}
                href="/dashboard"
                startIcon={<Dashboard />}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/notes"
                startIcon={<Description />}
              >
                Notes
              </Button>
              <IconButton
                color="inherit"
                onClick={() => setShowKeyboardShortcuts(true)}
                size="small"
              >
                <Keyboard />
              </IconButton>
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                name="darkMode"
                inputProps={{ 'aria-label': 'toggle dark mode' }}
              />
              <IconButton
                color="inherit"
                component={Link}
                href="/settings"
                size="small"
              >
                <Settings />
              </IconButton>
              <IconButton
                color="inherit"
                component={Link}
                href="/profile"
                size="small"
              >
                <AccountCircle />
              </IconButton>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <KeyboardShortcuts 
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </>
  );
};

export default Header;
