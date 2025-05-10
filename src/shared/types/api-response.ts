/**
 * Standard API response format used throughout the application
 *
 * This type defines the standardized format for all API responses,
 * ensuring consistency in how we handle both success and error cases.
 *
 * @template T - The type of data expected in a successful response
 */
export type ApiResponse<T = any> = {
  statusCode: number;
  message: string;
  data: T | null;
  errorDetails?: {
    error: string;
    statusCode: number;
    timestamp: string;
    path: string;
  };
};

/**
 * Type guard to check if a response is an error
 *
 * This function determines if an API response represents an error based on:
 * 1. The statusCode being 400 or higher (client or server error)
 * 2. The data property being null
 *
 * @param response - The API response to check
 * @returns True if the response represents an error, false otherwise
 */
export function isApiError<T>(response: ApiResponse<T>): boolean {
  return response.statusCode >= 400 || response.data === null;
}

/**
 * Type guard to check if a response is successful with valid data
 *
 * This function determines if an API response represents a success based on:
 * 1. The statusCode being less than 400 (success or redirect)
 * 2. The data property not being null
 *
 * This is a TypeScript type guard that narrows the type to ensure
 * that the data property is not null when the function returns true.
 *
 * @param response - The API response to check
 * @returns True if the response is successful with valid data, false otherwise
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.statusCode < 400 && response.data !== null;
}
