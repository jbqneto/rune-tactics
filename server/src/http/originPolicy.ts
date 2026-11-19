export interface OriginPolicyOptions {
  /** Explicit origins from ALLOWED_ORIGINS. `*` allows any origin. */
  allowedOrigins: string[];
  /** In production only same-origin and the explicit list are trusted. */
  production: boolean;
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLoopbackOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') && LOOPBACK_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Decides whether a browser Origin may call the HTTP API / open a WebSocket.
 * Same-origin is always allowed. With no explicit list outside production,
 * loopback origins are allowed so the Vite dev client (another port) works
 * without extra configuration.
 */
export function createOriginPolicy({ allowedOrigins, production }: OriginPolicyOptions) {
  return (origin: string, host?: string): boolean => {
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return true;
    if (host) {
      try {
        if (new URL(origin).host === host.split(',')[0].trim()) return true;
      } catch {
        return false;
      }
    }
    return !production && allowedOrigins.length === 0 && isLoopbackOrigin(origin);
  };
}

export function originPolicyFromEnv(env: NodeJS.ProcessEnv = process.env) {
  return createOriginPolicy({
    allowedOrigins: (env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
    production: env.NODE_ENV === 'production' || env.ENVIRONMENT === 'production',
  });
}
