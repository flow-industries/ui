import type * as React from "react";
import { useEffect, useState } from "react";

import { cn } from "../../utils/cn";

type Overall = "operational" | "degraded" | "down" | "unknown";

interface ProbeResult {
  success: boolean;
}
interface Endpoint {
  results?: ProbeResult[];
}

const META = {
  operational: { label: "All systems operational", dot: "bg-success" },
  degraded: { label: "Degraded performance", dot: "bg-orange" },
  down: { label: "Partial outage", dot: "bg-destructive" },
  unknown: { label: "Status unavailable", dot: "bg-muted-foreground" },
} satisfies Record<Overall, { label: string; dot: string }>;

const RECENT = 10;

// Mirrors the status page's worst-of derivation, kept self-contained so the widget has no app deps.
function deriveOverall(endpoints: Endpoint[]): Overall {
  const results = endpoints
    .map((e) => e.results)
    .filter((r) => r !== undefined)
    .filter((r) => r.length > 0);
  if (results.length === 0) return "unknown";
  if (results.some((r) => !r[r.length - 1].success)) return "down";
  if (results.some((r) => r.slice(-RECENT).some((x) => !x.success))) {
    return "degraded";
  }
  return "operational";
}

/**
 * Live fleet-status pill: a colored dot + label ("All systems operational" / "Partial outage" / …)
 * that links to the status page. Reads the public Gatus statuses API; on any error it stays "unknown"
 * rather than breaking the footer it sits in.
 *
 * @param statusUrl Where the pill links to (the public status page).
 * @param apiUrl    Origin to fetch `/api/v1/endpoints/statuses` from; defaults to `statusUrl`. Pass
 *                  "" on the status page itself to use its same-origin proxy.
 */
export function StatusWidget({
  statusUrl = "https://status.flow.industries",
  apiUrl,
  className,
  ...props
}: Omit<React.ComponentProps<"a">, "href"> & {
  statusUrl?: string;
  apiUrl?: string;
}) {
  const [overall, setOverall] = useState<Overall>("unknown");
  const base = apiUrl ?? statusUrl;

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`${base}/api/v1/endpoints/statuses?page=1&pageSize=20`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Endpoint[]) => {
        if (Array.isArray(data)) setOverall(deriveOverall(data));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [base]);

  const meta = META[overall];

  return (
    <a
      data-slot="status-widget"
      href={statusUrl}
      className={cn(
        "-m-0.5 inline-flex items-center gap-2 rounded-sm border-[length:var(--border-width)] border-transparent text-muted-foreground text-xs outline-none [transition:color_80ms_ease] hover:text-foreground focus-visible:border-focus pointer-coarse:min-h-11",
        className,
      )}
      {...props}
    >
      <span
        className="relative flex size-2 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
            meta.dot,
          )}
        />
        <span
          className={cn("relative inline-flex size-2 rounded-full", meta.dot)}
        />
      </span>
      {meta.label}
    </a>
  );
}
