type LogContext = Record<string, unknown>;

function baseLog(level: "info" | "error" | "warn", message: string, context?: LogContext) {
  if (process.env.NODE_ENV === "test") return;

  const payload = {
    level,
    message,
    ...context,
    timestamp: new Date().toISOString(),
  };

  // Simple JSON logging – easy to plug into Logtail, Datadog, etc.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}

export function logInfo(message: string, context?: LogContext) {
  baseLog("info", message, context);
}

export function logWarn(message: string, context?: LogContext) {
  baseLog("warn", message, context);
}

export function logError(message: string, context?: LogContext) {
  baseLog("error", message, context);
}

export function logAuthEvent(action: string, context?: LogContext) {
  logInfo(`auth:${action}`, context);
}
