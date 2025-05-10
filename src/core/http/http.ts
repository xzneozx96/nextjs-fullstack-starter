import type { ApiResponse } from '@/shared/types/api-response';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ZodType } from 'zod';
import { Env } from '@/core/config/Env';
import { parseZodError } from '@/shared/utils/utils';
import axios, { AxiosHeaders } from 'axios';
import { X_TENANT_ID } from '../../shared/constants/global';
import { HttpMethod } from './http.enum';

const baseURL = Env.NEXT_PUBLIC_API_SERVER;

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const headers = new AxiosHeaders(config.headers || {});
  headers.set('x-tenant-id', X_TENANT_ID);
  config.headers = headers;
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  error => Promise.reject(error),
);

const normalizeAxiosError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data ?? {};

    // Check if the response follows our API error format
    if (responseData.statusCode && responseData.message) {
      return responseData as ApiResponse<null>;
    }

    // Fallback for other error formats
    const detail
      = responseData?.errors?.[0]?.message
        ?? responseData?.error
        ?? responseData?.message
        ?? error.message;

    // Create a standardized error response
    return {
      statusCode: error.response?.status || 500,
      message: detail || 'An unexpected error occurred',
      data: null,
      errorDetails: {
        error: responseData?.error || 'Unknown error',
        statusCode: error.response?.status || 500,
        timestamp: new Date().toISOString(),
        path: error.config?.url || '',
      },
    } as ApiResponse<null>;
  }

  // For non-Axios errors
  return {
    statusCode: 500,
    message: error.message || 'An unexpected error occurred',
    data: null,
    errorDetails: {
      error: 'Unknown error',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: '',
    },
  } as ApiResponse<null>;
};

async function request<T, TZod>(
  params: {
    method: HttpMethod;
    url: string;
    options?: AxiosRequestConfig & { data?: unknown };
    schemaValidation?: ZodType<TZod>;
  },
): Promise<ApiResponse<T>> {
  const { method, url, options = {}, schemaValidation } = params;

  if (schemaValidation && options.data !== undefined) {
    const result = schemaValidation.safeParse(options.data);
    if (!result.success) {
      // Create a standardized validation error response
      const errorResponse: ApiResponse<null> = {
        statusCode: 400,
        message: 'Validation error',
        data: null,
        errorDetails: {
          error: parseZodError(result.error),
          statusCode: 400,
          timestamp: new Date().toISOString(),
          path: url,
        },
      };
      throw errorResponse;
    }
  }

  try {
    const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.request<ApiResponse<T>>({
      method,
      url,
      ...options,
    });

    // Return the standardized response
    return response.data;
  } catch (err) {
    // Normalize and throw the error in our standard format
    throw normalizeAxiosError(err);
  }
}

export const http = {
  get: <T, TZod = any>(
    params: { url: string; options?: AxiosRequestConfig; schemaValidation?: ZodType<TZod> },
  ): Promise<ApiResponse<T>> => request<T, TZod>(
    { method: HttpMethod.GET, url: params.url, options: params.options, schemaValidation: params.schemaValidation },
  ),

  post: <T, TZod = any>(
    params: { url: string; data?: unknown; options?: AxiosRequestConfig; schemaValidation?: ZodType<TZod> },
  ): Promise<ApiResponse<T>> => request<T, TZod>({ method: HttpMethod.POST, url: params.url, options: { ...params.options, data: params.data }, schemaValidation: params.schemaValidation }),

  put: <T, TZod = any>(
    params: { url: string; data?: unknown; options?: AxiosRequestConfig; schemaValidation?: ZodType<TZod> },
  ): Promise<ApiResponse<T>> => request<T, TZod>({ method: HttpMethod.PUT, url: params.url, options: { ...params.options, data: params.data }, schemaValidation: params.schemaValidation }),

  patch: <T, TZod = any>(
    params: { url: string; data?: unknown; options?: AxiosRequestConfig; schemaValidation?: ZodType<TZod> },
  ): Promise<ApiResponse<T>> => request<T, TZod>({ method: HttpMethod.PATCH, url: params.url, options: { ...params.options, data: params.data }, schemaValidation: params.schemaValidation }),

  delete: <T, TZod = any>(
    params: { url: string; options?: AxiosRequestConfig; schemaValidation?: ZodType<TZod> },
  ): Promise<ApiResponse<T>> => request<T, TZod>({ method: HttpMethod.DELETE, url: params.url, options: params.options, schemaValidation: params.schemaValidation }),
};

export const httpService = { ...http };
