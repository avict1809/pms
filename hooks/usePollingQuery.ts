import { useEffect, useRef, useState } from "react";

/**
 * usePollingQuery - Polls a fetcher function at a given interval for real-time-like updates.
 * @param fetcher - async function that returns data
 * @param deps - dependency array (like useEffect)
 * @param intervalMs - polling interval in ms (default: 5000)
 */
export function usePollingQuery<T>(
  fetcher: () => Promise<T>,
  deps: any[] = [],
  intervalMs: number = 5000
): { data: T | null; loading: boolean; error: any } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    async function poll() {
      try {
        const result = await fetcher();
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, intervalMs);

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
