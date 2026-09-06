import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import { cn } from "../../utils/cn";
import { Logo } from "../logo";
import { Button } from "./button";
import { Subtitle, Title } from "./typography";

type ErrorFallbackProps = {
  error?: unknown;
  reset?: () => void;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  retryLabel?: string;
  showDetails?: boolean;
  autoFocus?: boolean;
  className?: string;
};

function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "This page hit an error. You can try again or head back home.",
  homeHref = "/",
  homeLabel = "Back to home",
  retryLabel = "Try again",
  showDetails = false,
  autoFocus = true,
  className,
}: ErrorFallbackProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (autoFocus) headingRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const details =
    showDetails && error !== undefined
      ? error instanceof Error
        ? (error.stack ?? error.message)
        : String(error)
      : null;

  return (
    <section
      role="alert"
      data-slot="error-fallback"
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 p-6 text-center text-balance",
        className,
      )}
    >
      <Logo size={40} />
      <div className="flex max-w-md flex-col items-center gap-2">
        <Title
          ref={headingRef}
          tabIndex={-1}
          size="md"
          className="outline-none"
        >
          {title}
        </Title>
        <Subtitle size="md">{description}</Subtitle>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          className="pointer-coarse:min-h-11"
          onClick={() => (reset ? reset() : window.location.reload())}
        >
          {retryLabel}
        </Button>
        <Button
          variant="secondary"
          className="pointer-coarse:min-h-11"
          nativeButton={false}
          render={<a href={homeHref} />}
        >
          {homeLabel}
        </Button>
      </div>
      {details && (
        <details className="w-full max-w-lg text-left">
          <summary className="cursor-pointer rounded-sm border-[length:var(--border-width)] border-transparent text-sm text-muted-foreground outline-none focus-visible:border-focus">
            Error details
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
            {details}
          </pre>
        </details>
      )}
    </section>
  );
}

type ErrorBoundaryFallback =
  | ReactNode
  | ((props: { error: unknown; reset: () => void }) => ReactNode);

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ErrorBoundaryFallback;
  // biome-ignore lint/plugin: React can catch any thrown JavaScript value.
  onError?: (error: unknown, info: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
};

type ErrorBoundaryState = { hasError: boolean; error: unknown };

function resetKeysChanged(previous?: unknown[], next?: unknown[]) {
  if (previous === next) return false;
  if (!previous || !next || previous.length !== next.length) return true;
  return previous.some((key, index) => !Object.is(key, next[index]));
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  // biome-ignore lint/plugin: React can catch any thrown JavaScript value.
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // biome-ignore lint/plugin: React can catch any thrown JavaScript value.
  componentDidCatch(error: unknown, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      resetKeysChanged(previousProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset();
    }
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    if (!hasError) return this.props.children;

    const { fallback } = this.props;
    if (fallback instanceof Function) {
      return fallback({ error, reset: this.reset });
    }
    if (fallback !== undefined) return fallback;
    return <ErrorFallback error={error} reset={this.reset} />;
  }
}

export {
  ErrorBoundary,
  type ErrorBoundaryProps,
  ErrorFallback,
  type ErrorFallbackProps,
};
