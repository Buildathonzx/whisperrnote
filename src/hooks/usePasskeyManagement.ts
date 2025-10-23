'use client';

import { useState } from 'react';
import {
  addPasskeyToAccount,
  listPasskeys,
  deletePasskey,
  renamePasskey,
  disablePasskey,
  enablePasskey,
  authenticateWithPasskey
} from '@/lib/passkey-client-utils';

interface PasskeyInfo {
  id: string;
  name: string;
  createdAt: number;
  lastUsedAt: number | null;
  status: 'active' | 'disabled' | 'compromised';
}

export function usePasskeyManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);

  const addPasskey = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await addPasskeyToAccount(email);
      setSuccess('Passkey added successfully');
      await loadPasskeys(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to add passkey');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadPasskeys = async (email: string) => {
    setLoading(true);
    try {
      const data = await listPasskeys(email);
      setPasskeys(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load passkeys');
    } finally {
      setLoading(false);
    }
  };

  const removePasskey = async (email: string, credentialId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await deletePasskey(email, credentialId);
      setSuccess('Passkey deleted');
      await loadPasskeys(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete passkey');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const renameKey = async (email: string, credentialId: string, name: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await renamePasskey(email, credentialId, name);
      setSuccess('Passkey renamed');
      await loadPasskeys(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to rename passkey');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disableKey = async (email: string, credentialId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await disablePasskey(email, credentialId);
      setSuccess('Passkey disabled');
      await loadPasskeys(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to disable passkey');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const enableKey = async (email: string, credentialId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await enablePasskey(email, credentialId);
      setSuccess('Passkey enabled');
      await loadPasskeys(email);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to enable passkey');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authenticateWithPasskey(email);
      setSuccess('Authenticated with passkey');
      return true;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    passkeys,
    addPasskey,
    loadPasskeys,
    removePasskey,
    renameKey,
    disableKey,
    enableKey,
    authenticate,
    clearMessages
  };
}
