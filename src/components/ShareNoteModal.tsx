'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shareNoteWithUser, shareNoteWithUserId, getSharedUsers, removeNoteSharing, searchUsers, updateCollaborator } from '@/lib/appwrite';
import { fetchProfilePreview, getCachedProfilePreview } from '@/lib/profilePreview';

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
  profilePicId?: string | null;
}

interface FoundUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string | null;
}

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

  // Preview maps (userId -> preview URL|null)
  const [resultPreviews, setResultPreviews] = useState<Record<string, string | null>>({});
  const [sharedPreviews, setSharedPreviews] = useState<Record<string, string | null>>({});

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  const validEmail = useMemo(() => emailRegex.test(query.trim()), [query, emailRegex]);

  const fetchAndCachePreview = useCallback(async (fileId?: string | null) => {
    if (!fileId) return null;
    // Return cached value synchronously if available (string | null), otherwise fetch and cache
    const cached = getCachedProfilePreview(fileId);
    if (cached !== undefined) return cached;
    try {
      const url = await fetchProfilePreview(fileId, 64, 64);
      return url;
    } catch (err) {
      return null;
    }
  }, []);

  const loadSharedUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const users = await getSharedUsers(noteId);
      setSharedUsers(users as SharedUser[]);

      // Prefetch previews for shared users
      for (const u of users as SharedUser[]) {
        const fileId = u?.profilePicId ?? null;
        if (!fileId) continue;
        try {
          const url = await fetchAndCachePreview(fileId);
          setSharedPreviews(prev => (prev[u.id] === url ? prev : { ...prev, [u.id]: url }));
        } catch {
          // ignore preview errors
        }
      }
    } catch (err) {
      console.error('Failed to load shared users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [noteId, fetchAndCachePreview]);

  useEffect(() => {
    if (isOpen) {
      loadSharedUsers();
    }
  }, [isOpen, loadSharedUsers]);

  const debouncedSearch = useCallback(async () => {
    if (!query.trim() || selectedUser) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchUsers(query);
      setResults(res as FoundUser[]);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedUser]);

  useEffect(() => {
    const t = setTimeout(() => {
      debouncedSearch();
    }, 300);
    return () => clearTimeout(t);
  }, [query, debouncedSearch]);

  // Prefetch previews for search results when they change
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      for (const user of results) {
        const fileId = user.avatar || null;
        if (!fileId) continue;
        // skip if already have a preview for this user
        if (resultPreviews[user.id] !== undefined) continue;
        try {
          const url = await fetchAndCachePreview(fileId);
          if (!mounted) return;
          setResultPreviews(prev => (prev[user.id] === url ? prev : { ...prev, [user.id]: url }));
        } catch {
          // ignore
        }
      }
    };
    if (results.length) load();
    return () => { mounted = false; };
  }, [results, fetchAndCachePreview, resultPreviews]);

  const resetMessages = () => {
    setErrorMsg(null); setSuccessMsg(null);
  };

  const handleShare = async () => {
    resetMessages();
    if (!selectedUser && !validEmail) {
      setErrorMsg('Select a user or enter a valid email');
      return;
    }

    // Duplicate guard
    if (selectedUser && sharedUsers.some(u => u.id === selectedUser.id)) {
      setErrorMsg('Already shared with this user');
      return;
    }
    if (!selectedUser && validEmail && sharedUsers.some(u => u.email.toLowerCase() === query.trim().toLowerCase())) {
      setErrorMsg('Already shared with this email');
      return;
    }

    let optimistic: SharedUser | null = null;
    try {
      setIsLoading(true);
      if (selectedUser) {
        optimistic = {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email || selectedUser.name,
          permission,
          collaborationId: 'pending'
        } as SharedUser;
      } else if (validEmail) {
        optimistic = {
          id: 'pending-' + Date.now(),
          email: query.trim(),
          permission,
          collaborationId: 'pending'
        } as SharedUser;
      }

      if (optimistic) {
        setSharedUsers(prev => [...prev, optimistic!]);
      }

      let response;
      if (selectedUser) {
        response = await shareNoteWithUserId(noteId, selectedUser.id, permission, selectedUser.email || undefined);
      } else {
        response = await shareNoteWithUser(noteId, query.trim(), permission);
      }

      setSuccessMsg(response.message || 'Shared successfully');
      setQuery('');
      setSelectedUser(null);
      setResults([]);

      // Reconcile actual data
      await loadSharedUsers();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err);
      setErrorMsg(msg || 'Failed to share note');
      if (optimistic) {
        setSharedUsers(prev => prev.filter(u => u !== optimistic));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (collab: SharedUser, newPerm: 'read' | 'write' | 'admin') => {
    if (collab.permission === newPerm || !collab.collaborationId) return;
    const prevPerm = collab.permission;
    setUpdatingCollab(collab.collaborationId);
    // Optimistic update
    setSharedUsers(prev => prev.map(u => u.id === collab.id ? { ...u, permission: newPerm } : u));
    try {
      await updateCollaborator(collab.collaborationId, { permission: newPerm });
      setSuccessMsg('Permission updated');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err);
      setErrorMsg(msg || 'Failed updating permission');
      // Revert
      setSharedUsers(prev => prev.map(u => u.id === collab.id ? { ...u, permission: prevPerm } : u));
    } finally {
      setUpdatingCollab(null);
    }
  };

  const handleRemoveSharing = async (sharedUserId: string, userEmail: string) => {
    resetMessages();
    const previous = sharedUsers;
    // Optimistic removal
    setSharedUsers(prev => prev.filter(u => u.id !== sharedUserId));
    try {
      await removeNoteSharing(noteId, sharedUserId);
      setSuccessMsg(`Removed sharing with ${userEmail}`);
    } catch (err: unknown) {
      console.error('Failed to remove sharing:', err);
      setSharedUsers(previous); // revert
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : String(err);
      setErrorMsg(msg || 'Failed to remove sharing');
    }
  };

  const shareDisabled = isLoading || (!selectedUser && !validEmail);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onOpenChange(false)}
      title="Share Note"
      className="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted mb-2">
          Share &quot;{noteTitle}&quot; with other users by name search or email.
        </p>

