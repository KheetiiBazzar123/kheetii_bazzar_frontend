'use client';

import { useState, useCallback } from 'react';

export interface FormErrors {
  [key: string]: string | null;
}

export interface TouchedFields {
  [key: string]: boolean;
}

export interface UseFormValidationProps {
  initialValues: { [key: string]: any };
  validators: { [key: string]: (value: any) => string | null };
  onSubmit: (values: { [key: string]: any }) => void | Promise<void>;
}

export interface UseFormValidationReturn {
  values: { [key: string]: any };
  errors: FormErrors;
  touched: TouchedFields;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string | null) => void;
  setFieldTouched: (field: string, isTouched: boolean) => void;
  validateField: (field: string) => string | null;
  validateForm: () => boolean;
  resetForm: () => void;
}

export const useFormValidation = ({
  initialValues,
  validators,
  onSubmit
}: UseFormValidationProps): UseFormValidationReturn => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: string): string | null => {
    const validator = validators[field];
    if (!validator) return null;
    
    const error = validator(values[field]);
    return error;
  }, [values, validators]);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validators).forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, validators]);

  // Handle input change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox
    const newValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setValues(prev => ({ ...prev, [name]: newValue }));

    // Clear error when user starts typing
    if (touched[name] && errors[name]) {
      const error = validateField(name);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, errors, validateField]);

  // Handle input blur
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  // Handle form submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: TouchedFields = {};
    Object.keys(validators).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validators, validateForm, onSubmit]);

  // Set field value programmatically
  const setFieldValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).every(key => !errors[key]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
  };
};
