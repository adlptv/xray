/**
 * Shared constants for XRay.
 */

export const APP_NAME = 'XRay Security Analyzer';
export const APP_VERSION = '1.0.0';
export const ENGINE_VERSION = 'xray/v1';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES = 500;

export const RISK_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export const RISK_BG_COLORS: Record<string, string> = {
  low: 'rgba(34, 197, 94, 0.15)',
  medium: 'rgba(234, 179, 8, 0.15)',
  high: 'rgba(249, 115, 22, 0.15)',
  critical: 'rgba(239, 68, 68, 0.15)',
};

export const GRADE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const SEVERITY_ORDER = ['info', 'low', 'medium', 'high', 'critical'] as const;

export const CHROME_WEB_STORE_REGEX =
  /https?:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)\/detail\/([^/]+)/;

export const SUPPORTED_FILE_TYPES = ['.crx', '.zip'];

export const API_ROUTES = {
  analyze: '/api/analyze',
  analyses: '/api/analyses',
  analysis: (id: string) => `/api/analyses/${id}`,
  compare: (id1: string, id2: string) => `/api/analyses/${id1}/compare/${id2}`,
  permissions: '/api/permissions',
  health: '/api/health',
} as const;
