/**
 * ADB service for device discovery and connection
 */

import { setTimeout as sleep } from "node:timers/promises";
import { executeCommand } from "../utils/command.ts";
import { parseIpPort } from "../validation/ip-validator.ts";

interface MdnsTarget {
  address: string;
  name: string;
  instanceCount: number;
  lineIndex: number;
}

/**
 * Parse mDNS services output to extract ADB target addresses with metadata
 * @param text - Raw output from `adb mdns services`
 * @returns Array of unique IP:port addresses, sorted by recency/priority
 */
function parseMdnsServices(text: string) {
  const targets: MdnsTarget[] = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line || !line.includes("_adb-tls-connect._tcp")) continue;

    // Parse line format: "name (count) _adb-tls-connect._tcp ip:port"
    const tokens = line.split(/\s+/);
    let name = "";
    let instanceCount = 0;
    let address = "";

    for (const token of tokens) {
      // Check for instance count like "(2)"
      const countMatch = token.match(/\((\d+)\)/);
      if (countMatch) {
        instanceCount = Number(countMatch[1]);
      }

      // Check for IP:port
      const parsed = parseIpPort(token);
      if (parsed) {
        address = parsed;
      }

      // First token is usually the service name
      if (!name && !token.includes("_adb") && !token.includes(":")) {
        name = token;
      }
    }

    if (address) {
      targets.push({
        address,
        name,
        instanceCount,
        lineIndex: i,
      });
    }
  }

  // Remove duplicates, keeping the one with highest instance count (most recent)
  const uniqueTargets = new Map<string, MdnsTarget>();
  for (const target of targets) {
    const existing = uniqueTargets.get(target.address);
    if (!existing || target.instanceCount > existing.instanceCount) {
      uniqueTargets.set(target.address, target);
    }
  }

  // Sort by instance count (descending) then by line order
  // Higher instance count likely means more recent registration
  return Array.from(uniqueTargets.values())
    .sort((a, b) => {
      if (b.instanceCount !== a.instanceCount) {
        return b.instanceCount - a.instanceCount;
      }
      return a.lineIndex - b.lineIndex;
    })
    .map((t) => t.address);
}

/**
 * Discover wireless ADB targets with timeout
 * @param timeoutMs - Maximum time to wait for discovery in milliseconds
 * @returns Promise resolving to array of discovered target addresses
 */
export async function discoverTargets(timeoutMs: number) {
  const start = Date.now();
  let lastOut = "";

  while (Date.now() - start < timeoutMs) {
    const { out } = await executeCommand(["adb", "mdns", "services"]);
    lastOut = out;

    const targets = parseMdnsServices(out);
    if (targets.length) return targets;

    await sleep(1000);
  }

  return parseMdnsServices(lastOut);
}

/**
 * Connect to a wireless ADB target
 * @param target - IP:port address of the target
 * @returns Promise resolving to connection result
 */
export async function connectToTarget(target: string) {
  const { out, err, code } = await executeCommand(["adb", "connect", target]);

  return {
    success: code === 0,
    message: (err || out || "").trim(),
    target,
  };
}

/**
 * Get list of connected ADB devices
 * @returns Promise resolving to formatted device list output
 */
export async function getConnectedDevices() {
  const { out } = await executeCommand(["adb", "devices"]);
  return out.trim();
}
