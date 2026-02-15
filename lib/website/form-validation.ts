/**
 * Website System Form Validation
 * Implements real-time validation, error messages, form submission handling, success states
 */

/**
 * Validation rule
 */
export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  required?: boolean;
  custom?: (value: any) => boolean;
  message?: string;
}

/**
 * Form field state
 */
export interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a value against a rule
 */
export function validateValue(value: any, rule: ValidationRule): ValidationResult {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return {
      isValid: false,
      error: rule.message || 'This field is required',
    };
  }

  // If not required and empty, skip other validations
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return { isValid: true };
  }

  // Check pattern
  if (rule.pattern && !rule.pattern.test(String(value))) {
    return {
      isValid: false,
      error: rule.message || 'Invalid format',
    };
  }

  // Check minLength
  if (rule.minLength !== undefined && String(value).length < rule.minLength) {
    return {
      isValid: false,
      error: rule.message || `Minimum length is ${rule.minLength}`,
    };
  }

  // Check maxLength
  if (rule.maxLength !== undefined && String(value).length > rule.maxLength) {
    return {
      isValid: false,
      error: rule.message || `Maximum length is ${rule.maxLength}`,
    };
  }

  // Check min
  if (rule.min !== undefined && Number(value) < rule.min) {
    return {
      isValid: false,
      error: rule.message || `Minimum value is ${rule.min}`,
    };
  }

  // Check max
  if (rule.max !== undefined && Number(value) > rule.max) {
    return {
      isValid: false,
      error: rule.message || `Maximum value is ${rule.max}`,
    };
  }

  // Check custom validation
  if (rule.custom && !rule.custom(value)) {
    return {
      isValid: false,
      error: rule.message || 'Validation failed',
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple rules
 */
export function validateRules(value: any, rules: ValidationRule[]): ValidationResult {
  for (const rule of rules) {
    const result = validateValue(value, rule);
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
}

/**
 * Common validation patterns
 */
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alpha: /^[a-zA-Z]+$/,
  numeric: /^[0-9]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  username: /^[a-zA-Z0-9_-]{3,16}$/,
  zipcode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{13,19}$/,
} as const;

/**
 * Common validation rules
 */
export const COMMON_RULES = {
  email: {
    pattern: VALIDATION_PATTERNS.email,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: VALIDATION_PATTERNS.phone,
    minLength: 10,
    message: 'Please enter a valid phone number',
  },
  url: {
    pattern: VALIDATION_PATTERNS.url,
    message: 'Please enter a valid URL',
  },
  password: {
    pattern: VALIDATION_PATTERNS.password,
    message: 'Password must contain uppercase, lowercase, number, and special character',
  },
  username: {
    pattern: VALIDATION_PATTERNS.username,
    message: 'Username must be 3-16 characters and contain only letters, numbers, hyphens, and underscores',
  },
  zipcode: {
    pattern: VALIDATION_PATTERNS.zipcode,
    message: 'Please enter a valid zip code',
  },
  creditCard: {
    pattern: VALIDATION_PATTERNS.creditCard,
    message: 'Please enter a valid credit card number',
  },
} as const;

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  return validateValue(email, {
    required: true,
    ...COMMON_RULES.email,
  });
}

/**
 * Validate phone
 */
export function validatePhone(phone: string): ValidationResult {
  return validateValue(phone, {
    required: true,
    ...COMMON_RULES.phone,
  });
}

/**
 * Validate URL
 */
export function validateUrl(url: string): ValidationResult {
  return validateValue(url, {
    required: true,
    ...COMMON_RULES.url,
  });
}

/**
 * Validate password
 */
export function validatePassword(password: string): ValidationResult {
  return validateValue(password, {
    required: true,
    ...COMMON_RULES.password,
  });
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  return validateValue(username, {
    required: true,
    ...COMMON_RULES.username,
  });
}

/**
 * Validate zip code
 */
export function validateZipcode(zipcode: string): ValidationResult {
  return validateValue(zipcode, {
    required: true,
    ...COMMON_RULES.zipcode,
  });
}

/**
 * Validate credit card
 */
export function validateCreditCard(cardNumber: string): ValidationResult {
  return validateValue(cardNumber, {
    required: true,
    ...COMMON_RULES.creditCard,
  });
}

/**
 * Validate form
 */
export function validateForm(
  values: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([fieldName, fieldRules]) => {
    const result = validateRules(values[fieldName], fieldRules);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return errors;
}

/**
 * Check if form is valid
 */
export function isFormValid(errors: Record<string, string>): boolean {
  return Object.keys(errors).length === 0;
}

/**
 * Get field error
 */
export function getFieldError(
  fieldName: string,
  errors: Record<string, string>,
  touched: Record<string, boolean>
): string | undefined {
  if (touched[fieldName] && errors[fieldName]) {
    return errors[fieldName];
  }
  return undefined;
}

/**
 * Mark field as touched
 */
export function markFieldTouched(
  fieldName: string,
  touched: Record<string, boolean>
): Record<string, boolean> {
  return {
    ...touched,
    [fieldName]: true,
  };
}

/**
 * Mark field as dirty
 */
export function markFieldDirty(
  fieldName: string,
  dirty: Record<string, boolean>
): Record<string, boolean> {
  return {
    ...dirty,
    [fieldName]: true,
  };
}

/**
 * Reset form
 */
export function resetForm(initialValues: Record<string, any>): FormState {
  return {
    values: initialValues,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValid: true,
  };
}

/**
 * Update form field
 */
export function updateFormField(
  fieldName: string,
  value: any,
  formState: FormState,
  rules?: Record<string, ValidationRule[]>
): FormState {
  const newValues = {
    ...formState.values,
    [fieldName]: value,
  };

  let newErrors = formState.errors;
  if (rules && rules[fieldName]) {
    const result = validateRules(value, rules[fieldName]);
    if (result.isValid) {
      const { [fieldName]: _, ...rest } = newErrors;
      newErrors = rest;
    } else if (result.error) {
      newErrors = {
        ...newErrors,
        [fieldName]: result.error,
      };
    }
  }

  return {
    ...formState,
    values: newValues,
    errors: newErrors,
    dirty: markFieldDirty(fieldName, formState.dirty),
    isValid: isFormValid(newErrors),
  };
}

/**
 * Submit form
 */
export function submitForm(
  formState: FormState,
  rules: Record<string, ValidationRule[]>
): FormState {
  const errors = validateForm(formState.values, rules);
  const isValid = isFormValid(errors);

  return {
    ...formState,
    errors,
    isValid,
    isSubmitting: false,
    touched: Object.keys(formState.values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    ),
  };
}

/**
 * Clear form errors
 */
export function clearFormErrors(formState: FormState): FormState {
  return {
    ...formState,
    errors: {},
  };
}

/**
 * Clear field error
 */
export function clearFieldError(
  fieldName: string,
  formState: FormState
): FormState {
  const { [fieldName]: _, ...rest } = formState.errors;
  return {
    ...formState,
    errors: rest,
  };
}
