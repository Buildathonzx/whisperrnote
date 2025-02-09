"use client";

import { Container, Typography, Paper, Tabs, Tab, Box, TextField, Button, Stack, Switch, Divider, List, ListItem, ListItemText, ListItemSecondary, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete, Add, Key as KeyIcon, AccountBalanceWallet, Email, Lock } from '@mui/icons-material';
import { useState, useEffect } from 'react';
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setUserProfile(data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!res.ok) throw new Error('Failed to update password');
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
    } catch (err) {
      setError('Failed to update password');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to continue');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      const address = accounts[0];
      
      // Get nonce
      const nonceRes = await fetch('/api/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, action: 'getNonce' })
      });
      
      const { nonce } = await nonceRes.json();
      
      // Sign message
      const message = `Sign this message to verify your wallet ownership. Nonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      });

      // Link wallet
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, walletSignature: signature })
      });

      if (!res.ok) throw new Error('Failed to link wallet');
      
      await fetchUserProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const unlinkWallet = async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: null })
      });

      if (!res.ok) throw new Error('Failed to unlink wallet');
      
      await fetchUserProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

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
            <Typography variant="h6" gutterBottom>
              Authentication Methods
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Stack spacing={2}>
                {userProfile?.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email color="primary" />
                      <div>
                        <Typography variant="subtitle1">Email</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userProfile.email}
                        </Typography>
                      </div>
                    </Box>
                    <Button startIcon={<Lock />}>
                      Change Password
                    </Button>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceWallet color="primary" />
                    <div>
                      <Typography variant="subtitle1">Wallet</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {userProfile?.walletAddress || 'No wallet connected'}
                      </Typography>
                    </div>
                  </Box>
                  {userProfile?.walletAddress ? (
                    <Button color="error" onClick={unlinkWallet}>
                      Unlink Wallet
                    </Button>
                  ) : (
                    <Button variant="outlined" onClick={connectWallet}>
                      Connect Wallet
                    </Button>
                  )}
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Password Change Section */}
            {userProfile?.email && (
              <div>
                <Typography variant="subtitle1" gutterBottom>
                  Change Password
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    type="password"
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))}
                    fullWidth
                  />
                  <TextField
                    type="password"
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))}
                    fullWidth
                  />
                  <TextField
                    type="password"
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))}
                    fullWidth
                  />
                  <Button 
                    variant="contained" 
                    sx={{ alignSelf: 'flex-start' }}
                    onClick={handlePasswordChange}
                  >
                    Update Password
                  </Button>
                </Stack>
              </div>
            )}
            
            <Divider />
            
            <div>
              <Typography variant="subtitle1" gutterBottom color="error">
                Danger Zone
              </Typography>
              <Button variant="outlined" color="error">
                Delete Account
              </Button>
            </div>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
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