'use client';

import {
  Box,
  Typography,
  IconButton,
  Toolbar,
  AppBar,
  Tabs,
  Tab,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import type { Notes } from '@/types/appwrite';
import { useState } from 'react';
import Comments from './Comments';
import Collaborators from './Collaborators';
import AttachmentViewer from './AttachmentViewer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface NoteViewerProps {
  note: Notes | null;
  onClose: () => void;
}

function TabPanel(props: { children?: React.ReactNode; value: number; index: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`note-viewer-tabpanel-${index}`}
      aria-labelledby={`note-viewer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NoteViewer({ note, onClose }: NoteViewerProps) {
  const [tabIndex, setTabIndex] = useState(0);

  if (!note) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {note.title}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
            <Close />
          </IconButton>
        </Toolbar>
        <Tabs value={tabIndex} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
          <Tab label="Content" />
          <Tab label="Comments" />
          <Tab label="Attachments" />
          <Tab label="Collaborators" />
        </Tabs>
      </AppBar>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <TabPanel value={tabIndex} index={0}>
          <Box sx={{ '& .prose': { maxWidth: 'none' } }}>
            {note.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {note.content}
              </ReactMarkdown>
            ) : (
              <Typography variant="body1" color="text.secondary" fontStyle="italic">
                This note is empty.
              </Typography>
            )}
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Comments noteId={note.$id} />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <AttachmentViewer noteId={note.$id} attachments={note.attachments || []} />
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <Collaborators noteId={note.$id} collaborators={note.collaborators || []} />
        </TabPanel>
      </Box>
    </Box>
  );
}
