'use client';

import React from 'react';
import { validatePasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor, type PasswordStrength } from '@/lib/passwordUtils';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
  className = ''
}) => {
  const strength = validatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              strength.score === 0 ? 'bg-red-500 w-1/4' :
              strength.score === 1 ? 'bg-orange-500 w-2/4' :
              strength.score === 2 ? 'bg-yellow-500 w-3/4' :
              strength.score === 3 ? 'bg-blue-500 w-4/4' :
              'bg-green-500 w-full'
            }`}
          />
        </div>
        <span className={`text-sm font-medium ${getPasswordStrengthColor(strength.score)}`}>
          {getPasswordStrengthLabel(strength.score)}
        </span>
      </div>

      {/* Requirements */}
      {showRequirements && strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((requirement, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-1.5 h-1.5 rounded-full ${
                requirement.includes('must') && !strength.isValid
                  ? 'bg-red-500'
                  : 'bg-green-500'
              }`} />
              <span className={
                requirement.includes('must') && !strength.isValid
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }>
                {requirement}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Success Message */}
      {strength.isValid && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span>Password meets all requirements</span>
        </div>
      )}
    </div>
  );
};

interface PasswordInputWithStrengthProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStrengthIndicator?: boolean;
  onStrengthChange?: (strength: PasswordStrength) => void;
}

export const PasswordInputWithStrength: React.FC<PasswordInputWithStrengthProps> = ({
  showStrengthIndicator = true,
  onStrengthChange,
  className = '',
  ...props
}) => {
  const [password, setPassword] = React.useState(props.value as string || '');
  const [showPassword, setShowPassword] = React.useState(false);

  const strength = React.useMemo(() => validatePasswordStrength(password), [password]);

  // Only notify parent when the derived scalar values change to avoid loops
  const lastNotifiedRef = React.useRef<{ score: number; isValid: boolean } | null>(null);
  React.useEffect(() => {
    if (!onStrengthChange) return;
    const payload = { score: strength.score, isValid: strength.isValid };
    const prev = lastNotifiedRef.current;
    if (!prev || prev.score !== payload.score || prev.isValid !== payload.isValid) {
      lastNotifiedRef.current = payload;
      onStrengthChange(strength);
    }
  }, [strength.score, strength.isValid, onStrengthChange]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          className={`w-full px-3 py-2 pr-10 border border-light-border dark:border-dark-border rounded-xl bg-light-card dark:bg-dark-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      {showStrengthIndicator && password && (
        <PasswordStrengthIndicator password={password} />
      )}
    </div>
  );
};