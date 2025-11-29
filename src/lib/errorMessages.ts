// Error Message Utilities
// Converts technical errors to user-friendly messages

export interface ErrorInfo {
  title: string;
  message: string;
  action?: string;
  technical?: string; // For developers/logs
}

/**
 * Get user-friendly error message from error object
 */
export function getErrorMessage(error: any): ErrorInfo {
  // Network errors
  if (!error.response) {
    return {
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      action: 'Retry',
      technical: error.message,
    };
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  // Status-based errors
  switch (status) {
    case 400:
      return {
        title: 'Invalid Request',
        message: serverMessage || 'The information you provided is not valid. Please check and try again.',
        action: 'Fix and Retry',
        technical: `400: ${serverMessage}`,
      };

    case 401:
      return {
        title: 'Please Sign In',
        message: 'Your session has expired. Please sign in again to continue.',
        action: 'Sign In',
        technical: '401: Unauthorized',
      };

    case 403:
      return {
        title: 'Access Denied',
        message: "You don't have permission to do this. Contact support if you think this is a mistake.",
        action: 'Go Back',
        technical: '403: Forbidden',
      };

    case 404:
      return {
        title: 'Not Found',
        message: "We couldn't find what you're looking for. It may have been removed or doesn't exist.",
        action: 'Go Home',
        technical: '404: Not Found',
      };

    case 409:
      return {
        title: 'Already Exists',
        message: serverMessage || 'This item already exists. Please use a different name or value.',
        action: 'Try Different Value',
        technical: `409: ${serverMessage}`,
      };

    case 422:
      return {
        title: 'Validation Error',
        message: serverMessage || 'The information you provided is incomplete or invalid. Please review and try again.',
        action: 'Review and Fix',
        technical: `422: ${serverMessage}`,
      };

    case 429:
      return {
        title: 'Too Many Requests',
        message: "You're doing that too quickly. Please wait a moment and try again.",
        action: 'Wait and Retry',
        technical: '429: Rate Limited',
      };

    case 500:
      return {
        title: 'Server Error',
        message: "Something went wrong on our end. We're working to fix it. Please try again later.",
        action: 'Try Again',
        technical: '500: Internal Server Error',
      };

    case 502:
    case 503:
    case 504:
      return {
        title: 'Service Unavailable',
        message: "Our servers are temporarily unavailable. We'll be back shortly. Please try again in a few minutes.",
        action: 'Try Again Later',
        technical: `${status}: Service Unavailable`,
      };

    default:
      return {
        title: 'Something Went Wrong',
        message: serverMessage || 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        action: 'Try Again',
        technical: `${status}: ${serverMessage || 'Unknown error'}`,
      };
  }
}

/**
 * Get error message for specific operations
 */
export function getOperationError(operation: string, error: any): ErrorInfo {
  const baseError = getErrorMessage(error);

  const operations: Record<string, { title: string; message: string }> = {
    login: {
      title: 'Login Failed',
      message: 'Your email or password is incorrect. Please try again.',
    },
    register: {
      title: 'Registration Failed',
      message: 'Unable to create your account. This email may already be in use.',
    },
    create: {
      title: 'Creation Failed',
      message: 'Unable to create this item. Please check your information and try again.',
    },
    update: {
      title: 'Update Failed',
      message: 'Unable to save your changes. Please try again.',
    },
    delete: {
      title: 'Delete Failed',
      message: 'Unable to delete this item. Please try again.',
    },
    upload: {
      title: 'Upload Failed',
      message: 'Unable to upload your file. Please check the file size and format.',
    },
    fetch: {
      title: 'Loading Failed',
      message: 'Unable to load this information. Please refresh the page.',
    },
    payment: {
      title: 'Payment Failed',
      message: 'Unable to process your payment. Please check your payment details and try again.',
    },
  };

  const customError = operations[operation];
  
  if (customError) {
    return {
      ...baseError,
      title: customError.title,
      message: error.response?.status === 401 ? baseError.message : customError.message,
    };
  }

  return baseError;
}

/**
 * Format validation errors
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages = Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
      return `${fieldName}: ${messages.join(', ')}`;
    })
    .join('. ');

  return messages || 'Please check your information and try again.';
}

/**
 * Get user-friendly file upload error
 */
export function getFileUploadError(error: string): string {
  const errors: Record<string, string> = {
    'file-too-large': 'File is too large. Please choose a smaller file.',
    'invalid-type': 'File type is not supported. Please use a different file format.',
    'file-invalid': 'File is invalid or corrupted. Please try another file.',
    'too-many-files': 'Too many files selected. Please select fewer files.',
    'no-file': 'No file selected. Please choose a file to upload.',
  };

  return errors[error] || 'Unable to upload file. Please try again.';
}
