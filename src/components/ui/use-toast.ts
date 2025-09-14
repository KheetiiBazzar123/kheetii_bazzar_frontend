import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

let toastCount = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = (++toastCount).toString();
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
    };
  }, []);

  return {
    toast,
    toasts,
    dismiss: (id: string) => setToasts(prev => prev.filter(t => t.id !== id)),
  };
}

// Export toast function directly for convenience
export const toast = ({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
  console.log(`Toast: ${title} - ${description}`);
  // In a real app, you'd use a toast library like react-hot-toast or sonner
};
