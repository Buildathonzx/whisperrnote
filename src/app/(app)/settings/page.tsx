"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, getSettings, createSettings, updateSettings, updateUser, uploadProfilePicture, getProfilePicture, listNotes, updateAIMode, getAIMode } from "@/lib/appwrite";
import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/components/ui/OverlayContext";
import { useSubscription } from "@/components/ui/SubscriptionContext";
import AIModeSelect from "@/components/AIModeSelect";
import { AIMode, SubscriptionTier, getAIModeDisplayName, getAIModeDescription } from "@/types/ai";
import { 
  listStoredPasskeys, 
  removePasskey, 
  isPlatformAuthenticatorAvailable 
} from "@/lib/appwrite/auth/passkey";
import { 
  listStoredWallets, 
  removeWallet, 
  isWalletAvailable,
  getWalletStatus 
} from "@/lib/appwrite/auth/wallet";

type TabType = 'profile' | 'settings' | 'preferences';

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
  const [authMethods, setAuthMethods] = useState<{
    passkeys: any[];
    wallets: any[];
    passkeySupported: boolean;
    walletAvailable: boolean;
  }>({
    passkeys: [],
    wallets: [],
    passkeySupported: false,
    walletAvailable: false
  });
  const { userTier } = useSubscription();
  const { openOverlay, closeOverlay } = useOverlay();
  const router = useRouter();

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

        // Load authentication methods
        try {
          const passkeySupported = await isPlatformAuthenticatorAvailable();
          const walletAvailable = isWalletAvailable();
          const passkeys = listStoredPasskeys();
          const wallets = listStoredWallets();
          
          setAuthMethods({
            passkeys,
            wallets,
            passkeySupported,
            walletAvailable
          });
        } catch (e) {
          console.error('Failed to load auth methods:', e);
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

  const handleRemovePasskey = async (credentialId: string) => {
    try {
      removePasskey(credentialId);
      setAuthMethods(prev => ({
        ...prev,
        passkeys: prev.passkeys.filter(p => p.credentialId !== credentialId)
      }));
      setSuccess("Passkey removed successfully.");
    } catch (error) {
      setError("Failed to remove passkey");
    }
  };

  const handleRemoveWallet = async (address: string) => {
    try {
      removeWallet(address);
      setAuthMethods(prev => ({
        ...prev,
        wallets: prev.wallets.filter(w => w.address !== address)
      }));
      setSuccess("Wallet removed successfully.");
    } catch (error) {
      setError("Failed to remove wallet");
    }
  };

  const handleEditProfile = () => {
    openOverlay(
      <EditProfileForm
        user={user}
        onClose={closeOverlay}
        onProfileUpdate={async (updatedUser, newProfilePic) => {
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
                onRemovePasskey={handleRemovePasskey}
                onRemoveWallet={handleRemoveWallet}
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

const SettingsTab = ({ user, settings, isVerified, error, success, onUpdate, onSettingChange, router, authMethods, onRemovePasskey, onRemoveWallet }: any) => (
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

      {/* Passkeys */}
      <div className="p-6 bg-background border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Passkeys</h3>
            <p className="text-sm text-foreground/70">Secure authentication using biometrics</p>
          </div>
          <div className="text-sm text-foreground/60">
            {authMethods.passkeySupported ? 'Available' : 'Not Supported'}
          </div>
        </div>
        
        {authMethods.passkeys.length > 0 ? (
          <div className="space-y-2">
            {authMethods.passkeys.map((passkey: any) => (
              <div key={passkey.credentialId} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">{passkey.displayName || passkey.email}</p>
                  <p className="text-xs text-foreground/60">Added {new Date(passkey.createdAt).toLocaleDateString()}</p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onRemovePasskey(passkey.credentialId)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/60">No passkeys configured</p>
        )}
      </div>

      {/* Wallets */}
      <div className="p-6 bg-background border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-foreground">Wallets</h3>
            <p className="text-sm text-foreground/70">Web3 wallet authentication</p>
          </div>
          <div className="text-sm text-foreground/60">
            {authMethods.walletAvailable ? 'Available' : 'Not Available'}
          </div>
        </div>
        
        {authMethods.wallets.length > 0 ? (
          <div className="space-y-2">
            {authMethods.wallets.map((wallet: any) => (
              <div key={wallet.address} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {wallet.provider} • Connected {new Date(wallet.connectedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => onRemoveWallet(wallet.address)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/60">No wallets connected</p>
        )}
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
      let prefs = user.prefs;
      if (profilePic) {
        const uploadedFile = await uploadProfilePicture(profilePic);
        prefs = { ...prefs, profilePicId: uploadedFile.$id };
      }
      const updatedUser = await updateUser(user.$id, { name, prefs });
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