/**
 * HTTP Hook for making API requests with standardized response handling
 *
 * This module provides a React hook for making HTTP requests with standardized
 * response and error handling. It supports:
 *
 * - Standardized API response format with statusCode, message, and data
 * - Automatic loading state management
 * - Toast notifications for errors
 * - Request cancellation
 * - Component unmounting safety
 * - Success and error callbacks
 * - Type-safe responses with TypeScript generics
 *
 * The core of this hook is the `execute()` function, which handles all the
 * request processing, response handling, and error management. See the
 * detailed documentation in the function itself.
 *
 * @see docs/http-utilities.md for detailed documentation
 */

import type { ApiResponse } from '@/shared/types/api-response';
import type { AxiosRequestConfig } from 'axios';
import type { ZodType } from 'zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { http } from './http';

type UseHttpResult = {
  loading: boolean;
  error: any;
  data: any;
  resetError: () => void;
  get: <T, TZod = any>(params: {
    url: string;
    options?: AxiosRequestConfig;
    schemaValidation?: ZodType<TZod>;
    onSuccess?: (data: T) => void;
    onError?: (err: any) => void;
    showErrorToast?: boolean;
  }) => Promise<ApiResponse<T>>;
  post: <T, TZod = any>(params: {
    url: string;
    data?: unknown;
    options?: AxiosRequestConfig;
    schemaValidation?: ZodType<TZod>;
    onSuccess?: (data: T) => void;
    onError?: (err: any) => void;
    showErrorToast?: boolean;
  }) => Promise<ApiResponse<T>>;
  put: <T, TZod = any>(params: {
    url: string;
    data?: unknown;
    options?: AxiosRequestConfig;
    schemaValidation?: ZodType<TZod>;
    onSuccess?: (data: T) => void;
    onError?: (err: any) => void;
    showErrorToast?: boolean;
  }) => Promise<ApiResponse<T>>;
  patch: <T, TZod = any>(params: {
    url: string;
    data?: unknown;
    options?: AxiosRequestConfig;
    schemaValidation?: ZodType<TZod>;
    onSuccess?: (data: T) => void;
    onError?: (err: any) => void;
    showErrorToast?: boolean;
  }) => Promise<ApiResponse<T>>;
  delete: <T, TZod = any>(params: {
    url: string;
    options?: AxiosRequestConfig;
    schemaValidation?: ZodType<TZod>;
    onSuccess?: (data: T) => void;
    onError?: (err: any) => void;
    showErrorToast?: boolean;
  }) => Promise<ApiResponse<T>>;
};

export function useHttp(): UseHttpResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
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
   * Core function that executes HTTP requests with standardized error handling and response processing.
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
        onError?.(err);

        // Show toast notification for errors if enabled
        if (showErrorToast) {
          console.error('API Error handled in catch block:', err);

          // Display error message from API response or fallback to generic message
          const errorMessage = err.message || 'An unexpected error occurred';
          toast.error(errorMessage);
        }
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const get = useCallback(<T, TZod = any>({
    url,
    options = {},
    schemaValidation,
    onSuccess,
    onError,
    showErrorToast = true,
  }: Parameters<UseHttpResult['get']>[0]) => execute<T>(
    signal => http.get<T, TZod>({ url, options: { ...options, signal }, schemaValidation: schemaValidation as ZodType<TZod> }),
    onSuccess,
    onError,
    showErrorToast,
  ), [execute]);

  const post = useCallback(<T, TZod = any>({
    url,
    data: body,
    options = {},
    schemaValidation,
    onSuccess,
    onError,
    showErrorToast = true,
  }: Parameters<UseHttpResult['post']>[0]) => execute<T>(
    signal => http.post<T, TZod>({ url, data: body, options: { ...options, signal }, schemaValidation: schemaValidation as ZodType<TZod> }),
    onSuccess,
    onError,
    showErrorToast,
  ), [execute]);

  const put = useCallback(<T, TZod = any>({
    url,
    data: body,
    options = {},
    schemaValidation,
    onSuccess,
    onError,
    showErrorToast = true,
  }: Parameters<UseHttpResult['put']>[0]) => execute<T>(
    signal => http.put<T, TZod>({ url, data: body, options: { ...options, signal }, schemaValidation: schemaValidation as ZodType<TZod> }),
    onSuccess,
    onError,
    showErrorToast,
  ), [execute]);

  const patch = useCallback(<T, TZod = any>({
    url,
    data: body,
    options = {},
    schemaValidation,
    onSuccess,
    onError,
    showErrorToast = true,
  }: Parameters<UseHttpResult['patch']>[0]) => execute<T>(
    signal => http.patch<T, TZod>({ url, data: body, options: { ...options, signal }, schemaValidation: schemaValidation as ZodType<TZod> }),
    onSuccess,
    onError,
    showErrorToast,
  ), [execute]);

  const del = useCallback(<T, TZod = any>({
    url,
    options = {},
    schemaValidation,
    onSuccess,
    onError,
    showErrorToast = true,
  }: Parameters<UseHttpResult['delete']>[0]) => execute<T>(
    signal => http.delete<T, TZod>({ url, options: { ...options, signal }, schemaValidation: schemaValidation as ZodType<TZod> }),
    onSuccess,
    onError,
    showErrorToast,
  ), [execute]);

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
