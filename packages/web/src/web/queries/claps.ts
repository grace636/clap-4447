import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client, orpc } from "../lib/api";

/**
 * Shared global clap counter.
 * - Polls the server every 1.5s so everyone sees others' claps live.
 * - Local taps are batched (~250ms) and sent as one atomic increment.
 */
export function useClaps() {
  const poll = useQuery({ ...orpc.claps.get.queryOptions(), refetchInterval: 1500 });
  const [server, setServer] = useState<number | null>(null);
  const [pending, setPending] = useState(0); // unsent + in-flight
  const unsent = useRef(0);
  const inflight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (poll.data && !inflight.current) setServer((s) => Math.max(s ?? 0, poll.data.count));
  }, [poll.data]);

  const flush = useCallback(async () => {
    timer.current = null;
    if (inflight.current || unsent.current === 0) return;
    const n = Math.min(unsent.current, 50);
    unsent.current -= n;
    inflight.current = true;
    try {
      const res = await client.claps.add({ n });
      setServer((s) => Math.max(s ?? 0, res.count));
      setPending((p) => p - n);
    } catch {
      unsent.current += n; // retry later
    } finally {
      inflight.current = false;
      if (unsent.current > 0) timer.current = setTimeout(flush, 250);
    }
  }, []);

  const clap = useCallback(() => {
    unsent.current += 1;
    setPending((p) => p + 1);
    if (!timer.current) timer.current = setTimeout(flush, 250);
  }, [flush]);

  return { count: server === null ? null : server + pending, clap };
}
