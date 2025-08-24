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
    <div className="bg-background text-text-primary">
      <main className="px-10 md:px-20 lg:px-40 flex-1 py-12 bg-gradient-to-b from-background to-[#F4F1EC]">
        <div className="layout-content-container flex flex-col max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row p-4 items-center md:items-start gap-8">
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-40 border-4 border-white shadow-lg"
                style={{ backgroundImage: `url(${profilePicUrl || 'https://via.placeholder.com/150'})` }}
              ></div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-primary text-3xl font-bold">{user?.name}</p>
                <p className="text-text-secondary text-lg">{user?.email}</p>
                <p className="text-text-secondary text-base">Joined {new Date(user?.$createdAt).getFullYear()}</p>
              </div>
              <Button onClick={handleEditProfile}>Edit Profile</Button>
            </div>
            <div className="w-full mt-8 md:mt-0">
              <div className="border-b border-border">
                <div className="flex px-4 gap-8">
                  <a href="#" className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-4">
                    <p className="text-base font-bold">Notes</p>
                  </a>
                  <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-text-secondary pb-3 pt-4 hover:text-primary hover:border-primary transition-colors">
                    <p className="text-base font-bold">Posts</p>
                  </a>
                </div>
              </div>
              <div className="divide-y divide-border">
                {notes.map(note => (
                  <div key={note.$id} className="p-6 bg-white/30 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 my-4 border border-border">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex flex-col gap-3">
                        <p className="text-text-secondary text-sm">Published</p>
                        <p className="text-primary text-xl font-bold">{note.title}</p>
                        <p className="text-text-secondary text-base">{note.content.substring(0, 100)}...</p>
                        <Button variant="secondary">Read Note</Button>
                      </div>
                      <div className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg flex-1 shadow-lg border border-gray-200" style={{backgroundImage: `url(${note.coverImage || 'https://via.placeholder.com/300x200'})`}}></div>
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
    <div className="p-8 bg-surface rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-primary mb-4">Edit Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-border rounded"
        />
        <input
          type="file"
          onChange={(e) => setProfilePic(e.target.files ? e.target.files[0] : null)}
          className="w-full p-2 border border-border rounded"
        />
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveChanges}>Save</Button>
      </div>
    </div>
  );
};