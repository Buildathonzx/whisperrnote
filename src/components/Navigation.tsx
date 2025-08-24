'use client';

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Fab,
  Badge,
  Avatar,
  Paper,
} from '@mui/material';
import {
  Note as NoteIcon,
  Search as SearchIcon,
  Share as SharedIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useNavigationWithLoading } from '@/lib/useNavigationWithLoading';

// Mobile bottom navigation items following ui.md spec
const mobileNavItems = [
  { text: 'Notes', href: '/notes', icon: <NoteIcon />, id: 'notes' },
  { text: 'Search', href: '/search', icon: <SearchIcon />, id: 'search' },
  { text: 'Create', href: '/create', icon: <AddIcon />, id: 'create', isAction: true },
  { text: 'Shared', href: '/shared', icon: <SharedIcon />, id: 'shared' },
  { text: 'More', href: '/profile', icon: <ProfileIcon />, id: 'more' },
];

// Desktop sidebar items
const sidebarItems = [
  { text: 'Notes', href: '/notes', icon: <NoteIcon /> },
  { text: 'Shared', href: '/shared', icon: <SharedIcon /> },
  { text: 'Profile', href: '/profile', icon: <ProfileIcon /> },
  { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
];

interface NavigationProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function Navigation({ toggleTheme, isDarkMode }: NavigationProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const { navigateTo } = useNavigationWithLoading();

  const handleCreateAction = () => {
    // Handle create action - could open modal or navigate
    console.log('Create action triggered');
  };

  // Mobile Bottom Navigation with 3D design
  const MobileBottomNav = () => (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1000,
        borderRadius: '20px',
        backgroundColor: 'background.paper',
        border: `2px solid ${theme.palette.divider}`,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.12),
          0 4px 8px rgba(0, 0, 0, 0.08),
          inset 0 1px 1px rgba(255, 255, 255, 0.1)
        `,
        display: { md: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          py: 1,
          px: 2,
        }}
      >
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const isCreateButton = item.isAction;

          if (isCreateButton) {
            return (
              <Fab
                key={item.id}
                size="medium"
                color="primary"
                onClick={() => handleCreateAction()}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `
                      0 6px 20px rgba(255, 193, 7, 0.4),
                      0 2px 8px rgba(0, 0, 0, 0.2)
                    `,
                  },
                }}
              >
                {item.icon}
              </Fab>
            );
          }

          return (
            <IconButton
              key={item.id}
              onClick={() => {
                if (item.isAction) {
                  handleCreateAction();
                } else {
                  navigateTo(item.href, `Loading ${item.text.toLowerCase()}...`);
                }
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                borderRadius: '12px',
                p: 1.5,
                transition: 'all 0.2s ease-in-out',
                color: isActive ? 'primary.main' : 'text.secondary',
                backgroundColor: isActive ? 'action.selected' : 'transparent',
                transform: isActive ? 'translateY(-2px)' : 'none',
                boxShadow: isActive 
                  ? `0 4px 12px ${theme.palette.primary.main}20`
                  : 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              {item.icon}
              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600 }}>
                {item.text}
              </Typography>
            </IconButton>
          );
        })}
      </Box>
    </Paper>
  );

  // Desktop Sidebar with 3D design
  const DesktopSidebar = () => (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        [`& .MuiDrawer-paper`]: {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: `2px solid ${theme.palette.divider}`,
          boxShadow: `
            inset -1px 0 0 rgba(255, 255, 255, 0.1),
            2px 0 8px rgba(0, 0, 0, 0.08)
          `,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo Header */}
        <Toolbar sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              }}
            >
              <NoteIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800, 
                color: 'text.primary',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              WhisperNote
            </Typography>
          </Box>
        </Toolbar>

        {/* Navigation Items */}
        <List sx={{ flexGrow: 1, px: 2 }}>
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                  onClick={() => navigateTo(item.href, `Loading ${item.text.toLowerCase()}...`)}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: 2,
                    transition: 'all 0.2s ease-in-out',
                    backgroundColor: isActive ? 'action.selected' : 'transparent',
                    transform: isActive ? 'translateX(4px)' : 'none',
                    boxShadow: isActive 
                      ? `
                        4px 0 0 ${theme.palette.primary.main},
                        0 2px 8px rgba(0, 0, 0, 0.1)
                      `
                      : 'none',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(2px)',
                      boxShadow: `
                        2px 0 0 ${theme.palette.primary.main}40,
                        0 2px 8px rgba(0, 0, 0, 0.05)
                      `,
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? 'primary.main' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    sx={{
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'text.primary' : 'text.secondary',
                      },
                    }}
                  />
                  {item.text === 'Shared' && (
                    <Badge badgeContent={3} color="primary" />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* User Section & Theme Toggle */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ width: 40, height: 40 }}>U</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                User Name
              </Typography>
              <Typography variant="caption" color="text.secondary">
                user@example.com
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Theme
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" onClick={toggleTheme}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <Switch checked={isDarkMode} onChange={toggleTheme} size="small" />
            </Box>
          </Box>

          <IconButton
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              gap: 2,
              py: 1.5,
              px: 2,
              borderRadius: '12px',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'error.main',
              },
            }}
          >
            <LogoutIcon />
            <Typography variant="body2">Logout</Typography>
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );

  // Mobile Header
  const MobileHeader = () => (
    <AppBar
      position="sticky"
      sx={{
        display: { md: 'none' },
        backgroundColor: 'background.paper',
        color: 'text.primary',
        boxShadow: `
          0 2px 8px rgba(0, 0, 0, 0.08),
          inset 0 -1px 0 ${theme.palette.divider}
        `,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={() => setLeftDrawerOpen(true)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          WhisperNote
        </Typography>
        
        <IconButton>
          <Badge badgeContent={3} color="primary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );

  // Left Drawer for Mobile
  const LeftDrawer = () => (
    <Drawer
      anchor="left"
      open={leftDrawerOpen}
      onClose={() => setLeftDrawerOpen(false)}
      sx={{
        display: { md: 'none' },
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Navigation
        </Typography>
        
        <List>
          {sidebarItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => {
                  navigateTo(item.href, `Loading ${item.text.toLowerCase()}...`);
                  setLeftDrawerOpen(false);
                }}
                sx={{ borderRadius: '8px', mb: 1 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      {isDesktop ? <DesktopSidebar /> : <MobileHeader />}
      {!isDesktop && <MobileBottomNav />}
      <LeftDrawer />
    </>
  );
}
