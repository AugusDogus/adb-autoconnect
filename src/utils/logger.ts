/**
 * Simple logging utility with configurable log levels
 */

export type LogLevel = "silent" | "default" | "info" | "verbose";

let currentLogLevel: LogLevel = "default";

/**
 * Set the global log level
 */
export function setLogLevel(level: LogLevel) {
  currentLogLevel = level;
}

/**
 * Get the current log level
 */
export function getLogLevel() {
  return currentLogLevel;
}

/**
 * Log at default level - only essential output (connection results)
 */
export function logDefault(message: string) {
  if (currentLogLevel === "silent") return;
  console.log(message);
}

/**
 * Log at info level - more detailed progress information
 */
export function logInfo(message: string) {
  if (currentLogLevel === "silent" || currentLogLevel === "default") return;
  console.log(message);
}

/**
 * Log at verbose level - all available information
 */
export function logVerbose(message: string) {
  if (currentLogLevel !== "verbose") return;
  console.log(message);
}

/**
 * Log errors - always shown except in silent mode
 */
export function logError(message: string) {
  if (currentLogLevel === "silent") return;
  console.error(message);
}
