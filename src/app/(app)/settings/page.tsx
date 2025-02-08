"use client";

import { Container, Typography, Paper, Tabs, Tab, Box, TextField, Button, Stack, Switch, Divider, List, ListItem, ListItemText, ListItemSecondary, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete, Add, Key as KeyIcon } from '@mui/icons-material';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleGenerateKey = () => {
    // TODO: Implement API key generation
    setIsGeneratingKey(false);
    setNewKeyName('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Settings
      </Typography>

      <Paper elevation={2} sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="General" />
          <Tab label="API Keys" />
          <Tab label="Security" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="subtitle1">Dark Mode</Typography>
                <Typography variant="body2" color="text.secondary">
                  Toggle dark mode theme
                </Typography>
              </div>
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="subtitle1">Email Notifications</Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive email notifications for important updates
                </Typography>
              </div>
              <Switch
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
            </Box>
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsGeneratingKey(true)}
            >
              Generate New API Key
            </Button>
          </Box>
          
          <List>
            {/* Example API Keys */}
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <Delete />
                </IconButton>
              }
            >
              <ListItemText
                primary="Mobile App Key"
                secondary="Last used: 2 days ago"
              />
            </ListItem>
            <Divider />
            <ListItem
              secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <Delete />
                </IconButton>
              }
            >
              <ListItemText
                primary="Desktop App Key"
                secondary="Last used: 5 minutes ago"
              />
            </ListItem>
          </List>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Stack spacing={3}>
            <div>
              <Typography variant="subtitle1" gutterBottom>
                Change Password
              </Typography>
              <Stack spacing={2}>
                <TextField
                  type="password"
                  label="Current Password"
                  fullWidth
                />
                <TextField
                  type="password"
                  label="New Password"
                  fullWidth
                />
                <TextField
                  type="password"
                  label="Confirm New Password"
                  fullWidth
                />
                <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>
                  Update Password
                </Button>
              </Stack>
            </div>
            
            <Divider />
            
            <div>
              <Typography variant="subtitle1" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </div>
          </Stack>
        </TabPanel>
      </Paper>

      <Dialog open={isGeneratingKey} onClose={() => setIsGeneratingKey(false)}>
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g., Mobile App Key"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGeneratingKey(false)}>Cancel</Button>
          <Button onClick={handleGenerateKey} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}