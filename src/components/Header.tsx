"use client";

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useMediaQuery, useTheme, Menu, MenuItem, Switch, Stack } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { Menu as MenuIcon, Settings, AccountCircle, Dashboard, Description, Group, Keyboard } from '@mui/icons-material';
import { useState } from 'react';
import GlobalSearch from './GlobalSearch';
import KeyboardShortcuts from './KeyboardShortcuts';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';

const MotionAppBar = motion(AppBar);

const glassAppBarSx = {
  background: 'rgba(255,255,255,0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.24)',
  margin: '18px auto',
  left: 0,
  right: 0,
  width: { xs: '98%', sm: '96%', md: '90%' },
  position: 'fixed',
  zIndex: 1201,
  animation: 'float3d 3s ease-in-out infinite',
};

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
      <MotionAppBar
        elevation={0}
        sx={glassAppBarSx}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring' }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' }, boxShadow: 3, borderRadius: '12px', overflow: 'hidden' }}>
              <Image 
                src="/logo/whisperrnote.png" 
                alt="WhisperNote Logo" 
                width={44} 
                height={44} 
                style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(59,130,246,0.12)' }}
              />
            </Box>
            <Typography
              variant="h5"
              component={Link}
              href="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 800,
                letterSpacing: 1.5,
                ml: 1,
                display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(90deg,#3B82F6,#EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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
                sx={{
                  background: 'rgba(255,255,255,0.22)',
                  borderRadius: '12px',
                  boxShadow: 2,
                  mr: 1,
                  '&:hover': { background: 'rgba(255,255,255,0.32)' }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    ...glassAppBarSx,
                    minWidth: 180,
                    mt: 1,
                    p: 1,
                    boxShadow: 6,
                  }
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
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
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.22)',
                  boxShadow: 1,
                  fontWeight: 600,
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.32)',
                    boxShadow: 3,
                    transform: 'translateY(-2px) scale(1.04)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="/notes"
                startIcon={<Description />}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.22)',
                  boxShadow: 1,
                  fontWeight: 600,
                  letterSpacing: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.32)',
                    boxShadow: 3,
                    transform: 'translateY(-2px) scale(1.04)',
                  },
                }}
              >
                Notes
              </Button>
              <IconButton
                color="inherit"
                onClick={() => setShowKeyboardShortcuts(true)}
                size="small"
                sx={{
                  background: 'rgba(255,255,255,0.22)',
                  borderRadius: '12px',
                  boxShadow: 1,
                  '&:hover': { background: 'rgba(255,255,255,0.32)' }
                }}
              >
                <Keyboard />
              </IconButton>
              <Switch