{(errorMsg || successMsg) && (
            <div className={`text-xs rounded-md px-3 py-2 border ${errorMsg ? 'border-red-400 text-red-600 bg-red-50' : 'border-green-400 text-green-600 bg-green-50'}`}>
              {errorMsg || successMsg}
            </div>
          )}

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
                if (!shareDisabled) handleShare();
              }
            }}
          />
          {query && results.length > 0 && !selectedUser && (
            <div className="border border-border rounded-md max-h-40 overflow-y-auto divide-y divide-border">
              {results.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => { setSelectedUser(user); setQuery(user.name || user.email || ''); resetMessages(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-card/80 focus:outline-none text-sm text-foreground"
                >
                  {resultPreviews[user.id] ? (
                    <img src={resultPreviews[user.id] as string} alt={user.name || user.email || 'User'} className="h-6 w-6 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-card text-xs font-medium text-foreground">
                      {(user.name || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || user.email}</span>
                    {user.email && user.email !== user.name && (
                      <span className="text-xs text-muted">{user.email}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          {query && !isSearching && results.length === 0 && !selectedUser && validEmail === false && (
            <div className="text-xs text-muted">No users found</div>
          )}
          {selectedUser && (
            <div className="flex items-center gap-2 text-xs text-muted">
              Selected: <span className="font-medium text-foreground">{selectedUser.name || selectedUser.email}</span>
              <button
                onClick={() => { setSelectedUser(null); setQuery(''); }}
                className="text-muted hover:text-red-500"
              >Clear</button>
            </div>
          )}
          {isSearching && <div className="text-xs text-muted">Searching...</div>}
        </div>

        {/* Permission Level */}
        <div className="space-y-2">
          <Label htmlFor="permission">Permission Level</Label>
            <select
              id="permission"
              value={permission}
              onChange={(e) => setPermission(e.target.value as 'read' | 'write' | 'admin')}
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="read">Read Only</option>
              <option value="write">Read & Write</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
        </div>

        {/* Share Button */}
        <Button onClick={handleShare} disabled={shareDisabled} className="w-full">
          {isLoading ? 'Sharing...' : 'Share Note'}
        </Button>

        {/* Currently Shared Users */}
        {(sharedUsers.length > 0 || isLoadingUsers) && (
          <div className="space-y-2">
            <Label>Currently Shared With</Label>
            {isLoadingUsers ? (
              <div className="text-sm text-muted">Loading...</div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sharedUsers.map((user) => (
                  <div key={user.id + (user.collaborationId || '')} className="flex items-center justify-between p-2 border border-border rounded-md bg-card">
                    <div className="flex items-center gap-2">
                      {sharedPreviews[user.id] ? (
                        <img src={sharedPreviews[user.id] as string} alt={user.name || user.email || 'User'} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center font-medium text-sm text-foreground">
                          {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="text-sm">{user.name ? `${user.name} (${user.email})` : user.email}</span>
                      <div className="flex items-center gap-1">
                        <select
                          value={user.permission}
                          onChange={(e) => handleUpdatePermission(user, e.target.value as 'read' | 'write' | 'admin')}
                          className="h-7 rounded-md border border-border bg-card text-xs px-1 py-0.5 text-foreground focus:outline-none"
                          disabled={updatingCollab === user.collaborationId || user.collaborationId === 'pending'}
                        >
                          <option value="read">read</option>
                          <option value="write">write</option>
                          <option value="admin">admin</option>
                        </select>
                        {updatingCollab === user.collaborationId && (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-border border-t-transparent" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSharing(user.id, user.email)}
                      className="h-6 w-6 p-0 text-muted hover:text-red-500 text-sm disabled:opacity-50"
                      disabled={user.collaborationId === 'pending'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
