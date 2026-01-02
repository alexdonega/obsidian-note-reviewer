/**
 * Safe JSON parsing utilities
 *
 * Provides type-safe JSON parsing with proper error handling to prevent
 * application crashes from malformed data. All error messages are sanitized
 * to prevent information leakage.
 */

/**
 * Result type for safe operations
 * Either success with data or error with message
 */
export type JsonParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Validation function type for additional type checking
 */
export type JsonValidator<T> = (data: unknown) => data is T;

/**
 * Sanitize error messages to prevent information leakage
 * Removes specific parsing details that could reveal internal structure
 */
function sanitizeErrorMessage(error: unknown): string {
  // Don't expose internal error details to prevent information leakage
  if (error instanceof SyntaxError) {
    // Provide a generic message without revealing parsing position or content
    return 'Invalid JSON format';
  }
  if (error instanceof Error) {
    // For non-syntax errors, provide generic message
    return 'Failed to parse data';
  }
  return 'An unexpected error occurred';
}

/**
 * Safely parse JSON with proper error handling and optional validation
 *
 * @param json - The JSON string to parse
 * @param validator - Optional validation function to verify the parsed data structure
 * @returns A Result type with either success/data or error/message
 *
 * @example
 * // Basic usage
 * const result = safeJsonParse<{ name: string }>(jsonString);
 * if (result.success) {
 *   console.log(result.data.name);
 * } else {
 *   console.error(result.error);
 * }
 *
 * @example
 * // With validation
 * const isUser = (data: unknown): data is User =>
 *   typeof data === 'object' && data !== null && 'id' in data;
 * const result = safeJsonParse(jsonString, isUser);
 */
export function safeJsonParse<T>(
  json: string,
  validator?: JsonValidator<T>
): JsonParseResult<T> {
  // Handle null/undefined/empty strings
  if (json === null || json === undefined || json === '') {
    return {
      success: false,
      error: 'Invalid input: empty or null value',
    };
  }

  // Ensure input is a string
  if (typeof json !== 'string') {
    return {
      success: false,
      error: 'Invalid input: expected string',
    };
  }

  try {
    const parsed = JSON.parse(json) as unknown;

    // If a validator is provided, use it to verify the structure
    if (validator) {
      if (!validator(parsed)) {
        return {
          success: false,
          error: 'Validation failed: data structure mismatch',
        };
      }
      return { success: true, data: parsed };
    }

    // Without validator, return the parsed data with type assertion
    return { success: true, data: parsed as T };
  } catch (error) {
    return {
      success: false,
      error: sanitizeErrorMessage(error),
    };
  }
}

/**
 * Parse JSON and return the data or null on failure
 * Useful for simple cases where you just want the data or null
 *
 * @param json - The JSON string to parse
 * @param validator - Optional validation function
 * @returns The parsed data or null on failure
 *
 * @example
 * const data = safeJsonParseOrNull<Config>(configString);
 * if (data) {
 *   // use data
 * }
 */
export function safeJsonParseOrNull<T>(
  json: string,
  validator?: JsonValidator<T>
): T | null {
  const result = safeJsonParse<T>(json, validator);
  return result.success ? result.data : null;
}

/**
 * Parse JSON and return the data or a default value on failure
 *
 * @param json - The JSON string to parse
 * @param defaultValue - The default value to return on failure
 * @param validator - Optional validation function
 * @returns The parsed data or the default value on failure
 *
 * @example
 * const settings = safeJsonParseOrDefault<Settings>(
 *   settingsString,
 *   { theme: 'light', fontSize: 14 }
 * );
 */
export function safeJsonParseOrDefault<T>(
  json: string,
  defaultValue: T,
  validator?: JsonValidator<T>
): T {
  const result = safeJsonParse<T>(json, validator);
  return result.success ? result.data : defaultValue;
}
