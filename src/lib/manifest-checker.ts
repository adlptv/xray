/**
 * Manifest v2 vs v3 compatibility checker.
 */

export interface ManifestCheckResult {
  version: 2 | 3 | 'unknown';
  isV3: boolean;
  issues: ManifestIssue[];
  migrationBlocked: boolean;
  score: number;
  grade: string;
}

interface ManifestIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  remediation: string;
}

const V2_ONLY_KEYS = ['browser_action', 'page_action', 'background.scripts', 'background.persistent'];
const V3_REQUIRED = ['action', 'background.service_worker'];
const DEPRECATED_APIS = [
  'webRequestBlocking',
  'chrome.extension.getBackgroundPage',
  'chrome.extension.getExtensionTabs',
  'chrome.extension.getURL',
  'chrome.extension.getViews',
  'chrome.tabs.executeScript',
  'chrome.tabs.insertCSS',
  'chrome.runtime.getBackgroundPage',
  'XMLHttpRequest',
];

export function checkManifest(manifest: Record<string, unknown>): ManifestCheckResult {
  const issues: ManifestIssue[] = [];
  let score = 0;
  let migrationBlocked = false;

  const manifestVersion = manifest.manifest_version as number;

  if (manifestVersion === 2) {
    issues.push({
      severity: 'warning',
      category: 'Manifest Version',
      message: 'Manifest V2 is deprecated. Chrome has phased out V2 extensions.',
      remediation: 'Migrate to Manifest V3. See https://developer.chrome.com/docs/extensions/mv3/intro/',
    });
    score += 15;
  } else if (manifestVersion === 3) {
    issues.push({
      severity: 'info',
      category: 'Manifest Version',
      message: 'Manifest V3 detected. Extension is using the current standard.',
      remediation: 'No action needed.',
    });
  } else {
    issues.push({
      severity: 'error',
      category: 'Manifest Version',
      message: `Unknown manifest_version: ${manifestVersion}`,
      remediation: 'Set manifest_version to 3.',
    });
    score += 50;
    migrationBlocked = true;
  }

  // Check V2-only keys
  for (const key of V2_ONLY_KEYS) {
    const parts = key.split('.');
    let obj: unknown = manifest;
    let found = true;
    for (const part of parts) {
      if (typeof obj === 'object' && obj !== null && part in obj) {
        obj = (obj as Record<string, unknown>)[part];
      } else {
        found = false;
        break;
      }
    }
    if (found) {
      issues.push({
        severity: 'error',
        category: 'Deprecated Key',
        message: `'${key}' is a Manifest V2 key that is not supported in V3.`,
        remediation: key.startsWith('browser_action')
          ? "Replace 'browser_action' with 'action'."
          : key.startsWith('page_action')
          ? "Replace 'page_action' with 'action'."
          : key.startsWith('background.scripts')
          ? "Replace 'background.scripts' with 'background.service_worker'."
          : "Remove 'background.persistent' — service workers are always non-persistent in V3.",
      });
      score += 10;
      migrationBlocked = true;
    }
  }

  // Check for V3 required keys
  if (manifestVersion === 3) {
    if (!('action' in manifest) && !('browser_action' in manifest)) {
      issues.push({
        severity: 'info',
        category: 'Missing Key',
        message: 'No action or browser_action key found. Extension may not have a toolbar icon.',
        remediation: 'Add an "action" key to define the toolbar icon.',
      });
    }
  }

  // Check background configuration
  const background = manifest.background as Record<string, unknown> | undefined;
  if (background) {
    if ('scripts' in background) {
      issues.push({
        severity: 'error',
        category: 'Background',
        message: 'Background scripts are not supported in Manifest V3.',
        remediation: 'Convert background scripts to a service worker: "background": { "service_worker": "background.js" }',
      });
      score += 15;
      migrationBlocked = true;
    }
    if ('persistent' in background) {
      issues.push({
        severity: 'error',
        category: 'Background',
        message: '"persistent" property is not supported in Manifest V3. Service workers are always non-persistent.',
        remediation: 'Remove "persistent" from background configuration.',
      });
      score += 5;
    }
  }

  // Check for deprecated API usage in script content
  const allJson = JSON.stringify(manifest);
  for (const api of DEPRECATED_APIS) {
    if (allJson.includes(api)) {
      issues.push({
        severity: 'warning',
        category: 'Deprecated API',
        message: `Detected usage of deprecated API: ${api}`,
        remediation: 'Replace with the Manifest V3 equivalent. See migration guide.',
      });
      score += 8;
    }
  }

  // Check content_security_policy format
  const csp = manifest.content_security_policy as Record<string, unknown> | string | undefined;
  if (csp && typeof csp === 'string' && manifestVersion === 3) {
    issues.push({
      severity: 'warning',
      category: 'CSP',
      message: 'String-form content_security_policy is deprecated in V3.',
      remediation: 'Use object form: "content_security_policy": { "extension_pages": "..." }',
    });
    score += 5;
  }

  // Check web_accessible_resources format
  const war = manifest.web_accessible_resources;
  if (war && Array.isArray(war) && manifestVersion === 3 && typeof war[0] === 'string') {
    issues.push({
      severity: 'warning',
      category: 'Web Accessible Resources',
      message: 'String array format for web_accessible_resources is deprecated in V3.',
      remediation: 'Use object form: "web_accessible_resources": [{ "resources": [...], "matches": [...] }]',
    });
    score += 5;
  }

  const grade = score <= 10 ? 'A' : score <= 20 ? 'B' : score <= 35 ? 'C' : score <= 50 ? 'D' : score <= 70 ? 'E' : 'F';

  return {
    version: (manifestVersion === 2 ? 2 : manifestVersion === 3 ? 3 : 'unknown'),
    isV3: manifestVersion === 3,
    issues,
    migrationBlocked,
    score: Math.min(score, 100),
    grade,
  };
}
