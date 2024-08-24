const debugLogEnabled = Boolean(process.env.DEBUG);

export function getLocalTime(timeZone: string): string {
  return new Date()
    .toLocaleTimeString("en-US", { timeZone })
    .replace(/^(\d+:\d+):\d+ ([A-z]+)/, "$1$2")
    .toLowerCase();
}

export function debugLog(message: string): void {
  if (debugLogEnabled) {
    console.log(message);
  }
}

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
