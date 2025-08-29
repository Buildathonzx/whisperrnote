export interface PasswordStrength {
  score: number; // 0-4 (very weak to very strong)
  feedback: string[];
  isValid: boolean;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false, // Optional for better UX
};

export function validatePasswordStrength(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordStrength {
  const requirementsMet = {
    length: password.length >= requirements.minLength,
    uppercase: requirements.requireUppercase ? /[A-Z]/.test(password) : true,
    lowercase: requirements.requireLowercase ? /[a-z]/.test(password) : true,
    number: requirements.requireNumber ? /\d/.test(password) : true,
    special: requirements.requireSpecial ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) : true,
  };

  const metCount = Object.values(requirementsMet).filter(Boolean).length;
  const totalRequirements = Object.keys(requirementsMet).length;

  // Calculate score based on requirements met and additional factors
  let score = metCount;
  if (password.length >= 12) score += 0.5; // Bonus for longer passwords
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 0.5; // Bonus for special chars

  score = Math.min(4, Math.max(0, score));

  const feedback: string[] = [];

  if (!requirementsMet.length) {
    feedback.push(`Password must be at least ${requirements.minLength} characters long`);
  }
  if (!requirementsMet.uppercase) {
    feedback.push('Password must contain at least one uppercase letter');
  }
  if (!requirementsMet.lowercase) {
    feedback.push('Password must contain at least one lowercase letter');
  }
  if (!requirementsMet.number) {
    feedback.push('Password must contain at least one number');
  }
  if (requirements.requireSpecial && !requirementsMet.special) {
    feedback.push('Password must contain at least one special character');
  }

  // Additional feedback for better passwords
  if (score >= 3 && password.length < 12) {
    feedback.push('Consider using a longer password for better security');
  }

  return {
    score: Math.floor(score),
    feedback,
    isValid: metCount === totalRequirements,
    requirements: requirementsMet,
  };
}

export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Strong';
    default: return 'Unknown';
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0: return 'text-red-600 dark:text-red-400';
    case 1: return 'text-orange-600 dark:text-orange-400';
    case 2: return 'text-yellow-600 dark:text-yellow-400';
    case 3: return 'text-blue-600 dark:text-blue-400';
    case 4: return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  let password = '';

  // Ensure at least one of each required type
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = password.length; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}