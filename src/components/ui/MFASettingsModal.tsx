'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface MFASettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  factor: 'totp' | 'email';
  isEnabled: boolean;
  onEnable: (factor: 'totp' | 'email') => Promise<void>;
  onDisable: (factor: 'totp' | 'email') => Promise<void>;
  onVerify?: (factor: 'totp' | 'email', otp: string) => Promise<void>;
  totpSecret?: string;
  totpQrCode?: string;
  totpManualEntry?: string;
}

export const MFASettingsModal: React.FC<MFASettingsModalProps> = ({
  isOpen,
  onClose,
  factor,
  isEnabled,
  onEnable,
  onDisable,
  onVerify,
  totpSecret,
  totpQrCode,
  totpManualEntry,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'confirm' | 'setup' | 'verify'>('confirm');

  if (!isOpen) return null;

  const handleEnable = async () => {
    if (factor === 'totp') {
      setStep('setup');
    } else {
      setStep('verify');
      setLoading(true);
      try {
        await onEnable(factor);
        setSuccess('Email MFA has been enabled. Check your email for verification.');
        setStep('verify');
      } catch (err: any) {
        setError(err.message || 'Failed to enable email MFA');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyTOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    setLoading(true);
    try {
      if (onVerify) {
        await onVerify(factor, otp);
      }
      setSuccess(`${factor === 'totp' ? 'TOTP' : 'Email'} MFA has been successfully enabled!`);
      setTimeout(() => {
        resetModal();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await onDisable(factor);
      setSuccess(`${factor === 'totp' ? 'TOTP' : 'Email'} MFA has been disabled`);
      setTimeout(() => {
        resetModal();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setOtp('');
    setError('');
    setSuccess('');
    setStep('confirm');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold text-foreground mb-4">
          {factor === 'totp' ? 'Authenticator App (TOTP)' : 'Email OTP'} MFA
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              {isEnabled
                ? `${factor === 'totp' ? 'TOTP' : 'Email'} MFA is currently enabled. You can disable it if you no longer need it.`
                : `Enable ${factor === 'totp' ? 'TOTP' : 'Email'} MFA to add an extra layer of security to your account.`}
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              {isEnabled ? (
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Disabling...' : 'Disable MFA'}
                </Button>
              ) : (
                <Button onClick={handleEnable} disabled={loading} className="flex-1">
                  {loading ? 'Enabling...' : 'Enable MFA'}
                </Button>
              )}
            </div>
          </div>
        )}

        {step === 'setup' && factor === 'totp' && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">
                Scan this QR code with your authenticator app:
              </p>
              {totpQrCode && (
                <div className="bg-white p-4 rounded-lg flex justify-center">
                  <img src={totpQrCode} alt="TOTP QR Code" className="w-48 h-48" />
                </div>
              )}
            </div>

            {totpManualEntry && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Or enter this code manually:</p>
                <code className="block bg-background p-3 rounded-lg text-sm text-foreground break-all border border-border">
                  {totpManualEntry}
                </code>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter 6-digit code from your authenticator:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleVerifyTOTP} disabled={loading || otp.length !== 6} className="flex-1">
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && factor === 'email' && (
          <div className="space-y-4">
            <p className="text-sm text-foreground/70">
              A verification code has been sent to your email. Please enter it below:
            </p>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter verification code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleVerifyTOTP} disabled={loading || otp.length !== 6} className="flex-1">
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
