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
} from '@mui/material';
import {
  Note as NoteIcon,
  Label as TagIcon,
  People as SharedIcon,
  Extension as ExtensionIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Book as BlogIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
  Info as InfoIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 240;

const navItems = [
  { text: 'Notes', href: '/notes', icon: <NoteIcon /> },
  { text: 'Tags', href: '/tags', icon: <TagIcon /> },
  { text: 'Shared', href: '/shared', icon: <SharedIcon /> },
  { text: 'Extensions', href: '/extensions', icon: <ExtensionIcon /> },
  { text: 'Profile', href: '/profile', icon: <ProfileIcon /> },
  { text: 'Settings', href: '/settings', icon: <SettingsIcon /> },
  { text: 'Blog', href: '/blog', icon: <BlogIcon /> },
];

// Define which items to show on the mobile bottom bar
const mobileNavItems = ['/notes', '/shared', '/profile', '/settings'];
const mobileBottomNavItems = navItems.filter(item => mobileNavItems.includes(item.href));


interface NavigationProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export default function Navigation({ toggleTheme, isDarkMode }: NavigationProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const pathname = usePathname();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          WhisperNote
        </Typography>
      </Toolbar>
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={Link} href={item.href} selected={pathname.startsWith(item.href)}>
              <ListItemIcon sx={{ color: pathname.startsWith(item.href) ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Theme</Typography>
          <Switch checked={isDarkMode} onChange={toggleTheme} size="small" />
          <IconButton onClick={toggleTheme} size="small">
            {isDarkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
        <ListItemButton component={Link} href="/landing">
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About Us" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (isDesktop) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Mobile Bottom Navigation
  return (
    <AppBar
      position="fixed"
      sx={{
        top: 'auto',
        bottom: 16,
        left: 16,
        right: 16,
        display: { md: 'none' },
        borderRadius: '24px',
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[4],
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-around' }}>
        {mobileBottomNavItems.map((item) => (
          <IconButton
            key={item.text}
            component={Link}
            href={item.href}
            color={pathname.startsWith(item.href) ? 'primary' : 'inherit'}
            aria-label={item.text}
          >
            {item.icon}
          </IconButton>
        ))}
      </Toolbar>
    </AppBar>
  );
}
