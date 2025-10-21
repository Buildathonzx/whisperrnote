'use client';

import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Note as NoteIcon,
  Camera as CameraIcon,
  Mic as VoiceIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Edit as PencilIcon,
} from '@mui/icons-material';
import { useState } from 'react';

interface QuickCreateFabProps {
  onCreateNote?: () => void;
  onCreateDoodle?: () => void;
  onCreateVoiceNote?: () => void;
  onCreatePhotoNote?: () => void;
  onCreateLinkNote?: () => void;
}

const actions = [
  { icon: <NoteIcon />, name: 'Text Note', action: 'text' },
  { icon: <PencilIcon />, name: 'Doodle', action: 'doodle' },
  { icon: <VoiceIcon />, name: 'Voice Note', action: 'voice' },
  { icon: <CameraIcon />, name: 'Photo Note', action: 'photo' },
  { icon: <LinkIcon />, name: 'Link Note', action: 'link' },
];

export default function QuickCreateFab({
  onCreateNote,
  onCreateDoodle,
  onCreateVoiceNote,
  onCreatePhotoNote,
  onCreateLinkNote,
}: QuickCreateFabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  const handleAction = (action: string) => {
    setOpen(false);
    
    switch (action) {
      case 'text':
        onCreateNote?.();
        break;
      case 'doodle':
        onCreateDoodle?.();
        break;
      case 'voice':
        onCreateVoiceNote?.();
        break;
      case 'photo':
        onCreatePhotoNote?.();
        break;
      case 'link':
        onCreateLinkNote?.();
        break;
    }
  };

  // Simple FAB for mobile (handled by bottom nav)
  if (isMobile) {
    return null;
  }

  // SpeedDial for desktop
  return (
    <SpeedDial
      ariaLabel="Quick create"
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        '& .MuiFab-primary': {
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: `
            0 8px 32px ${theme.palette.primary.main}40,
            0 4px 16px rgba(0, 0, 0, 0.2),
            inset 0 1px 2px rgba(255, 255, 255, 0.2)
          `,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `
              0 12px 40px ${theme.palette.primary.main}50,
              0 6px 20px rgba(0, 0, 0, 0.25),
              inset 0 1px 2px rgba(255, 255, 255, 0.2)
            `,
          },
        },
        '& .MuiSpeedDialAction-fab': {
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${theme.palette.divider}`,
          boxShadow: `
            0 4px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.1)
          `,
          '&:hover': {
            transform: 'translateY(-2px)',
            backgroundColor: theme.palette.action.hover,
            boxShadow: `
              0 6px 20px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.1)
            `,
          },
        },
      }}
      icon={<SpeedDialIcon icon={<AddIcon />} openIcon={<CloseIcon />} />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      direction="up"
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.action}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => handleAction(action.action)}
        />
      ))}
    </SpeedDial>
  );
}