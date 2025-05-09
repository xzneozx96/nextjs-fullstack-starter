import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { BooleanOptional, IStringifyOptions } from 'qs-esm';
import type { Params } from '../types/http.type';
import { Env } from '@/core/config/Env';
import axios from 'axios';
import Cookies from 'js-cookie';
import { stringify } from 'qs-esm';
import { SESSION_EXPIRED_COOKIE_KEY, SESSION_EXPIRED_EVENT_NAME, X_TENANT_ID } from '../constants/global';
import { HttpMethod } from '../enums/http.enum';

const isBrowser = typeof window !== 'undefined';

class HttpService {
  private static instance: HttpService;
  public http: AxiosInstance;
  private baseURL = `${Env.NEXT_PUBLIC_API_SERVER}/api`;

  private constructor() {
    this.http = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
    });

    this.injectInterceptors();
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  private get authorizationHeader() {
    const token = Cookies.get('AccessToken') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private injectInterceptors() {
    this.http.interceptors.request.use((config) => {
      if (config.headers) {
        // config.headers.set('Authorization', this.authorizationHeader.Authorization || '')
        config.headers.set('x-tenant-id', X_TENANT_ID);
      } else {
        config.headers = new axios.AxiosHeaders({
          // Authorization: this.authorizationHeader.Authorization || '',
          'x-tenant-id': X_TENANT_ID,
        });
      }
      return config;
    });

    this.http.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Check for session invalidation in error responses
        if (error.response?.data) {
          this.checkSessionInvalidation(error.response.data);
        }

        return Promise.reject(error);
      },
    );
  }

  // Helper method to check for session invalidation in error data
  private checkSessionInvalidation(errorData: any): void {
    // Check for sessionInvalid flag in the error data
    const sessionInvalid = errorData?.errors?.[0]?.data?.sessionInvalid;

    if (sessionInvalid) {
      console.log('Session invalidation detected in response');

      if (isBrowser) {
        // Browser-only code
        Cookies.set(SESSION_EXPIRED_COOKIE_KEY, 'true', { path: '/' });
        const sessionExpiredEvent = new CustomEvent(SESSION_EXPIRED_EVENT_NAME);
        window.dispatchEvent(sessionExpiredEvent);
      } else {
        // Server-only code
        console.log('Session invalidation detected on server side');
        // You might want to throw a specific error or handle differently
      }
    }
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    options: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.http.request<T>({
        method,
        url,
        ...options,
      });
      return response.data;
    } catch (error) {
      throw this.normalizeAxiosError(error);
    }
  }

  public async get<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(HttpMethod.GET, url, { ...options });
  }

  public async post<T>(url: string, data?: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(HttpMethod.POST, url, { ...options, data });
  }

  public async put<T>(url: string, data?: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(HttpMethod.PUT, url, { ...options, data });
  }

  public async patch<T>(url: string, data?: unknown, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(HttpMethod.PATCH, url, { ...options, data });
  }

  public async delete<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, url, { ...options });
  }

  // Fetch API methods
  public async getWithFetch<T>(
    url: string,
    params?: Params,
    options?: RequestInit,
    stringifyOptions?: IStringifyOptions<BooleanOptional>,
  ): Promise<T> {
    const fetchOptions: RequestInit = {
      method: 'GET',
      headers: new Headers({
        'Content-Type': 'application/json',
        ...options?.headers,
      }),
      credentials: 'include', // Always include credentials
      ...options,
    };

    const stringifiedQuery = stringify({ ...params }, { addQueryPrefix: true, ...stringifyOptions });

    try {
      const response = await fetch(`${this.baseURL}${url}${stringifiedQuery}`, fetchOptions);

      if (!response.ok) {
        // Only check for session invalidation in error responses
        const errorData = await response.json();
        this.checkSessionInvalidation(errorData);
        throw this.normalizeFetchError(response, errorData);
      }

      return await response.json();
    } catch (error) {
      throw await this.normalizeFetchError(error);
    }
  }

  public async getWithMethodOverride<T>(
    url: string,
    params?: Params,
    options?: RequestInit,
  ): Promise<T> {
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-HTTP-Method-Override': 'GET',
        ...options?.headers,
      }),
      credentials: 'include',
      body: stringify(params || {}),
      ...options,
    };
    try {
      const response = await fetch(`${this.baseURL}${url}`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json();
        this.checkSessionInvalidation(errorData);
        throw this.normalizeFetchError(response, errorData);
      }

      return await response.json();
    } catch (error) {
      throw await this.normalizeFetchError(error);
    }
  }

  private normalizeAxiosError(error: any) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data ?? {};

      // Check for session invalidation in the normalized error
      this.checkSessionInvalidation(responseData);

      return {
        message:
          responseData?.errors?.[0]?.message || responseData?.message || error.message || 'MES-193',
        status: error.response?.status || 500,
        rawError: error,
      };
    }

    return { message: 'MES-193', status: 500, rawError: error };
  }

  private async normalizeFetchError(error: any, preloadedData?: any) {
    if (error instanceof Response) {
      try {
        const data = preloadedData || (await error.json());

        // If we're normalizing an error that wasn't already checked for session invalidation
        if (!preloadedData) {
          this.checkSessionInvalidation(data);
        }

        return {
          message: data?.errors?.[0]?.message || data?.message || error.statusText || 'MES-193',
          status: error.status || 500,
          rawError: data,
        };
      } catch {
        return {
          message: error.statusText || 'MES-193',
          status: error.status || 500,
          rawError: error,
        };
      }
    }

    return {
      message: error.message || 'MES-193',
      status: 500,
      rawError: error,
    };
  }
}

export const httpService = HttpService.getInstance();
export { HttpService };
