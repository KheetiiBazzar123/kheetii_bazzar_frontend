// Validation patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-]{10,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^\d+$/,
  password: {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*(),.?":{}|<>]/,
  },
};

// Validation rules
export const RULES = {
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  
  maxLength: (max: number) => (value: string) => 
    value.length <= max || `Must be at most ${max} characters`,
  
  min: (min: number) => (value: number) =>
    value >= min || `Must be at least ${min}`,
  
  max: (max: number) => (value: number) =>
    value <= max || `Must be at most ${max}`,
  
  matches: (pattern: RegExp, message: string) => (value: string) =>
    pattern.test(value) || message,
  
  email: (value: string) =>
    !value || PATTERNS.email.test(value) || 'Please enter a valid email',
  
  phone: (value: string) =>
    !value || PATTERNS.phone.test(value) || 'Please enter a valid phone number',
  
  url: (value: string) =>
    !value || PATTERNS.url.test(value) || 'Please enter a valid URL',
  
  required: (value: any) =>
    (value !== null && value !== undefined && value !== '') || 'This field is required',
};

// File validation
export const FILE_RULES = {
  maxSize: (maxBytes: number) => (file: File) =>
    file.size <= maxBytes || `File size must be less than ${(maxBytes / 1024 / 1024).toFixed(1)}MB`,
  
  allowedTypes: (types: string[]) => (file: File) =>
    types.includes(file.type) || `File type must be one of: ${types.join(', ')}`,
  
  allowedExtensions: (extensions: string[]) => (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext && extensions.includes(ext) || `File extension must be one of: ${extensions.join(', ')}`;
  },
};
