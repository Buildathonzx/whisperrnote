"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface ShortcutProps {
  keys: string[];
  description: string;
}

const Shortcut = ({ keys, description }: ShortcutProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2">{description}</Typography>
    </Box>
    <Box sx={{ display: 'flex', gap: 1 }}>
      {keys.map((key, index) => (
        <Typography
          key={index}
          component="kbd"
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            boxShadow: '0 2px 0 rgba(0,0,0,0.1)'
          }}
        >
          {key}
        </Typography>
      ))}
    </Box>
  </Box>
);

const shortcuts = {
  general: [
    { keys: ['⌘', 'K'], description: 'Open quick search' },
    { keys: ['⌘', 'N'], description: 'Create new note' },
    { keys: ['⌘', '⇧', 'F'], description: 'Toggle fullscreen' },
    { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' }
  ],
  editor: [
    { keys: ['⌘', 'S'], description: 'Save changes' },
    { keys: ['⌘', 'B'], description: 'Bold text' },
    { keys: ['⌘', 'I'], description: 'Italic text' },
    { keys: ['⌘', 'U'], description: 'Underline text' },
    { keys: ['⌘', '⇧', '7'], description: 'Toggle numbered list' },
    { keys: ['⌘', '⇧', '8'], description: 'Toggle bullet list' },
    { keys: ['⌘', '['], description: 'Decrease indent' },
    { keys: ['⌘', ']'], description: 'Increase indent' }
  ],
  navigation: [
    { keys: ['⌘', '←'], description: 'Go back' },
    { keys: ['⌘', '→'], description: 'Go forward' },
    { keys: ['⌘', '↑'], description: 'Jump to top' },
    { keys: ['⌘', '↓'], description: 'Jump to bottom' }
  ],
  organization: [
    { keys: ['⌘', '⇧', 'N'], description: 'Create new collection' },
    { keys: ['⌘', '⇧', 'T'], description: 'Add tag' },
    { keys: ['⌘', '⇧', 'M'], description: 'Move to collection' },
    { keys: ['⌘', '⇧', 'S'], description: 'Share note' }
  ]
};

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  const [platform, setPlatform] = useState('mac');

  useEffect(() => {
    // Detect platform
    setPlatform((typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')) ? 'mac' : 'windows');
  }, []);

  const replaceKeys = (keys: string[]) => {
    if (platform === 'windows') {
      return keys.map(key => 
        key === '⌘' ? 'Ctrl' :
        key === '⇧' ? 'Shift' :
        key === '⌥' ? 'Alt' :
        key
      );
    }
    return keys;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        Keyboard Shortcuts
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              General
            </Typography>
            {shortcuts.general.map((shortcut, index) => (
              <Shortcut 
                key={index}
                keys={replaceKeys(shortcut.keys)}
                description={shortcut.description}
              />
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="primary">
              Editor
            </Typography>
            {shortcuts.editor.map((shortcut, index) => (
              <Shortcut
                key={index}
                keys={replaceKeys(shortcut.keys)}
                description={shortcut.description}
              />
            ))}
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom color="primary">
              Navigation
            </Typography>
            {shortcuts.navigation.map((shortcut, index) => (
              <Shortcut
                key={index}
                keys={replaceKeys(shortcut.keys)}
                description={shortcut.description}
              />
            ))}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom color="primary">
              Organization
            </Typography>
            {shortcuts.organization.map((shortcut, index) => (
              <Shortcut
                key={index}
                keys={replaceKeys(shortcut.keys)}
                description={shortcut.description}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Pro Tip: Press <kbd>⌘</kbd> + <kbd>/</kbd> anywhere in the app to show these shortcuts
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
