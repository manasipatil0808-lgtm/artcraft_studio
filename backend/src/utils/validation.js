// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (supports multiple formats)
export const isValidPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it has 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

// Password strength validation
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Password minimum length validation
export const hasMinLength = (password: string, minLength: number = 6): boolean => {
  return password.length >= minLength;
};

// Required field validation
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Check for duplicate email in existing users
export const isEmailDuplicate = async (email: string, excludeUserId?: string): Promise<boolean> => {
  // This would typically be an API call to your backend
  // For now, we'll check against localStorage or mock data
  try {
    const response = await fetch('/api/users/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, excludeUserId })
    });
    const data = await response.json();
    return data.exists;
  } catch (error) {
    // Fallback to checking mock data
    const mockUsers = [
      { email: 'admin@example.com' },
      { email: 'demo@example.com' }
    ];
    return mockUsers.some(u => u.email === email);
  }
};

// Form validation helper
export interface ValidationError {
  field: string;
  message: string;
}

export const validateRegistrationForm = async (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}): Promise<ValidationError[]> => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!isRequired(data.name)) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  // Email validation
  if (!isRequired(data.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  } else {
    // Check duplicate email
    const isDuplicate = await isEmailDuplicate(data.email);
    if (isDuplicate) {
      errors.push({ field: 'email', message: 'Email is already registered' });
    }
  }

  // Password validation
  if (!isRequired(data.password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!hasMinLength(data.password, 6)) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
  }

  // Confirm password validation
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  // Phone validation (if provided)
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  return errors;
};

export const validateLoginForm = (data: {
  email: string;
  password: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isRequired(data.email)) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!isRequired(data.password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

export const validateCheckoutForm = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!isRequired(data.customerName)) {
    errors.push({ field: 'customerName', message: 'Name is required' });
  }

  if (!isRequired(data.customerEmail)) {
    errors.push({ field: 'customerEmail', message: 'Email is required' });
  } else if (!isValidEmail(data.customerEmail)) {
    errors.push({ field: 'customerEmail', message: 'Please enter a valid email address' });
  }

  if (!isRequired(data.customerPhone)) {
    errors.push({ field: 'customerPhone', message: 'Phone number is required' });
  } else if (!isValidPhone(data.customerPhone)) {
    errors.push({ field: 'customerPhone', message: 'Please enter a valid phone number' });
  }

  if (!isRequired(data.address)) {
    errors.push({ field: 'address', message: 'Address is required' });
  }

  return errors;
};