import { kv } from "@vercel/kv";
import { debugLog } from "./utils";

/* vim: nomodeline */

export const DEFAULT_TTL = 300;

export async function decr(key: string): Promise<number> {
  debugLog(`KV DECR: ${key}`);
  return await kv.decr(key);
}

export async function get<T>(key: string): Promise<T | null> {
  debugLog(`KV GET: ${key}`);
  return await kv.get<T>(key);
}

export async function set<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  debugLog(`KV SET: ${key} ${ttl}`);
  await kv.set<T>(key, value, { ex: ttl });
}
