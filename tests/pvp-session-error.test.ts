import { describe, expect, it } from 'vitest';
import { describeSessionError } from '../src/network/ColyseusMatchClient';

describe('PvP session error messages', () => {
  it('explains a 403 origin rejection instead of showing a raw "Forbidden"', () => {
    const msg = describeSessionError(403, 'Forbidden');
    expect(msg).toMatch(/ALLOWED_ORIGINS/);
    expect(msg).not.toMatch(/\(403\): Forbidden/);
  });

  it('explains when the PvP server is unreachable or failing', () => {
    expect(describeSessionError(502, '')).toMatch(/PvP server/i);
  });

  it('keeps status and detail for other errors', () => {
    expect(describeSessionError(400, 'bad name')).toBe('Failed to acquire PvP session (400): bad name');
  });
});
