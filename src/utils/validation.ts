export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

export const validateNumber = (value: number, min?: number, max?: number): boolean => {
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export interface ValidationError {
  field: string;
  message: string;
}

export const validateOrderForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(data.clientName)) {
    errors.push({ field: 'clientName', message: 'Client name is required' });
  }

  if (!validateRequired(data.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
  } else if (!validatePhone(data.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
  }

  if (!validateRequired(data.city)) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!validateRequired(data.requirementSummary)) {
    errors.push({ field: 'requirementSummary', message: 'Requirement summary is required' });
  }

  if (!validateNumber(data.amount, 1)) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0' });
  }

  return errors;
};

export const validateInquiryForm = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!validateRequired(data.clientName)) {
    errors.push({ field: 'clientName', message: 'Client name is required' });
  }

  if (!validateRequired(data.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
  } else if (!validatePhone(data.phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number' });
  }

  if (!validateRequired(data.city)) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!validateRequired(data.requirementSummary)) {
    errors.push({ field: 'requirementSummary', message: 'Requirement summary is required' });
  }

  return errors;
};