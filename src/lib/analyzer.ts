/**
 * XRay Core Analysis Engine
 * Orchestrates all analysis modules: permissions, network, content scripts, exfiltration, manifest.
 */

import { calculateOverallGrade } from './grade';
import { getPermissionInfo, calculatePermissionScore } from './permissions';
import { extractNetworkCalls, calculateNetworkScore } from './network-analyzer';
import { detectExfiltration } from './exfil-detector';
import { checkManifest } from './manifest-checker';
import { ENGINE_VERSION } from './constants';

export interface AnalysisResult {
  fileName: string;
  fileSize: number;
  extensionId?: string;
  extensionName?: string;
  version?: string;
  manifestVersion?: number;
  overallGrade: string;
  gradeBreakdown: {
    overall: string;
    permissions: string;
    network: string;
    contentScripts: string;
    exfiltration: string;
    manifest: string;
  };
  overview: {
    totalFiles: number;
    totalSize: number;
    scanDuration: number;
    engine: string;
  };
  permissions: Array<{
    name: string;
    description: string;
    riskLevel: string;
    grade: string;
    warnings: string[];
  }>;
  networkCalls: Array<{
    url: string;
    method: string;
    domain: string;
    risk: string;
    flags: string[];
  }>;
  contentScripts: Array<{
    matches: string[];
    fileName: string;
    riskFlags: string[];
  }>;
  exfilFindings: Array<{
    type: string;
    severity: string;
    description: string;
    evidence: string;
    filePath?: string;
  }>;
  manifestCheck: {
    version: number | string;
    isV3: boolean;
    issues: Array<{
      severity: string;
      category: string;
      message: string;
      remediation: string;
    }>;
    migrationBlocked: boolean;
    score: number;
    grade: string;
  };
  vulnerabilities: Array<{
    severity: string;
    category: string;
    description: string;
    filePath?: string;
    lineNumber?: number;
    remediation: string;
    cweId?: string;
  }>;
  files: Array<{
    path: string;
    fileType: string;
    size: number;
    suspicious: boolean;
  }>;
}

const SUSPICIOUS_FILE_PATTERNS = [
  /\.exe$/i,
  /\.dll$/i,
  /\.so$/i,
  /\.dylib$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.sh$/i,
  /\.ps1$/i,
];

