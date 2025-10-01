#!/usr/bin/env bun
/**
 * ADB Autoconnect - Main entry point
 *
 * Discovers wireless ADB targets via `adb mdns services` and connects to them.
 *
 * Usage examples:
 *   bun run index.ts
 *   bun run index.ts --timeout 20000
 *   bun run index.ts --list
 *   bun run index.ts --all --verbose
 */

import {
  displayConnected,
  displayConnectedDevices,
  displayConnectingTo,
  displayConnectionFailed,
  displayDiscoveryStart,
  displayFoundTargets,
  displayNoTargetsError,
} from "./cli/messages.ts";
import { createProgram, parseOptions } from "./cli/program.ts";
import { cleanupStaleConnections, isAlreadyConnected, verifyConnection } from "./services/adb-cleanup.ts";
import { connectToTarget, discoverTargets, getConnectedDevices } from "./services/adb-service.ts";
import { logInfo, setLogLevel } from "./utils/logger.ts";

/**
 * Main application logic
 */
async function main() {
  // Parse CLI arguments
  const program = createProgram();
  program.parse(process.argv);
  const opts = parseOptions(program.opts());

  // Set log level
  setLogLevel(opts.logLevel);

  // Clean up any stale connections first
  await cleanupStaleConnections();

  // Discover targets
  displayDiscoveryStart(opts.timeoutMs);
  const targets = await discoverTargets(opts.timeoutMs);

  // Handle no targets found
  if (!targets.length) {
    displayNoTargetsError();
    process.exit(1);
  }

  // Display found targets
  displayFoundTargets(targets);

  // Exit if list-only mode
  if (opts.list) {
    process.exit(0);
  }

  // Connect to targets
  if (opts.all) {
    // Connect to all targets
    for (const target of targets) {
      // Skip if already connected
      if (await isAlreadyConnected(target)) {
        logInfo(`✓ Already connected to ${target}`);
        continue;
      }

      displayConnectingTo(target);
      const result = await connectToTarget(target);

      if (result.success) {
        const verified = await verifyConnection(target);
        if (verified) {
          displayConnected(result.target);
        } else {
          displayConnectionFailed(result.target, "Connection reported success but device is not responsive");
        }
      } else {
        displayConnectionFailed(result.target, result.message);
      }
    }
  } else {
    // Try targets in order until one succeeds
    let connected = false;
    for (const target of targets) {
      // Skip if already connected
      if (await isAlreadyConnected(target)) {
        logInfo(`✓ Already connected to ${target}`);
        connected = true;
        break;
      }

      displayConnectingTo(target);
      const result = await connectToTarget(target);

      if (result.success) {
        const verified = await verifyConnection(target);
        if (verified) {
          displayConnected(result.target);
          connected = true;
          break;
        } else {
          logInfo(`Connection to ${target} succeeded but device is not responsive, trying next target...`);
        }
      } else {
        logInfo(`Failed to connect to ${target}, trying next target...`);
      }
    }

    if (!connected) {
      displayConnectionFailed("all targets", "Failed to connect to any discovered target");
      process.exit(1);
    }
  }

  // Display connected devices in verbose mode
  if (opts.logLevel === "verbose") {
    const devices = await getConnectedDevices();
    displayConnectedDevices(devices);
  }
}

// Execute main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
