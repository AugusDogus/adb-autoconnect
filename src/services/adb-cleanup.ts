/**
 * ADB connection cleanup and management
 */

import { executeCommand } from "../utils/command.ts";
import { logInfo } from "../utils/logger.ts";

interface DeviceStatus {
  address: string;
  status: "device" | "offline" | "unauthorized" | "unknown";
}

/**
 * Parse ADB devices output
 */
function parseDevices(output: string): DeviceStatus[] {
  const devices: DeviceStatus[] = [];
  const lines = output.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("List of")) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const address = parts[0];
      const status = parts[1] as DeviceStatus["status"];

      // Only track wireless connections (IP:port format)
      if (address?.includes(":")) {
        devices.push({ address, status });
      }
    }
  }

  return devices;
}

/**
 * Get currently connected ADB devices with their status
 */
export async function getDeviceStatuses() {
  const { out } = await executeCommand(["adb", "devices"]);
  return parseDevices(out);
}

/**
 * Disconnect from a specific ADB device
 */
export async function disconnectDevice(address: string) {
  const { code } = await executeCommand(["adb", "disconnect", address]);
  return code === 0;
}

/**
 * Clean up stale connections (offline, unauthorized)
 * @returns Array of addresses that were disconnected
 */
export async function cleanupStaleConnections() {
  const devices = await getDeviceStatuses();
  const staleDevices = devices.filter((d) => d.status === "offline" || d.status === "unauthorized");

  const disconnected: string[] = [];
  for (const device of staleDevices) {
    logInfo(`🧹 Disconnecting stale device: ${device.address} (${device.status})`);
    const success = await disconnectDevice(device.address);
    if (success) {
      disconnected.push(device.address);
    }
  }

  return disconnected;
}

/**
 * Check if a target is already connected and healthy
 */
export async function isAlreadyConnected(target: string) {
  const devices = await getDeviceStatuses();
  const existing = devices.find((d) => d.address === target);
  return existing?.status === "device";
}

/**
 * Verify that a connection is actually working
 * @param target - The target address to verify
 * @returns true if the device is connected and responsive
 */
export async function verifyConnection(target: string) {
  const devices = await getDeviceStatuses();
  const device = devices.find((d) => d.address === target);
  return device?.status === "device";
}
