/**
 * HTTP Hook for making API requests with standardized response handling and global error management
 *
 * This module provides a React hook for making HTTP requests with standardized
 * response and error handling. It supports:
 *
 * - Standardized API response format with statusCode, message, and data
 * - Global error handling with toast notifications
 * - Automatic loading state management
 * - Request cancellation
 * - Component unmounting safety
 * - Success and error callbacks
 * - Type-safe responses with TypeScript generics
 *
 * Key features:
 * 1. Global error handling - Components don't need to implement try/catch blocks
 * 2. Standardized responses - All API responses follow the same format
 * 3. Automatic toast notifications - Errors are displayed to the user automatically
 * 4. Loading state management - Loading state is automatically updated
 *
 * The core of this hook is the `execute()` function, which handles all the
 * request processing, response handling, and error management. See the
 * detailed documentation in the function itself.
 *
 * @see docs/http-utilities.mdc for detailed documentation
 */

import type { ApiResponse } from '@/shared/types/api-response';
import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { http } from './http';

/**
 * Common parameters for all HTTP methods
 */
type HttpMethodParams<T, TZod = any> = {
  url: string;
  options?: AxiosRequestConfig;
  schemaValidation?: ZodType<TZod>;
  onSuccess?: (data: T) => void;
  onError?: (err: any) => void;
  showErrorToast?: boolean;
};

/**
 * Parameters for HTTP methods that include a request body (POST, PUT, PATCH)
 */
type HttpMethodWithDataParams<T, TZod = any> = HttpMethodParams<T, TZod> & {
  data?: unknown;
};

/**
 * Type for the useHttp hook result
 */
type UseHttpResult = {
  loading: boolean;
  error: any;
  data: any;
  resetError: () => void;
  get: <T, TZod = any>(params: HttpMethodParams<T, TZod>) => Promise<ApiResponse<T>>;
  post: <T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) => Promise<ApiResponse<T>>;
  put: <T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) => Promise<ApiResponse<T>>;
  patch: <T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) => Promise<ApiResponse<T>>;
  delete: <T, TZod = any>(params: HttpMethodParams<T, TZod>) => Promise<ApiResponse<T>>;
};

export function useHttp(): UseHttpResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Ensure mountedRef is true when the component is mounted
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortCtrlRef.current?.abort();
    };
  }, []);

  const resetError = useCallback(() => {
    if (mountedRef.current) {
      setError(null);
    }
  }, []);

  /**
   * Core function that executes HTTP requests with global error handling and standardized response processing.
   *
   * This function provides a centralized way to handle API requests and responses, with built-in
   * error handling that eliminates the need for try/catch blocks in individual components.
   *
   * Key features:
   * - Global error handling - No need for try/catch in components
   * - Automatic toast notifications for errors
   * - Standardized response format for both success and error cases
   * - Loading state management
   * - Component unmounting safety
   *
   * @template T - The type of data expected in the successful response
   * @param fn - Function that performs the actual HTTP request, accepting an AbortSignal and returning a Promise with ApiResponse
   * @param onSuccess - Optional callback function that receives the data on successful response
   * @param onError - Optional callback function that receives the error on failed response
   * @param showErrorToast - Whether to show toast notifications for errors (defaults to true)
   * @returns Promise with the standardized ApiResponse containing status, message, and data
   *
   * The function handles:
   * - Request cancellation via AbortController
   * - Component unmounting during requests
   * - Standardized error responses
   * - Toast notifications for errors
   * - Loading state management
   * - Success and error callbacks
   *
   * Error handling flow:
   * 1. Catch any errors from the API request
   * 2. Set the error state
   * 3. Display a toast notification (if enabled)
   * 4. Call the onError callback (if provided)
   * 5. Return a standardized error response
   * 6. Set loading state to false
   *
   * This approach allows components to handle API requests without worrying about
   * error handling, as all errors are handled globally by this function.
   */
  const execute = useCallback(async <T>(
    fn: (signal: AbortSignal) => Promise<ApiResponse<T>>,
    onSuccess?: (data: T) => void,
    onError?: (err: any) => void,
    showErrorToast = true,
  ): Promise<ApiResponse<T>> => {
    abortCtrlRef.current?.abort();
    const controller = new AbortController();
    abortCtrlRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fn(controller.signal);

      if (!mountedRef.current) {
        // Instead of throwing an error, just return the response
        // without updating state
        return response;
      }

      // Handle successful response
      setData(response.data);

      if (response.data && onSuccess) {
        onSuccess(response.data);
      }
      return response;
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        // Silently handle cancellation errors
        return {
          statusCode: 499, // Client Closed Request
          message: 'Request was cancelled',
          data: null,
        } as ApiResponse<T>;
      }

      if (mountedRef.current) {
        setError(err);

        // Show toast notification for errors if enabled
        if (showErrorToast) {
          console.error('API Error handled globally:', err);

          // Display error message from API response or fallback to generic message
          const errorMessage = err.message || 'An unexpected error occurred';
          toast.error(errorMessage);
        }

        // Call the onError callback if provided
        onError?.(err);
      }

      // Return a standardized error response instead of throwing
      // This allows components to continue execution without try/catch blocks
      return {
        statusCode: err.statusCode || 500,
        message: err.message || 'An unexpected error occurred',
        data: null,
        errorDetails: err.errorDetails || {
          error: 'Unknown error',
          statusCode: err.statusCode || 500,
          timestamp: new Date().toISOString(),
          path: '',
        },
      } as ApiResponse<T>;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Factory function to create HTTP method implementations
   *
   * @param method - The HTTP method to create (get, post, put, patch, delete)
   * @returns A function that executes the specified HTTP method
   */
  const createHttpMethod = useCallback(<T, TZod = any>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  ) => {
    return (params: HttpMethodParams<T, TZod> & { data?: unknown }) => {
      const {
        url,
        data: body,
        options = {},
        schemaValidation,
        onSuccess,
        onError,
        showErrorToast = true,
      } = params;

      return execute<T>(
        (signal) => {
          const requestParams = {
            url,
            options: { ...options, signal },
            schemaValidation: schemaValidation as ZodType<TZod>,
          };

          // Add data parameter for methods that support it
          if (method !== 'get' && method !== 'delete') {
            return http[method]<T, TZod>({ ...requestParams, data: body });
          }

          return http[method]<T, TZod>(requestParams);
        },
        onSuccess,
        onError,
        showErrorToast,
      );
    };
  }, [execute]);

  // Create HTTP method implementations using the factory function
  const get = useCallback(<T, TZod = any>(params: HttpMethodParams<T, TZod>) =>
    createHttpMethod<T, TZod>('get')(params), [createHttpMethod]);

  const post = useCallback(<T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) =>
    createHttpMethod<T, TZod>('post')(params), [createHttpMethod]);

  const put = useCallback(<T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) =>
    createHttpMethod<T, TZod>('put')(params), [createHttpMethod]);

  const patch = useCallback(<T, TZod = any>(params: HttpMethodWithDataParams<T, TZod>) =>
    createHttpMethod<T, TZod>('patch')(params), [createHttpMethod]);

  const del = useCallback(<T, TZod = any>(params: HttpMethodParams<T, TZod>) =>
    createHttpMethod<T, TZod>('delete')(params), [createHttpMethod]);

  return {
    loading,
    error,
    data,
    resetError,
    get,
    post,
    put,
    patch,
    delete: del,
  } as UseHttpResult;
}
