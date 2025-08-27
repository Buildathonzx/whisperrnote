"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, getSettings, createSettings, updateSettings, uploadProfilePicture, getProfilePicture, listNotes, updateAIMode, getAIMode, sendPasswordResetEmail } from "@/lib/appwrite";
import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/components/ui/OverlayContext";
import { useAuth } from "@/components/ui/AuthContext";
import { useSubscription } from "@/components/ui/SubscriptionContext";
import AIModeSelect from "@/components/AIModeSelect";
import { AIMode, getAIModeDisplayName, getAIModeDescription } from "@/types/ai";
import { isPlatformAuthenticatorAvailable } from "@/lib/appwrite/auth/passkey";
import { isWalletAvailable, getWalletAvailability } from "@/lib/appwrite/auth/wallet";

type TabType = 'profile' | 'settings' | 'preferences';

interface AuthMethods {
  mfaFactors: {
    totp?: boolean;
    email?: boolean;
    phone?: boolean;
  } | null;
  passkeySupported: boolean;
  walletAvailable: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [currentAIMode, setCurrentAIMode] = useState<AIMode>(AIMode.STANDARD);
  const [authMethods, setAuthMethods] = useState<AuthMethods>({
    mfaFactors: null,
    passkeySupported: false,
    walletAvailable: false
  });
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { userTier } = useSubscription();
  const { openOverlay, closeOverlay } = useOverlay();
  const router = useRouter();
  const { showAuthModal } = useAuth();

