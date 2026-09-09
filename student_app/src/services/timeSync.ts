let clockOffsetMs = 0;

/**
 * Updates the estimated offset between local device time and server time.
 * offset = serverTime - localTime
 */
export function setServerTime(serverTimestampMs: number): void {
    clockOffsetMs = serverTimestampMs - Date.now();
}

/**
 * Returns a timestamp synchronized with the backend clock.
 */
export function getSyncedTimestamp(): number {
    return Date.now() + clockOffsetMs;
}
