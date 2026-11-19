import { describe, expect, it } from 'vitest';
import { createOriginPolicy } from '../src/http/originPolicy.js';

describe('origin policy', () => {
  it('allows same-origin requests', () => {
    const allowed = createOriginPolicy({ allowedOrigins: [], production: true });
    expect(allowed('https://play.example.com', 'play.example.com')).toBe(true);
  });

  it('allows loopback dev clients (Vite on another port) outside production when no list is configured', () => {
    const allowed = createOriginPolicy({ allowedOrigins: [], production: false });
    expect(allowed('http://localhost:5173', 'localhost:2567')).toBe(true);
    expect(allowed('http://127.0.0.1:5194', 'localhost:2567')).toBe(true);
    expect(allowed('http://[::1]:5173', 'localhost:2567')).toBe(true);
    expect(allowed('https://evil.example', 'localhost:2567')).toBe(false);
  });

  it('never trusts loopback cross-origin requests in production', () => {
    const allowed = createOriginPolicy({ allowedOrigins: [], production: true });
    expect(allowed('http://localhost:5173', 'play.example.com')).toBe(false);
  });

  it('uses only the explicit list (plus same-origin) once ALLOWED_ORIGINS is configured', () => {
    const allowed = createOriginPolicy({ allowedOrigins: ['https://allowed.example'], production: false });
    expect(allowed('https://allowed.example', 'localhost:2567')).toBe(true);
    expect(allowed('http://localhost:5173', 'localhost:2567')).toBe(false);
  });

  it('supports the * wildcard', () => {
    expect(createOriginPolicy({ allowedOrigins: ['*'], production: true })('https://any.example')).toBe(true);
  });
});
