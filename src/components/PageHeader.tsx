'use client';

import { Box, Paper } from '@mui/material';
import GlobalSearch from './GlobalSearch';
import KeyboardShortcuts from './KeyboardShortcuts';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import { Keyboard } from '@mui/icons-material';

export default function PageHeader() {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  return (
    <>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'background.paper' }}>
        <Box sx={{ flexGrow: 1 }}>
          <GlobalSearch />
        </Box>
        <IconButton onClick={() => setShowKeyboardShortcuts(true)}>
          <Keyboard />
        </IconButton>
      </Paper>
      <KeyboardShortcuts
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </>
  );
}
