/**
 * Data exfiltration detector — heuristic analysis of extension source code.
 */

export interface ExfilFinding {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string;
  filePath?: string;
}

interface ExfilDetectionResult {
  findings: ExfilFinding[];
  score: number;
  summary: string;
}

const PATTERNS: Array<{ type: string; regex: RegExp; severity: ExfilFinding['severity']; description: string }> = [
  {
    type: 'clipboard-access',
    regex: /navigator\.clipboard\.(read|readText|write|writeText)/gi,
    severity: 'high',
    description: 'Clipboard access detected — can read sensitive data (passwords, tokens) from clipboard.',
  },
  {
    type: 'cookie-access',
    regex: /document\.cookie/gi,
    severity: 'high',
    description: 'Cookie access detected — can steal session tokens and authentication data.',
  },
  {
    type: 'local-storage-read',
    regex: /localStorage\.(getItem|removeItem)/gi,
    severity: 'medium',
    description: 'Local storage access detected — may read stored application data.',
  },
  {
    type: 'local-storage-write',
    regex: /localStorage\.setItem/gi,
    severity: 'low',
    description: 'Local storage write detected — generally safe but can be used for tracking.',
  },
  {
    type: 'session-storage',
    regex: /sessionStorage\.(getItem|setItem|removeItem)/gi,
    severity: 'medium',
    description: 'Session storage access detected — may access sensitive session data.',
  },
  {
    type: 'indexed-db',
    regex: /indexedDB\.open/gi,
    severity: 'medium',
    description: 'IndexedDB access detected — can read large amounts of stored data.',
  },
  {
    type: 'form-capture',
    regex: /document\.forms|\.querySelectorAll\s*\(\s*['"`]input|\.querySelectorAll\s*\(\s*['"`]form/gi,
    severity: 'high',
    description: 'Form/input field access detected — can capture form data including passwords.',
  },
  {
    type: 'screenshot',
    regex: /chrome\.(tabs|captureVisibleTab)|html2canvas|dom-to-image/gi,
    severity: 'high',
    description: 'Screenshot capability detected — can capture page content visually.',
  },
  {
    type: 'keylogging',
    regex: /addEventListener\s*\(\s*['"`]keydown|addEventListener\s*\(\s*['"`]keypress|addEventListener\s*\(\s*['"`]keyup/gi,
    severity: 'critical',
    description: 'Keyboard event listener detected — potential keylogging behavior.',
  },
  {
    type: 'geolocation',
    regex: /navigator\.geolocation\.(getCurrentPosition|watchPosition)/gi,
    severity: 'high',
    description: 'Geolocation access detected — can track user location.',
  },
  {
    type: 'eval-execution',
    regex: /\beval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*['"`]|setInterval\s*\(\s*['"`]/gi,
    severity: 'high',
    description: 'Dynamic code execution detected — can run arbitrary code, bypassing static analysis.',
  },
  {
    type: 'websocket-exfil',
    regex: /new\s+WebSocket\s*\(/gi,
    severity: 'medium',
    description: 'WebSocket connection detected — can be used for real-time data exfiltration.',
  },
  {
    type: 'beacon',
    regex: /navigator\.sendBeacon\s*\(/gi,
    severity: 'high',
    description: 'Beacon API detected — designed for background data transmission, even during page unload.',
  },
  {
    type: 'permission-query',
    regex: /navigator\.permissions\.query/gi,
    severity: 'medium',
    description: 'Permission query detected — can fingerprint user based on granted permissions.',
  },
  {
    type: 'fingerprinting',
    regex: /navigator\.(userAgent|platform|language|hardwareConcurrency|deviceMemory|plugins)/gi,
    severity: 'medium',
    description: 'Device fingerprinting detected — can uniquely identify user across sites.',
  },
  {
    type: 'canvas-fingerprinting',
    regex: /canvas\.toDataURL|canvas\.getImageData|getContext\s*\(\s*['"`]2d['"`]\s*\)/gi,
    severity: 'medium',
    description: 'Canvas fingerprinting detected — can generate unique device fingerprint.',
  },
  {
    type: 'web-rtc-leak',
    regex: /RTCPeerConnection|webkitRTCPeerConnection/gi,
    severity: 'medium',
    description: 'WebRTC usage detected — may leak local IP address.',
  },
  {
    type: 'external-fetch',
    regex: /fetch\s*\(\s*['"`]https?:\/\//gi,
    severity: 'medium',
    description: 'External fetch request detected — data may be sent to external server.',
  },
];

export function detectExfiltration(sourceFiles: Array<{ path: string; content: string }>): ExfilDetectionResult {
  const findings: ExfilFinding[] = [];
  let score = 0;

  for (const file of sourceFiles) {
    for (const pattern of PATTERNS) {
      const matches = [...file.content.matchAll(pattern.regex)];
      if (matches.length > 0) {
        const evidence = matches[0][0];
        findings.push({
          type: pattern.type,
          severity: pattern.severity,
          description: pattern.description,
          evidence: `${file.path}: ...${file.content.slice(Math.max(0, matches[0].index! - 20), Math.min(file.content.length, matches[0].index! + 80))}...`,
          filePath: file.path,
        });

        switch (pattern.severity) {
          case 'critical': score += 30; break;
          case 'high': score += 18; break;
          case 'medium': score += 8; break;
          case 'low': score += 3; break;
        }
      }
    }
  }

  score = Math.min(score, 100);

  const summary = findings.length === 0
    ? 'No data exfiltration patterns detected.'
    : findings.length <= 3
    ? `${findings.length} potential data exfiltration risk(s) detected.`
    : `${findings.length} data exfiltration risks detected — review recommended.`;

  return { findings, score, summary };
}
