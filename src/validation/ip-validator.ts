/**
 * IP address and port validation using Zod schemas
 */

import { z } from "zod";

const ipv4Schema = z.ipv4();

const portSchema = z
  .string()
  .transform((s) => Number(s))
  .refine((n) => Number.isInteger(n) && n >= 1 && n <= 65535, "Invalid port");

const ipv4PortSchema = z.object({ ip: ipv4Schema, port: portSchema }).transform(({ ip, port }) => `${ip}:${port}`);

/**
 * Parse and validate an IP:port string
 * @param candidate - String potentially containing IP:port
 * @returns Validated IP:port string or null if invalid
 */
export function parseIpPort(candidate: string) {
  const last = candidate.lastIndexOf(":");
  if (last === -1) return null;

  const ip = candidate.slice(0, last);
  const port = candidate.slice(last + 1);

  const res = ipv4PortSchema.safeParse({ ip, port });
  return res.success ? res.data : null;
}
