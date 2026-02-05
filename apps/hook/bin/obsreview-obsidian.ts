#!/usr/bin/env bun
/**
 * Obsidian Note Reviewer - CLI Entry Point
 *
 * CLI command: obsreview-obsidian
 * Purpose: Entry point for Obsidian hook integration
 *
 * This script:
 * - Imports handleObsidianHook from ../server/obsidianHook.ts
 * - Executes the hook handler with stdin input
 * - Handles graceful shutdown on SIGTERM (cleanup, close server)
 * - Logs startup to stderr for debugging
 */

// Import the hook handler
// Note: This imports the main module which reads from stdin and runs the server
import "../server/obsidianHook.js";

// Log startup for debugging
console.error("[ObsidianHook] Starting obsreview-obsidian command...");

// Handle graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.error("[ObsidianHook] Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", () => {
  console.error("[ObsidianHook] Received SIGINT, shutting down gracefully...");
  process.exit(0);
});
