import { useState, useCallback } from 'react';

/**
 * Custom hook for managing loading states
 */
export function useLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
  };
}

/**
 * Hook for managing multiple loading states
 */
export function useLoadingStates<T extends string>(
  initialStates?: Record<T, boolean>
) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    initialStates || {}
  );

  const startLoading = useCallback((key: T) => {
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: T) => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
  }, []);

  const isLoading = useCallback((key: T) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some((loading) => loading);
  }, [loadingStates]);

  return {
    loadingStates,
    startLoading,
    stopLoading,
    isLoading,
    isAnyLoading,
  };
}

/**
 * Hook for async operations with loading state
 */
export function useAsyncLoading<T extends (...args: any[]) => Promise<any>>(
  asyncFunction: T
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  return {
    execute,
    isLoading,
    error,
  };
}
