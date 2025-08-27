'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { shareNoteWithUser, getSharedUsers, removeNoteSharing } from '@/lib/appwrite';

interface ShareNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  noteTitle: string;
}

interface SharedUser {
  id: string;
  email: string;
  permission: 'read' | 'write' | 'admin';
}

// Simple toast function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
  // You can replace this with a proper toast notification later
  alert(message);
};

export function ShareNoteModal({ isOpen, onOpenChange, noteId, noteTitle }: ShareNoteModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Load shared users when modal opens
  const loadSharedUsers = async () => {
    if (!isOpen) return;
    
    setIsLoadingUsers(true);
    try {
      const users = await getSharedUsers(noteId);
      setSharedUsers(users);
    } catch (error) {
      console.error('Failed to load shared users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load shared users when modal opens
  useState(() => {
    if (isOpen) {
      loadSharedUsers();
    }
  });

  const handleShare = async () => {
    if (!email.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await shareNoteWithUser(noteId, email, permission);
      showToast(`Note shared with ${email}`);
      setEmail('');
      await loadSharedUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to share note:', error);
      showToast(error.message || 'Failed to share note', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSharing = async (sharedUserId: string, userEmail: string) => {
    try {
      await removeNoteSharing(noteId, sharedUserId);
      showToast(`Removed sharing with ${userEmail}`);
      await loadSharedUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to remove sharing:', error);
      showToast(error.message || 'Failed to remove sharing', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onOpenChange(false)}
      title="Share Note"
      className="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-light-600 dark:text-dark-400 mb-4">
          Share "{noteTitle}" with other users by email
        </p>

        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleShare();
              }
            }}
          />
        </div>

        {/* Permission Level */}
        <div className="space-y-2">
          <Label htmlFor="permission">Permission Level</Label>
          <select
            id="permission"
            value={permission}
            onChange={(e) => setPermission(e.target.value as 'read' | 'write' | 'admin')}
            className="flex h-10 w-full rounded-md border border-light-300 dark:border-dark-700 bg-white dark:bg-dark-800 px-3 py-2 text-sm text-light-900 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-light-500 dark:focus:ring-dark-500"
          >
            <option value="read">Read Only</option>
            <option value="write">Read & Write</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>

        {/* Share Button */}
        <Button onClick={handleShare} disabled={isLoading} className="w-full">
          {isLoading ? 'Sharing...' : 'Share Note'}
        </Button>

        {/* Currently Shared Users */}
        {(sharedUsers.length > 0 || isLoadingUsers) && (
          <div className="space-y-2">
            <Label>Currently Shared With</Label>
            {isLoadingUsers ? (
              <div className="text-sm text-light-500 dark:text-dark-500">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 border border-light-200 dark:border-dark-700 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.email}</span>
                      <Badge variant="secondary" className="text-xs">
                        {user.permission}
                      </Badge>
                    </div>
                    <button
                      onClick={() => handleRemoveSharing(user.id, user.email)}
                      className="h-6 w-6 p-0 text-light-500 dark:text-dark-500 hover:text-red-500 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}