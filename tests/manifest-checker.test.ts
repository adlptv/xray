import { describe, it, expect } from 'vitest';
import { checkManifest } from '@/lib/manifest-checker';

describe('Manifest Checker', () => {
  it('should detect Manifest V2', () => {
    const result = checkManifest({ manifest_version: 2, name: 'test' });
    expect(result.version).toBe(2);
    expect(result.isV3).toBe(false);
    expect(result.issues.some(i => i.category === 'Manifest Version')).toBe(true);
  });

  it('should detect Manifest V3', () => {
    const result = checkManifest({ manifest_version: 3, name: 'test' });
    expect(result.version).toBe(3);
    expect(result.isV3).toBe(true);
  });

  it('should flag browser_action as V2-only', () => {
    const result = checkManifest({
      manifest_version: 2,
      browser_action: { default_popup: 'popup.html' },
    });
    expect(result.issues.some(i => i.message.includes('browser_action'))).toBe(true);
  });

  it('should flag background.scripts as V2-only', () => {
    const result = checkManifest({
      manifest_version: 2,
      background: { scripts: ['bg.js'], persistent: false },
    });
    expect(result.issues.some(i => i.category === 'Background')).toBe(true);
    expect(result.migrationBlocked).toBe(true);
  });

  it('should flag string CSP in V3', () => {
    const result = checkManifest({
      manifest_version: 3,
      content_security_policy: 'script-src \'self\'',
    });
    expect(result.issues.some(i => i.category === 'CSP')).toBe(true);
  });

  it('should flag string-array web_accessible_resources in V3', () => {
    const result = checkManifest({
      manifest_version: 3,
      web_accessible_resources: ['resource1.png', 'resource2.css'],
    });
    expect(result.issues.some(i => i.category === 'Web Accessible Resources')).toBe(true);
  });

  it('should return better grade for clean V3', () => {
    const result = checkManifest({
      manifest_version: 3,
      name: 'clean',
      action: { default_popup: 'popup.html' },
    });
    expect(result.grade).toBe('A');
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it('should handle unknown manifest version', () => {
    const result = checkManifest({ manifest_version: 1 });
    expect(result.version).toBe('unknown');
    expect(result.migrationBlocked).toBe(true);
  });
});
