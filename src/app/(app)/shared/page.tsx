"use client";

import { Container, Typography, Paper, Tabs, Tab, Box, List, ListItem, ListItemText, ListItemSecondary, IconButton, Avatar, Chip, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Share, People, Lock, PersonAdd, ContentCopy } from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionListItem = motion(ListItem);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SharedNotesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleShare = () => {
    // TODO: Implement share functionality
    setShareDialogOpen(false);
    setInviteEmail('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Shared Notes
      </Typography>

      <MotionPaper 
        elevation={2}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Shared with me" />
          <Tab label="Shared by me" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <List>
            {[
              { title: 'Team Project Notes', sharedBy: 'Alice Smith', date: '2 days ago' },
              { title: 'Meeting Minutes', sharedBy: 'Bob Johnson', date: 'Yesterday' },
            ].map((note, index) => (
              <MotionListItem
                key={note.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{ 
                  mb: 2, 
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>{note.sharedBy[0]}</Avatar>
                      <Box>
                        <Typography variant="subtitle1">{note.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Shared by {note.sharedBy} • {note.date}
                        </Typography>
                      </Box>
                    </Box>
                    <Button startIcon={<ContentCopy />}>
                      Copy
                    </Button>
                  </Box>
                </Stack>
              </MotionListItem>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <List>
            {[
              { 
                title: 'Project Guidelines', 
                sharedWith: ['Team A', 'Team B'], 
                date: '1 week ago',
                isPublic: true
              },
              { 
                title: 'Research Notes', 
                sharedWith: ['Research Group'], 
                date: '3 days ago',
                isPublic: false
              },
            ].map((note, index) => (
              <MotionListItem
                key={note.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{ 
                  mb: 2, 
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {note.title}
                        {note.isPublic ? (
                          <Chip size="small" icon={<People />} label="Public" color="primary" />
                        ) : (
                          <Chip size="small" icon={<Lock />} label="Private" variant="outlined" />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Shared {note.date}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1}>
                          {note.sharedWith.map((team) => (
                            <Chip key={team} label={team} size="small" />
                          ))}
                          <Chip 
                            icon={<PersonAdd />} 
                            label="Invite" 
                            size="small" 
                            onClick={() => setShareDialogOpen(true)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Stack>
                      </Box>
                    </Box>
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Box>
                </Stack>
              </MotionListItem>
            ))}
          </List>
        </TabPanel>
      </MotionPaper>

      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address to share with"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}