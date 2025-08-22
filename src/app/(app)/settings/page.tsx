"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, getSettings, createSettings, updateSettings } from "@/lib/appwrite";
import { Container, Paper, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress, Alert, Box } from '@mui/material';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        const u = await account.get();
        setUser(u);
        setIsVerified(!!u.emailVerification);

        try {
          const s = await getSettings(u.$id);
          setSettings(s);
        } catch (e) {
          // If settings don't exist, create them
          const newSettings = await createSettings({ userId: u.$id, settings: JSON.stringify({ theme: 'light', notifications: true }) });
          setSettings(newSettings);
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSettings();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateSettings(user.$id, { settings: JSON.stringify(settings.settings) });
      setSuccess("Settings updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Failed to update settings");
    }
  };

  if (loading) return <CircularProgress />;

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, backgroundColor: 'background.paper' }}>
        <Typography variant="h4" gutterBottom>Account Settings</Typography>
        <Box sx={{ mb: 2 }}>
          <Typography>
            Email status:{" "}
            {isVerified ? (
              <Typography component="span" sx={{ color: "success.main", fontWeight: 500 }}>Verified</Typography>
            ) : (
              <Typography component="span" sx={{ color: "error.main", fontWeight: 500 }}>
                Not verified{" "}
                <Button href="/verify" size="small">Verify email</Button>
              </Typography>
            )}
          </Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {settings && (
          <form onSubmit={handleUpdate}>
            <TextField
              label="Email"
              value={user?.email || ''}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Name"
              value={user?.name || ''}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              }
              label="Enable Notifications"
            />
            <Box sx={{ mt: 2 }}>
              <Button type="submit" variant="contained">Update Settings</Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
}
