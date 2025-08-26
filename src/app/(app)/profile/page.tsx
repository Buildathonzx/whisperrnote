"use client";

import { useEffect, useState } from 'react';
import { account, updateUser, uploadProfilePicture, getProfilePicture, listNotes } from '@/lib/appwrite';
import { Button } from '@/components/ui/Button';
import { useOverlay } from '@/components/ui/OverlayContext';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const { openOverlay, closeOverlay } = useOverlay();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
        if (currentUser.prefs?.profilePicId) {
          const url = await getProfilePicture(currentUser.prefs.profilePicId);
          setProfilePicUrl(url.href);
        }
        const notesResponse = await listNotes();
        setNotes(notesResponse.documents);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleEditProfile = () => {
    openOverlay(
      <EditProfileForm
        user={user}
        onClose={closeOverlay}
        onProfileUpdate={async (updatedUser, newProfilePic) => {
          setUser(updatedUser);
          if (newProfilePic) {
            const url = await getProfilePicture(updatedUser.prefs.profilePicId);
            setProfilePicUrl(url.href);
          }
        }}
      />
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <main className="px-6 md:px-20 lg:px-40 flex-1 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row p-6 items-center md:items-start gap-8 bg-card border border-border rounded-2xl shadow-3d-light dark:shadow-3d-dark">
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
              <Button onClick={handleEditProfile}>Edit Profile</Button>
            </div>
            <div className="w-full mt-8 md:mt-0">
              <div className="border-b border-border">
                <div className="flex px-4 gap-8">
                  <a href="#" className="flex flex-col items-center justify-center border-b-2 border-accent text-accent pb-3 pt-4">
                    <p className="text-base font-bold">Notes</p>
                  </a>
                  <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-foreground/60 pb-3 pt-4 hover:text-accent hover:border-accent transition-colors">
                    <p className="text-base font-bold">Posts</p>
                  </a>
                </div>
              </div>
              <div className="divide-y divide-border">
                {notes.map(note => (
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
      </main>
    </div>
  );
}

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