const SUSPICIOUS_CODE_PATTERNS: Array<{ pattern: RegExp; category: string; cwe: string; remediation: string }> = [
  {
    pattern: /eval\s*\(/gi,
    category: 'Code Injection',
    cwe: 'CWE-94',
    remediation: 'Remove eval() usage. Use safe alternatives like JSON.parse() for data parsing.',
  },
  {
    pattern: /document\.write\s*\(/gi,
    category: 'XSS via document.write',
    cwe: 'CWE-79',
    remediation: 'Avoid document.write(). Use DOM manipulation methods instead.',
  },
  {
    pattern: /innerHTML\s*=/gi,
    category: 'Potential XSS',
    cwe: 'CWE-79',
    remediation: 'Use textContent or DOM APIs instead of innerHTML to prevent XSS.',
  },
  {
    pattern: /\.exec\s*\(/gi,
    category: 'Dynamic Code Execution',
    cwe: 'CWE-94',
    remediation: 'Review RegExp.exec usage for safety. Avoid dynamic code generation.',
  },
];

function gradeFromScore(score: number): string {
  if (score <= 10) return 'A';
  if (score <= 20) return 'B';
  if (score <= 35) return 'C';
  if (score <= 50) return 'D';
  if (score <= 70) return 'E';
  return 'F';
}

function contentScriptRiskScore(matches: string[]): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];

  for (const match of matches) {
    if (match === '<all_urls>') {
      score += 30;
      flags.push('all-urls');
    } else if (match === '*://*/*') {
      score += 30;
      flags.push('all-sites');
    } else if (match.startsWith('*://')) {
      score += 10;
      flags.push('wildcard-protocol');
    } else if (match.includes('*')) {
      score += 8;
      flags.push('wildcard-pattern');
    } else {
      score += 2;
    }

    // Bank/financial sites
    if (match.includes('bank') || match.includes('paypal') || match.includes('stripe')) {
      score += 20;
      flags.push('financial-site');
    }
    // Google/auth pages
    if (match.includes('google.com') && (match.includes('account') || match.includes('login'))) {
      score += 15;
      flags.push('auth-page');
    }
  }

  return { score: Math.min(score, 100), flags };
}

export function analyzeExtension(
  manifest: Record<string, unknown>,
  files: Array<{ path: string; content: string; size: number }>,
  fileName: string,
  fileSize: number
): AnalysisResult {
  const startTime = Date.now();

  // --- Permission Analysis ---
  const rawPermissions = (manifest.permissions as string[]) || [];
  const hostPermissions = (manifest.host_permissions as string[]) || [];
  const allPermissions = [...rawPermissions, ...hostPermissions];

  const permissions = allPermissions.map((name) => {
    const info = getPermissionInfo(name);
    return {
      name: info.name,
      description: info.description,
      riskLevel: info.riskLevel,
      grade: gradeFromScore(info.baseScore),
      warnings: info.warnings,
    };
  });

  const permissionScore = calculatePermissionScore(allPermissions);

  // --- Network Analysis ---
  const jsFiles = files.filter((f) => f.path.endsWith('.js') || f.path.endsWith('.html'));
  const allSource = jsFiles.map((f) => f.content).join('\n');
  const networkCalls = extractNetworkCalls(allSource, fileName);
  const networkScore = calculateNetworkScore(networkCalls);

  // --- Content Script Analysis ---
  const contentScriptsRaw = (manifest.content_scripts as Array<Record<string, unknown>>) || [];
  const contentScripts = contentScriptsRaw.map((cs, i) => {
    const matches = (cs.matches as string[]) || [];
    const js = (cs.js as string[]) || [];
    const { score, flags } = contentScriptRiskScore(matches);
    return {
      matches,
      fileName: js[0] || `content-script-${i}.js`,
      riskFlags: flags,
    };
  });

  const contentScriptScore = contentScripts.length === 0
    ? 0
    : Math.min(
        contentScripts.reduce((sum, cs) => sum + contentScriptRiskScore(cs.matches).score, 0) / contentScripts.length,
        100
      );

  // --- Exfiltration Detection ---
  const exfilResult = detectExfiltration(jsFiles.map((f) => ({ path: f.path, content: f.content })));

  // --- Manifest Check ---
  const manifestCheck = checkManifest(manifest);

  // --- Vulnerability Detection ---
  const vulnerabilities: AnalysisResult['vulnerabilities'] = [];
  for (const file of jsFiles) {
    for (const { pattern, category, cwe, remediation } of SUSPICIOUS_CODE_PATTERNS) {
      const matches = [...file.content.matchAll(pattern)];
      if (matches.length > 0) {
        const lineNum = file.content.slice(0, matches[0].index).split('\n').length;
        const severity = category.includes('Injection') ? 'high' : 'medium';
        vulnerabilities.push({
          severity,
          category,
          description: `${category} detected in ${file.path}`,
          filePath: file.path,
          lineNumber: lineNum,
          remediation,
          cweId: cwe,
        });
      }
    }
  }

  // --- File Analysis ---
  const analyzedFiles = files.map((f) => {
    const ext = f.path.split('.').pop()?.toLowerCase() || '';
    const suspicious = SUSPICIOUS_FILE_PATTERNS.some((p) => p.test(f.path));
    return {
      path: f.path,
      fileType: ext,
      size: f.size,
      suspicious,
    };
  });

  // --- Grade Calculation ---
  const grades = calculateOverallGrade({
    permissionScore,
    networkScore,
    contentScriptScore,
    exfiltrationScore: exfilResult.score,
    manifestScore: manifestCheck.score,
  });

  const scanDuration = Date.now() - startTime;

  return {
    fileName,
    fileSize,
    extensionId: manifest.key as string | undefined,
    extensionName: manifest.name as string | undefined,
    version: manifest.version as string | undefined,
    manifestVersion: manifest.manifest_version as number | undefined,
    overallGrade: grades.overall,
    gradeBreakdown: {
      overall: grades.overall,
      permissions: grades.permissions,
      network: grades.network,
      contentScripts: grades.contentScripts,
      exfiltration: grades.exfiltration,
      manifest: grades.manifest,
    },
    overview: {
      totalFiles: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      scanDuration,
      engine: ENGINE_VERSION,
    },
    permissions,
    networkCalls,
    contentScripts,
    exfilFindings: exfilResult.findings,
    manifestCheck: {
      version: manifestCheck.version,
      isV3: manifestCheck.isV3,
      issues: manifestCheck.issues,
      migrationBlocked: manifestCheck.migrationBlocked,
      score: manifestCheck.score,
      grade: manifestCheck.grade,
    },
    vulnerabilities,
    files: analyzedFiles,
  };
}
