'use client';

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { shareNoteWithUser, shareNoteWithUserId, getSharedUsers, removeNoteSharing, searchUsers, updateCollaborator } from '@/lib/appwrite';

interface ShareNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  noteTitle: string;
}

interface SharedUser {
  id: string;
  name?: string;
  email: string;
  permission: 'read' | 'write' | 'admin';
  collaborationId?: string;
}

interface FoundUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

// Simple toast function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`[${type.toUpperCase()}]: ${message}`);
  // You can replace this with a proper toast notification later
  alert(message);
};

export function ShareNoteModal({ isOpen, onOpenChange, noteId, noteTitle }: ShareNoteModalProps) {
  const [query, setQuery] = useState('');
  const [permission, setPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [results, setResults] = useState<FoundUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingCollab, setUpdatingCollab] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      loadSharedUsers();
    }
  }, [isOpen]);

  const debouncedSearch = useCallback(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    searchUsers(query).then(res => {
      setResults(res as any);
    }).catch(() => {
      setResults([]);
    }).finally(() => setIsSearching(false));
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => debouncedSearch(), 300);
    return () => clearTimeout(t);
  }, [query, debouncedSearch]);

  const resetMessages = () => {
    setErrorMsg(null); setSuccessMsg(null);
  };

  const handleShare = async () => {
    resetMessages();
    if (!selectedUser && !query.trim()) {
      setErrorMsg('Enter a user or email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(query.trim());

    try {
      setIsLoading(true);
      let response;
      if (selectedUser) {
        response = await shareNoteWithUserId(noteId, selectedUser.id, permission, selectedUser.email || undefined);
      } else if (isEmail) {
        response = await shareNoteWithUser(noteId, query.trim(), permission);
      } else {
        setErrorMsg('Select a user from the list or provide a valid email');
        setIsLoading(false);
        return;
      }
      setSuccessMsg(response.message || 'Shared successfully');
      setQuery('');
      setSelectedUser(null);
      setResults([]);
      await loadSharedUsers();
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to share note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (collab: SharedUser, newPerm: 'read' | 'write' | 'admin') => {
    if (collab.permission === newPerm || !collab.collaborationId) return;
    setUpdatingCollab(collab.collaborationId);
    try {
      await updateCollaborator(collab.collaborationId, { permission: newPerm });
      setSharedUsers(prev => prev.map(u => u.id === collab.id ? { ...u, permission: newPerm } : u));
      setSuccessMsg('Permission updated');
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed updating permission');
    } finally {
      setUpdatingCollab(null);
    }
  };

  const handleRemoveSharing = async (sharedUserId: string, userEmail: string) => {
    try {
      await removeNoteSharing(noteId, sharedUserId);
      showToast(`Removed sharing with ${userEmail}`);
      await loadSharedUsers(); // Refresh the list
    } catch (error: unknown) {
      console.error('Failed to remove sharing:', error);
      showToast((error as Error).message || 'Failed to remove sharing', 'error');
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
          Share &quot;{noteTitle}&quot; with other users by email
        </p>

        {/* User Search / Email Input */}
        <div className="space-y-2">
          <Label htmlFor="share-query">User or Email</Label>
          <Input
            id="share-query"
            type="text"
            placeholder="Search by name or enter email"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); resetMessages(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleShare();
              }
            }}
          />
          {query && results.length > 0 && !selectedUser && (
            <div className="border border-light-200 dark:border-dark-700 rounded-md max-h-40 overflow-y-auto divide-y divide-light-100 dark:divide-dark-700">
              {results.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => { setSelectedUser(user); setQuery(user.name || user.email || ''); resetMessages(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-light-100 dark:hover:bg-dark-700 focus:outline-none text-sm"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-light-300 dark:bg-dark-600 text-xs font-medium">
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || user.email}</span>
                    {user.email && user.email !== user.name && (
                      <span className="text-xs text-light-500 dark:text-dark-400">{user.email}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedUser && (
            <div className="flex items-center gap-2 text-xs text-light-600 dark:text-dark-400">
              Selected: <span className="font-medium">{selectedUser.name || selectedUser.email}</span>
              <button
                onClick={() => { setSelectedUser(null); setQuery(''); }}
                className="text-light-500 dark:text-dark-500 hover:text-red-500"
              >Clear</button>
            </div>
          )}
          {isSearching && <div className="text-xs text-light-500 dark:text-dark-500">Searching...</div>}
          {errorMsg && <div className="text-xs text-red-500">{errorMsg}</div>}
          {successMsg && <div className="text-xs text-green-600">{successMsg}</div>}
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
                       <span className="text-sm">{user.name ? `${user.name} (${user.email})` : user.email}</span>
                       <select
                        value={user.permission}
                        onChange={(e) => handleUpdatePermission(user, e.target.value as 'read' | 'write' | 'admin')}
                        className="h-7 rounded-md border border-light-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-xs px-1 py-0.5 focus:outline-none"
                        disabled={updatingCollab === user.collaborationId}
                       >
                        <option value="read">read</option>
                        <option value="write">write</option>
                        <option value="admin">admin</option>
                       </select>
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