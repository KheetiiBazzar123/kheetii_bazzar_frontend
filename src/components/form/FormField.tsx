'use client';

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import ValidationMessage from './ValidationMessage';

export interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  label?: string;
  error?: string | null;
  touched?: boolean;
  showValidIcon?: boolean;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

export interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  name: string;
  label?: string;
  error?: string | null;
  touched?: boolean;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  containerClassName?: string;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      name,
      label,
      error,
      touched = false,
      showValidIcon = true,
      helperText,
      required = false,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;
    const isValid = touched && !error && props.value;

    const inputClasses = `
      w-full px-3 py-2 border rounded-lg
      focus:outline-none focus:ring-2
      transition-all duration-200
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
        : isValid && showValidIcon
        ? 'border-green-500 focus:border-green-500 focus:ring-green-200 dark:focus:ring-green-900'
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
      }
      dark:bg-gray-800 dark:text-white
      ${className}
    `;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label 
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            className={inputClasses}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
            {...props}
          />

          {/* Valid/Invalid Icon */}
          {touched && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {hasError ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : isValid && showValidIcon ? (
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && !hasError && (
          <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {hasError && (
          <ValidationMessage
            type="error"
            message={error}
            show={true}
          />
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// TextAreaField component
export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (
    {
      name,
      label,
      error,
      touched = false,
      helperText,
      required = false,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const hasError = touched && error;

    const textareaClasses = `
      w-full px-3 py-2 border rounded-lg
      focus:outline-none focus:ring-2
      transition-all duration-200
      ${hasError 
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900' 
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
      }
      dark:bg-gray-800 dark:text-white
      ${className}
    `;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label 
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={name}
          name={name}
          className={textareaClasses}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : helperText ? `${name}-helper` : undefined}
          {...props}
        />

        {helperText && !hasError && (
          <p id={`${name}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}

        {hasError && (
          <ValidationMessage
            type="error"
            message={error}
            show={true}
          />
        )}
      </div>
    );
  }
);

TextAreaField.displayName = 'TextAreaField';

export default FormField;
