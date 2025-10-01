/**
 * CLI program definition and option parsing
 */

import { Command } from "commander";

/**
 * Create and configure the CLI program
 * @returns Configured Command instance
 */
export function createProgram() {
  const program = new Command();

  program
    .name("adb-autoconnect")
    .description("Automatically discover and connect to wireless ADB devices")
    .option("-t, --timeout <ms>", "discovery timeout (ms)", "15000")
    .option("-l, --list", "only list discovered targets, don't connect")
    .option("-a, --all", "connect to all discovered targets")
    .option("-i, --info", "show discovery and connection progress")
    .option("-v, --verbose", "show all available information")
    .option("-s, --silent", "suppress all output");

  return program;
}

/**
 * Parse CLI options and extract timeout value
 * @param options - Raw CLI options
 * @returns Parsed options with timeout as number
 */
export function parseOptions(options: {
  timeout: string;
  list?: boolean;
  all?: boolean;
  info?: boolean;
  verbose?: boolean;
  silent?: boolean;
}) {
  // Determine log level based on flags (priority: silent > verbose > info > default)
  let logLevel: "silent" | "default" | "info" | "verbose" = "default";
  if (options.silent) logLevel = "silent";
  else if (options.verbose) logLevel = "verbose";
  else if (options.info) logLevel = "info";

  return {
    timeoutMs: Number(options.timeout ?? 15000),
    list: options.list ?? false,
    all: options.all ?? false,
    logLevel,
  };
}
