'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import QRCode from 'qrcode.react';

interface MFAModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'totp' | 'email';
  isEnabled: boolean;
  onEnable: (method: 'totp' | 'email') => Promise<void>;
  onDisable: (method: 'totp' | 'email') => Promise<void>;
}

export function MFAModal({ isOpen, onClose, type, isEnabled, onEnable, onDisable }: MFAModalProps) {
  const [step, setStep] = useState<'confirm' | 'setup' | 'verify'>('confirm');
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(isEnabled ? 'confirm' : 'setup');
      setSecret('');
      setQrCode('');
      setVerificationCode('');
      setError('');
      setLoading(false);
    }
  }, [isOpen, isEnabled]);

  const handleSetupTOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mfa/totp/setup', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to setup TOTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    if (!verificationCode.trim()) {
      setError('Enter the code from your authenticator app');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await onEnable('totp');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await onEnable('email');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to enable email MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      await onDisable(type);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {type === 'totp' ? 'Authenticator App (TOTP)' : 'Email OTP'} MFA
        </h2>

        {isEnabled && step === 'confirm' && (
          <div className="space-y-4">
            <div className="p-3 bg-green-100/50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                This authentication method is currently enabled.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-red-600 dark:text-red-400"
                onClick={handleDisable}
                disabled={loading}
              >
                Disable
              </Button>
            </div>
          </div>
        )}

        {!isEnabled && step === 'setup' && type === 'totp' && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator to scan the QR code.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSetupTOTP}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Loading...' : 'Generate QR Code'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isEnabled && step === 'verify' && type === 'totp' && qrCode && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="TOTP QR Code" className="w-40 h-40" />
            </div>
            <p className="text-xs text-foreground/60 text-center">
              Manual entry code: <code className="font-mono bg-card p-1 rounded">{secret}</code>
            </p>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full px-3 py-2 bg-card border border-border rounded text-center text-lg tracking-widest"
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleVerifyTOTP}
                disabled={loading || verificationCode.length !== 6}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('setup')}
                className="flex-1"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {!isEnabled && step === 'setup' && type === 'email' && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              Receive one-time codes via email for additional security. You'll receive a code every time you log in.
            </p>
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleEnableEmail}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Enabling...' : 'Enable Email MFA'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
