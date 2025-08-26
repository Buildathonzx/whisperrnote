"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, getSettings, createSettings, updateSettings } from "@/lib/appwrite";
import { Button } from "@/components/ui/Button";

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

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, settings: { ...prev.settings, [key]: value } }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="px-6 md:px-20 lg:px-40 py-12 max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-3d-light dark:shadow-3d-dark">
          <h1 className="text-foreground text-3xl font-bold mb-6">Account Settings</h1>
          
          <div className="mb-6 p-4 bg-background rounded-xl border border-border">
            <p className="text-foreground text-sm">
              Email status:{" "}
              {isVerified ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Verified</span>
              ) : (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Not verified{" "}
                  <Button variant="link" size="sm" onClick={() => router.push("/verify")}>
                    Verify email
                  </Button>
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
            </div>
          )}

          {settings && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground opacity-50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                <div>
                  <label className="text-sm font-medium text-foreground">Enable Notifications</label>
                  <p className="text-xs text-foreground/70 mt-1">Receive email notifications for important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">
                  Update Settings
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
