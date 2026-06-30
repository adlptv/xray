/**
 * Network call analyzer — extracts and categorizes network requests from extension source.
 */

export interface NetworkCallEntry {
  url: string;
  method: string;
  domain: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
}

const SUSPICIOUS_DOMAINS = new Set([
  'pastebin.com',
  'ngrok.io',
  'ngrok.app',
  'requestbin.com',
  'hookbin.com',
  'webhook.site',
  'pipedream.net',
  'iplogger.org',
  'iplogger.com',
  'grabify.link',
]);

const TRACKING_DOMAINS = new Set([
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'connect.facebook.net',
  'doubleclick.net',
  'hotjar.com',
  'mixpanel.com',
  'segment.io',
  'amplitude.com',
  'fullstory.com',
]);

const DATA_EXFIL_PATTERNS = [
  /fetch\s*\(\s*['"`]https?:\/\//gi,
  /XMLHttpRequest/gi,
  /navigator\.sendBeacon/gi,
  /WebSocket\s*\(\s*['"`]wss?:\/\//gi,
  /\$\.ajax\s*\(/gi,
  /\$\.post\s*\(/gi,
  /\$\.get\s*\(/gi,
  /axios\.(post|get|put|delete|patch)\s*\(/gi,
];

const URL_REGEX = /['"`](https?:\/\/[^\s'"`<>{}|\\^[\]]+)['"`]/g;

export function extractNetworkCalls(sourceCode: string, fileName: string): NetworkCallEntry[] {
  const calls: NetworkCallEntry[] = [];
  const seen = new Set<string>();

  // Extract URLs from string literals
  const urlMatches = sourceCode.matchAll(URL_REGEX);
  for (const match of urlMatches) {
    const url = match[1];
    if (seen.has(url)) continue;
    seen.add(url);

    let domain = url;
    try {
      domain = new URL(url).hostname;
    } catch {
      // keep raw url
    }

    const flags: string[] = [];
    let risk: NetworkCallEntry['risk'] = 'low';

    if (SUSPICIOUS_DOMAINS.has(domain)) {
      flags.push('suspicious-domain');
      risk = 'critical';
    }
    if (TRACKING_DOMAINS.has(domain)) {
      flags.push('tracking-domain');
      risk = risk === 'low' ? 'medium' : risk;
    }
    if (url.startsWith('http://')) {
      flags.push('insecure-http');
      risk = risk === 'low' ? 'medium' : risk;
    }
    if (url.includes('api') || url.includes('webhook')) {
      flags.push('api-endpoint');
    }

    calls.push({
      url,
      method: 'GET',
      domain,
      risk,
      flags,
    });
  }

  // Detect fetch/XHR patterns
  for (const pattern of DATA_EXFIL_PATTERNS) {
    const matches = sourceCode.matchAll(pattern);
    for (const match of matches) {
      const context = sourceCode.slice(Math.max(0, match.index! - 50), Math.min(sourceCode.length, match.index! + 200));
      const urlInContext = context.match(/['"`](https?:\/\/[^\s'"`<>{}|\\^[\]]+)['"`]/);
      if (urlInContext) {
        const url = urlInContext[1];
        if (seen.has(url)) continue;
        seen.add(url);

        let domain = url;
        try { domain = new URL(url).hostname; } catch {}

        calls.push({
          url,
          method: pattern.source.includes('post') ? 'POST' : 'GET',
          domain,
          risk: 'high',
          flags: ['dynamic-request', match[0]],
        });
      }
    }
  }

  // Detect sendBeacon (data exfiltration)
  if (sourceCode.includes('sendBeacon')) {
    calls.push({
      url: '[dynamic — sendBeacon]',
      method: 'POST',
      domain: 'unknown',
      risk: 'high',
      flags: ['beacon-api', 'data-exfiltration-possible'],
    });
  }

  // Detect WebSocket connections
  const wsMatches = sourceCode.matchAll(/WebSocket\s*\(\s*['"`](wss?:\/\/[^'"`]+)['"`]\s*\)/g);
  for (const match of wsMatches) {
    if (seen.has(match[1])) continue;
    seen.add(match[1]);
    let domain = match[1];
    try { domain = new URL(match[1]).hostname; } catch {}
    calls.push({
      url: match[1],
      method: 'WS',
      domain,
      risk: 'medium',
      flags: ['websocket'],
    });
  }

  return calls;
}

export function calculateNetworkScore(calls: NetworkCallEntry[]): number {
  if (calls.length === 0) return 0;

  let score = 0;
  for (const call of calls) {
    switch (call.risk) {
      case 'critical': score += 25; break;
      case 'high': score += 15; break;
      case 'medium': score += 8; break;
      case 'low': score += 3; break;
    }
  }

  return Math.min(score, 100);
}
