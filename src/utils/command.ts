/**
 * Utility functions for executing system commands
 */

/**
 * Execute a command and return the result
 * @param cmd - Command and arguments to execute
 * @returns Promise resolving to command result with exit code, stdout, and stderr
 */
export async function executeCommand(cmd: string[]) {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
    env: { ADB_MDNS_OPENSCREEN: "1" },
  });

  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  const code = await proc.exited;

  return { code, out, err };
}
