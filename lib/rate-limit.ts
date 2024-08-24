import { decr, get, set } from "./kv";
import { debugLog } from "./utils";

/* vim: nomodeline */

export const ONE_HOUR_IN_SECONDS = 60 * 60;
export const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

/**
 * Rate limit a resource, returning the number of requests remaining in the
 * window.
 */
async function consumeRateLimitedResource(
  key: string,
  maxInWindow: number,
  windowInSeconds: number
): Promise<number> {
  const count = await get<number>(key);

  if (null === count) {
    await set<number>(key, maxInWindow - 1, windowInSeconds);
    return maxInWindow - 1;
  }

  return await decr(key);
}

type AnyFunction = (...args: any[]) => any;

interface RateLimitOptions<T extends AnyFunction> {
  cacheKeyPrefix: string;
  fn: T;
  defaultTTL: number;
  defaultValue: Awaited<ReturnType<T>>;
  maxInWindow: number;
  windowInSeconds: number;
}

interface RateLimitResponse<T> {
  status: WeatherReport["status"];
  value: T;
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly backOffInSeconds: number) {
    super(message);
  }
}

export function cacheAndRateLimit<T extends AnyFunction>(
  options: RateLimitOptions<T>
): (
  ...args: Parameters<T>
) => Promise<RateLimitResponse<Awaited<ReturnType<T>>>> {
  const {
    cacheKeyPrefix,
    fn,
    defaultTTL,
    defaultValue,
    maxInWindow,
    windowInSeconds,
  } = options;

  const backOffCacheKey = `${cacheKeyPrefix}_back_off`;
  const rateLimitCacheKey = `${cacheKeyPrefix}_rate_limit`;

  return async (
    ...args: Parameters<T>
  ): Promise<RateLimitResponse<Awaited<ReturnType<T>>>> => {
    const requestCacheKey = `${cacheKeyPrefix}_request_${args.join("_")}`;
    const isFreshCacheKey = `${requestCacheKey}_IS_FRESH`;

    const cachedValue = await get<ReturnType<T>>(requestCacheKey);
    const isFresh = await get<boolean>(isFreshCacheKey);

    if (cachedValue && isFresh) {
      debugLog("CACHE HIT: fresh");
      return {
        status: "cached",
        value: cachedValue,
      };
    }

    const backOffInSeconds = await get<number>(backOffCacheKey);

    if (backOffInSeconds) {
      debugLog(`BACKOFF: ${backOffInSeconds}`);
      return {
        status: "rate-limited",
        value: cachedValue || defaultValue,
      };
    }

    const remainingCount = await consumeRateLimitedResource(
      rateLimitCacheKey,
      maxInWindow,
      windowInSeconds
    );
    const ttl =
      remainingCount > 1 ? defaultTTL : Math.max(defaultTTL, windowInSeconds);

    try {
      const value = await fn(...args);

      await set(requestCacheKey, value, ONE_DAY_IN_SECONDS);
      await set(isFreshCacheKey, value, ttl);

      debugLog(`FETCHED: ${requestCacheKey}`);
      return {
        status: "fetched",
        value: value || defaultValue,
      };
    } catch (error) {
      let status: "error" | "rate-limited" = "error";
      if (error instanceof RateLimitError) {
        status = "rate-limited";
        await set(backOffCacheKey, null, error.backOffInSeconds);
      }

      debugLog(`ERROR: ${error?.toString()}`);
      return {
        status,
        value: cachedValue || defaultValue,
      };
    }
  };
}
