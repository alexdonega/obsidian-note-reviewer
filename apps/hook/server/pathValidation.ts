/**
 * Path Validation Module
 *
 * Provides security utilities to detect and prevent path traversal attacks (CWE-22).
 * Used to validate file paths before any filesystem operations.
 */

import * as path from "path";

export interface PathValidationResult {
  valid: boolean;
  error?: string;
  normalizedPath?: string;
}

/**
 * Detects path traversal sequences in a path string.
 * Checks for various attack vectors including:
 * - Simple '..' sequences
 * - URL encoded sequences (%2e, %2f, etc.)
 * - Double-encoded sequences
 * - Windows backslash traversal
 * - Null byte injection
 * - Unicode normalization attacks
 *
 * @param inputPath - The path to check for traversal sequences
 * @returns true if path traversal is detected, false otherwise
 */
export function isPathTraversal(inputPath: string): boolean {
  if (!inputPath || typeof inputPath !== "string") {
    return false;
  }

  // Decode URL-encoded characters to catch encoded attacks
  let decodedPath = inputPath;

  // Handle multiple levels of URL encoding (double, triple encoding attacks)
  for (let i = 0; i < 3; i++) {
    try {
      const newDecoded = decodeURIComponent(decodedPath);
      if (newDecoded === decodedPath) break;
      decodedPath = newDecoded;
    } catch {
      // Invalid encoding, continue with current decoded state
      break;
    }
  }

  // Normalize path separators (convert Windows backslashes to forward slashes)
  const normalizedSeparators = decodedPath.replace(/\\/g, "/");

  // Check for null byte injection (used to bypass extension checks)
  if (inputPath.includes("\0") || inputPath.includes("%00")) {
    return true;
  }

  // Check for '..' in various forms (encoded patterns only - plain .. checked via regex below)
  const traversalPatterns = [
    /\.%2e/i,                  // Mixed encoded
    /%2e\./i,                  // Mixed encoded
    /%2e%2e/i,                 // Fully URL encoded
    /%252e/i,                  // Double encoded dot
    /\.%c0%ae/i,               // Unicode overlong encoding for .
    /%c0%ae\./i,               // Unicode overlong encoding for .
    /%c0%ae%c0%ae/i,           // Double Unicode overlong (2-byte)
    /\.%e0%80%ae/i,            // 3-byte Unicode overlong mixed
    /%e0%80%ae\./i,            // 3-byte Unicode overlong mixed
    /%e0%80%ae%e0%80%ae/i,     // Double 3-byte Unicode overlong
  ];

  // Test against original input for encoded patterns
  for (const pattern of traversalPatterns) {
    if (pattern.test(inputPath)) {
      return true;
    }
  }

  // Check decoded and normalized path for simple traversal
  // Multiple patterns to catch different traversal attempts:
  // 1. ".." as a complete path segment: start/separator + .. + separator/end
  // 2. ".." followed immediately by separator anywhere (like "../" or "....//")
  // Note: "..." and "...." as standalone filenames are valid, only block when followed by separator

  // Pattern 1: ".." as complete segment (handles "../" and "/.." and just "..")
  if (/(?:^|\/)\.\.(\/|$)/.test(normalizedSeparators)) {
    return true;
  }

  // Pattern 2: Two or more dots followed by "/" (catches "../", "..../", etc.)
  if (/\.\.+\//.test(normalizedSeparators)) {
    return true;
  }

  return false;
}

/**
 * Normalizes a path to its canonical form.
 * Resolves relative paths, removes redundant separators,
 * and handles both Unix and Windows path formats.
 *
 * @param inputPath - The path to normalize
 * @returns The normalized absolute path
 */
export function normalizePath(inputPath: string): string {
  if (!inputPath || typeof inputPath !== "string") {
    return "";
  }

  // First normalize path separators for consistent handling
  const normalizedInput = inputPath.replace(/\\/g, "/");

  // Use path.resolve to get absolute path and resolve any . or .. segments
  // path.normalize handles the actual normalization
  const resolved = path.resolve(path.normalize(normalizedInput));

  return resolved;
}

/**
 * Validates a file path for security.
 * Combines traversal detection and path normalization to ensure
 * the path is safe for filesystem operations.
 *
 * Optionally checks if the path stays within an allowed base directory.
 *
 * @param inputPath - The path to validate
 * @param baseDirectory - Optional base directory the path must stay within
 * @returns PathValidationResult with validation status and normalized path
 */
export function validatePath(
  inputPath: string,
  baseDirectory?: string
): PathValidationResult {
  // Check for empty or invalid input
  if (!inputPath || typeof inputPath !== "string") {
    return {
      valid: false,
      error: "Path is required"
    };
  }

  // Check for null bytes (security risk)
  if (inputPath.includes("\0") || inputPath.includes("%00")) {
    return {
      valid: false,
      error: "Invalid characters in path"
    };
  }

  // Check for path traversal attempts
  if (isPathTraversal(inputPath)) {
    return {
      valid: false,
      error: "Path traversal detected"
    };
  }

  // Normalize the path
  const normalizedPath = normalizePath(inputPath);

  // If no base directory specified, path is valid
  if (!baseDirectory) {
    return {
      valid: true,
      normalizedPath
    };
  }

  // Normalize the base directory for comparison
  const normalizedBase = normalizePath(baseDirectory);

  // Ensure the normalized path starts with the base directory
  // Add path separator to prevent partial matches (e.g., /foo vs /foobar)
  const baseWithSeparator = normalizedBase.endsWith(path.sep)
    ? normalizedBase
    : normalizedBase + path.sep;

  // Check if path is exactly the base directory or inside it
  if (normalizedPath !== normalizedBase && !normalizedPath.startsWith(baseWithSeparator)) {
    return {
      valid: false,
      error: "Path is outside allowed directory"
    };
  }

  return {
    valid: true,
    normalizedPath
  };
}

/**
 * Validates a path against multiple allowed base directories.
 * Useful when there are several valid locations for file operations.
 *
 * @param inputPath - The path to validate
 * @param allowedDirectories - Array of allowed base directories
 * @returns PathValidationResult with validation status and normalized path
 */
export function validatePathWithAllowedDirs(
  inputPath: string,
  allowedDirectories: string[]
): PathValidationResult {
  // Basic validation first
  const basicResult = validatePath(inputPath);
  if (!basicResult.valid) {
    return basicResult;
  }

  // If no allowed directories specified, accept all paths
  if (!allowedDirectories || allowedDirectories.length === 0) {
    return basicResult;
  }

  // Check against each allowed directory
  for (const allowedDir of allowedDirectories) {
    const result = validatePath(inputPath, allowedDir);
    if (result.valid) {
      return result;
    }
  }

  return {
    valid: false,
    error: "Path is not within any allowed directory"
  };
}
