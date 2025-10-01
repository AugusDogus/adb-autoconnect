/**
 * User-facing messages and output formatting
 */

import { logDefault, logError, logInfo, logVerbose } from "../utils/logger.ts";

/**
 * Display discovery start message
 * @param timeoutMs - Discovery timeout in milliseconds
 */
export function displayDiscoveryStart(timeoutMs: number) {
  logInfo(`🔎 Discovering wireless ADB targets (timeout ${timeoutMs} ms)…`);
}

/**
 * Display found targets
 * @param targets - Array of discovered target addresses
 */
export function displayFoundTargets(targets: string[]) {
  logInfo(`Found ${targets.length} target(s):`);
  for (const t of targets) {
    logInfo(`  • ${t}`);
  }
}

/**
 * Display connection attempt message
 * @param target - Target address being connected to
 */
export function displayConnectingTo(target: string) {
  logInfo(`🔗 Connecting to ${target}…`);
}

/**
 * Display successful connection
 * @param target - Target address that was connected to
 */
export function displayConnected(target: string) {
  logDefault(`connected to ${target}`);
}

/**
 * Display connection failure
 * @param target - Target address that failed to connect
 * @param message - Error message
 */
export function displayConnectionFailed(target: string, message: string) {
  logError(message || `Failed to connect to ${target}`);
}

/**
 * Display connected devices list
 * @param devices - Formatted device list from ADB
 */
export function displayConnectedDevices(devices: string) {
  logVerbose(`\n📱 ADB devices:\n${devices}`);
}

/**
 * Display error when no targets are found
 */
export function displayNoTargetsError() {
  logError(
    "No wireless ADB services found.\n" +
      "• Ensure Wireless debugging is ON (Developer options → Wireless debugging)\n" +
      "• Phone and computer must be on the same network\n" +
      "• First-time pairing (Android 11+): `adb pair <ip>:<pairing-port> <code>`"
  );
}
