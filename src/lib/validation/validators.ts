import { PATTERNS, RULES } from './rules';

// Email validator
export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  if (!PATTERNS.email.test(email)) return 'Please enter a valid email address';
  return null;
};

// Password validator
export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!PATTERNS.password.uppercase.test(password)) return 'Password must contain an uppercase letter';
  if (!PATTERNS.password.lowercase.test(password)) return 'Password must contain a lowercase letter';
  if (!PATTERNS.password.number.test(password)) return 'Password must contain a number';
  if (!PATTERNS.password.special.test(password)) return 'Password must contain a special character';
  return null;
};

// Password strength calculator
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  criteria: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const criteria = {
    minLength: password.length >= 8,
    hasUppercase: PATTERNS.password.uppercase.test(password),
    hasLowercase: PATTERNS.password.lowercase.test(password),
    hasNumber: PATTERNS.password.number.test(password),
    hasSpecial: PATTERNS.password.special.test(password),
  };

  const score = Object.values(criteria).filter(Boolean).length;

  let label: PasswordStrength['label'] = 'Weak';
  let color = '#ef4444'; // red

  if (score >= 5) {
    label = 'Strong';
    color = '#10b981'; // green
  } else if (score >= 4) {
    label = 'Good';
    color = '#3b82f6'; // blue
  } else if (score >= 3) {
    label = 'Fair';
    color = '#f59e0b'; // yellow
  }

  return { score, label, color, criteria };
};

// Phone validator
export const validatePhone = (phone: string): string | null => {
  if (!phone) return null; // Optional field
  if (!PATTERNS.phone.test(phone)) return 'Please enter a valid phone number';
  return null;
};

// Required field validator
export const validateRequired = (value: any, fieldName: string = 'This field'): string | null => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

// Min length validator
export const validateMinLength = (value: string, min: number): string | null => {
  if (value && value.length < min) {
    return `Must be at least ${min} characters`;
  }
  return null;
};

// Max length validator
export const validateMaxLength = (value: string, max: number): string | null => {
  if (value && value.length > max) {
    return `Must be at most ${max} characters`;
  }
  return null;
};

// Confirm password validator
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

// File size validator
export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must be less than ${maxSizeMB}MB`;
  }
  return null;
};

// File type validator
export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  return null;
};

// Compose multiple validators
export const composeValidators = (...validators: Array<(value: any) => string | null>) => {
  return (value: any): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};