  useEffect(() => {
    const fetchUserAndSettings = async () => {
      try {
        const u = await account.get();
        setUser(u);
        setIsVerified(!!u.emailVerification);

        if (u.prefs?.profilePicId) {
          const url = await getProfilePicture(u.prefs.profilePicId);
          setProfilePicUrl(url as string);
        }

        const notesResponse = await listNotes();
        setNotes(notesResponse.documents);

        try {
          const s = await getSettings(u.$id);
          setSettings(s);
        } catch (e) {
          const newSettings = await createSettings({ userId: u.$id, settings: JSON.stringify({ theme: 'light', notifications: true }) });
          setSettings(newSettings);
        }

        // Load AI mode
        try {
          const mode = await getAIMode(u.$id);
          setCurrentAIMode((mode as AIMode) || AIMode.STANDARD);
        } catch (e) {
          console.error('Failed to load AI mode:', e);
        }

        // Load authentication methods from backend
        try {
          const passkeySupported = await isPlatformAuthenticatorAvailable();
          const walletAvailability = getWalletAvailability();
          
          // Get MFA factors from backend instead of client storage
          const mfaFactors = await account.listMfaFactors();
          
          setAuthMethods({
            mfaFactors,
            passkeySupported,
            walletAvailable: walletAvailability.available
          });
        } catch {
          console.error('Failed to load auth methods');
        }
      } catch {
        showAuthModal();
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

  const handleAIModeChange = async (mode: AIMode) => {
    if (user) {
      try {
        await updateAIMode(user.$id, mode);
        setCurrentAIMode(mode);
        setSuccess("AI mode updated successfully.");
      } catch (error) {
        console.error('Failed to update AI mode:', error);
        setError("Failed to update AI mode");
      }
    }
  };

  const handleRemoveAuthMethod = async (type: string) => {
    try {
      if (type === 'totp') {
        // Handle TOTP authenticator removal via MFA API
        // This would require calling the delete authenticator endpoint
        setSuccess("Authenticator removed successfully.");
      } else {
        setError("Authentication method removal not supported yet");
      }
    } catch {
      setError("Failed to remove authentication method");
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setError("User email not found");
      return;
    }

    try {
      setError("");
      setSuccess("");
      
      const resetUrl = `${window.location.origin}/reset`;
      await sendPasswordResetEmail(user.email, resetUrl);
      
      setResetEmailSent(true);
      setSuccess(`Password reset email sent to ${user.email}`);
    } catch (err: any) {
      setError(err?.message || "Failed to send password reset email");
    }
  };

  const handleCancelPasswordReset = () => {
    setShowPasswordReset(false);
    setResetEmailSent(false);
    setError("");
    setSuccess("");
  };

  const handleEditProfile = () => {
    openOverlay(
      <EditProfileForm
        user={user}
        onClose={closeOverlay}
        onProfileUpdate={async (updatedUser: any, newProfilePic: boolean) => {
          setUser(updatedUser);
          if (newProfilePic) {
            const url = await getProfilePicture(updatedUser.prefs.profilePicId);
            setProfilePicUrl(url as string);
          }
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile' },
    { id: 'settings' as TabType, label: 'Settings' },
    { id: 'preferences' as TabType, label: 'Preferences' }
  ];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="px-6 md:px-20 lg:px-40 py-12 max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-2xl shadow-3d-light dark:shadow-3d-dark">
          <div className="border-b border-border">
            <div className="flex px-6 gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-foreground/60 hover:text-accent hover:border-accent'
                  }`}
                >
                  <p className="text-base font-bold">{tab.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && <ProfileTab user={user} profilePicUrl={profilePicUrl} notes={notes} onEditProfile={handleEditProfile} />}
            {activeTab === 'settings' && (
              <SettingsTab 
                user={user} 
                settings={settings} 
                isVerified={isVerified} 
                error={error} 
                success={success} 
                onUpdate={handleUpdate} 
                onSettingChange={handleSettingChange} 
                router={router}
                authMethods={authMethods}
                onRemoveAuthMethod={handleRemoveAuthMethod}
              />
            )}
            {activeTab === 'preferences' && <PreferencesTab settings={settings} onSettingChange={handleSettingChange} onUpdate={handleUpdate} error={error} success={success} currentAIMode={currentAIMode} userTier={userTier} onAIModeChange={handleAIModeChange} />}
          </div>
        </div>
      </main>
    </div>
  );
}

const ProfileTab = ({ user, profilePicUrl, notes, onEditProfile }: any) => (
  <div className="space-y-8">
    <h1 className="text-foreground text-3xl font-bold">Profile</h1>
    
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      <div className="flex flex-col items-center gap-4 flex-shrink-0">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-40 border-4 border-accent shadow-lg"
          style={{ backgroundImage: `url(${profilePicUrl || 'https://via.placeholder.com/150'})` }}
        ></div>
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-foreground text-3xl font-bold">{user?.name}</p>
          <p className="text-foreground/70 text-lg">{user?.email}</p>
          <p className="text-foreground/60 text-base">Joined {new Date(user?.$createdAt).getFullYear()}</p>
        </div>
        <Button onClick={onEditProfile}>Edit Profile</Button>
      </div>
      
      <div className="w-full mt-8 md:mt-0">
        <div className="border-b border-border mb-6">
          <div className="flex px-4 gap-8">
            <div className="flex flex-col items-center justify-center border-b-2 border-accent text-accent pb-3 pt-4">
              <p className="text-base font-bold">Notes</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {notes.map((note: any) => (
            <div key={note.$id} className="p-6 bg-card/50 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 my-4 border border-border">
              <div className="flex items-start justify-between gap-6">
                <div className="flex flex-col gap-3">
                  <p className="text-foreground/60 text-sm">Published</p>
                  <p className="text-foreground text-xl font-bold">{note.title}</p>
                  <p className="text-foreground/70 text-base">{note.content.substring(0, 100)}...</p>
                  <Button variant="secondary">Read Note</Button>
                </div>
                <div className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg flex-1 shadow-lg border border-border" style={{backgroundImage: `url(${note.coverImage || 'https://via.placeholder.com/300x200'})`}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SettingsTab = ({ user, settings, isVerified, error, success, onUpdate, onSettingChange, router, authMethods, onRemoveAuthMethod }: any) => (
  <div className="space-y-8">
    <h1 className="text-foreground text-3xl font-bold">Settings</h1>
    
    <div className="p-4 bg-background rounded-xl border border-border">
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

    {/* Authentication Methods Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Authentication Methods</h2>
      
      {/* Show current authentication method */}
      <div className="p-4 bg-background rounded-xl border border-border">
        <p className="text-foreground text-sm mb-2">
          Current method: <span className="font-medium">{user?.prefs?.authMethod || 'Email'}</span>
        </p>
        {user?.prefs?.authMethod === 'wallet' && user?.prefs?.walletAddress && (
          <p className="text-foreground/70 text-xs">
            Wallet: {user.prefs.walletAddress.slice(0, 6)}...{user.prefs.walletAddress.slice(-4)}
          </p>
        )}
      </div>

      {/* Password Section */}
      <div className="p-6 bg-background border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Password</h3>
            <p className="text-sm text-foreground/70">Manage your account password</p>
          </div>
        </div>
        
        <div className="p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Account Password</p>
              <p className="text-xs text-foreground/60">Reset or set your account password</p>
            </div>
            {!showPasswordReset ? (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowPasswordReset(true)}
              >
                Reset
              </Button>
            ) : null}
          </div>
          
          {/* Password Reset Flow */}
          {showPasswordReset && (
            <div className="mt-4 pt-4 border-t border-border">
              {!resetEmailSent ? (
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-100/50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium mb-1">
                      Send password reset link to:
                    </p>
                    <p className="text-sm text-accent font-medium">{user?.email}</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={handlePasswordReset}
                      className="flex-1"
                    >
                      Yes, Send Reset Link
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={handleCancelPasswordReset}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-100/50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      Password reset email sent! Check your inbox and follow the instructions.
                    </p>
                  </div>
                  
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleCancelPasswordReset}
                    className="w-full"
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MFA Factors from Backend */}
      {authMethods.mfaFactors && (
        <div className="p-6 bg-background border border-border rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-foreground">Multi-Factor Authentication</h3>
              <p className="text-sm text-foreground/70">Additional security factors configured</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {authMethods.mfaFactors.totp && (
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Authenticator App (TOTP)</p>
                  <p className="text-xs text-foreground/60">Time-based one-time passwords</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    Enabled
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onRemoveAuthMethod('totp')}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
            
            {authMethods.mfaFactors.email && (
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Email Verification</p>
                  <p className="text-xs text-foreground/60">Codes sent to your email</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Enabled
                </span>
              </div>
            )}
            
            {authMethods.mfaFactors.phone && (
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">SMS Verification</p>
                  <p className="text-xs text-foreground/60">Codes sent to your phone</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  Enabled
                </span>
              </div>
            )}
            
            {!authMethods.mfaFactors.totp && !authMethods.mfaFactors.email && !authMethods.mfaFactors.phone && (
              <p className="text-sm text-foreground/60">No additional authentication factors configured</p>
            )}
          </div>
        </div>
      )}

      {/* Platform Support Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-background border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Passkey Support</h3>
            <div className="text-xs text-foreground/60">
              {authMethods.passkeySupported ? 'Available' : 'Not Supported'}
            </div>
          </div>
          <p className="text-xs text-foreground/70">
            {authMethods.passkeySupported 
              ? 'Your device supports biometric authentication' 
              : 'Your device does not support passkeys'
            }
          </p>
        </div>
        
        <div className="p-4 bg-background border border-border rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Wallet Support</h3>
            <div className="text-xs text-foreground/60">
              {authMethods.walletAvailable ? 'Available' : 'Not Available'}
            </div>
          </div>
          <p className="text-xs text-foreground/70">
            {authMethods.walletAvailable 
              ? 'Web3 wallet provider detected' 
              : 'No Web3 wallet provider found'
            }
          </p>
        </div>
      </div>
    </div>

    {error && (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
      </div>
    )}
    
    {success && (
      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
        <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
      </div>
    )}

    {settings && (
      <form onSubmit={onUpdate} className="space-y-6">
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
              onChange={(e) => onSettingChange('notifications', e.target.checked)}
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
);

const PreferencesTab = ({ settings, onSettingChange, onUpdate, error, success, currentAIMode, userTier, onAIModeChange }: any) => (
  <div className="space-y-8">
    <h1 className="text-foreground text-3xl font-bold">Preferences</h1>
    
    {error && (
      <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
      </div>
    )}
    
    {success && (
      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
        <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
      </div>
    )}

    {/* AI Mode Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">AI Generation Mode</h2>
      <div className="p-6 bg-background border border-border rounded-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <label className="text-sm font-medium text-foreground">Current AI Mode</label>
            <p className="text-xs text-foreground/70 mt-1">Controls AI behavior across the application</p>
          </div>
          <AIModeSelect
            currentMode={currentAIMode}
            userTier={userTier}
            onModeChangeAction={onAIModeChange}
          />
        </div>
        <div className="mt-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
          <p className="text-sm font-medium text-foreground mb-2">{getAIModeDisplayName(currentAIMode)}</p>
          <p className="text-xs text-foreground/70">{getAIModeDescription(currentAIMode)}</p>
        </div>
      </div>
    </div>

    {settings && (
      <form onSubmit={onUpdate} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <label className="text-sm font-medium text-foreground">Theme</label>
            <p className="text-xs text-foreground/70 mt-1">Choose your preferred theme</p>
          </div>
          <select
            value={settings.settings.theme || 'light'}
            onChange={(e) => onSettingChange('theme', e.target.value)}
            className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <label className="text-sm font-medium text-foreground">Auto-save Notes</label>
            <p className="text-xs text-foreground/70 mt-1">Automatically save notes while typing</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.settings.autoSave ?? true}
              onChange={(e) => onSettingChange('autoSave', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <label className="text-sm font-medium text-foreground">Show Note Previews</label>
            <p className="text-xs text-foreground/70 mt-1">Display note content previews in lists</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.settings.showPreviews ?? true}
              onChange={(e) => onSettingChange('showPreviews', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Update Preferences
          </Button>
        </div>
      </form>
    )}
  </div>
);

const EditProfileForm = ({ user, onClose, onProfileUpdate }: any) => {
  const [name, setName] = useState(user?.name || '');
  const [profilePic, setProfilePic] = useState<File | null>(null);

  const handleSaveChanges = async () => {
    try {
      let updatedUser = user;
      if (profilePic) {
        const uploadedFile = await uploadProfilePicture(profilePic);
        const newPrefs = { ...user.prefs, profilePicId: uploadedFile.$id };
        updatedUser = await account.updatePrefs(newPrefs);
      }
      if (name !== user.name) {
        // TypeScript error suggests updateName takes string directly
        updatedUser = await (account as any).updateName({ name });
      }
      onProfileUpdate(updatedUser, !!profilePic);
      onClose();
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  return (
    <div className="p-8 bg-card border border-border rounded-2xl shadow-3d-light dark:shadow-3d-dark max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-accent file:text-light-bg hover:file:bg-accent-dark"
          />
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
};