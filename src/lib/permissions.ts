/**
 * Chrome/Firefox extension permission database with risk scoring.
 */

export interface PermissionInfo {
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  baseScore: number;
  warnings: string[];
}

export const PERMISSION_DATABASE: Record<string, PermissionInfo> = {
  // Critical permissions
  'management': {
    name: 'management',
    description: 'Manage installed extensions, apps, and themes',
    riskLevel: 'critical',
    baseScore: 80,
    warnings: ['Can uninstall or disable other extensions', 'Can manipulate other extensions\' settings'],
  },
  'debugger': {
    name: 'debugger',
    description: 'Attach Chrome DevTools Protocol debugger',
    riskLevel: 'critical',
    baseScore: 90,
    warnings: ['Full debugging access to any tab', 'Can intercept all network traffic', 'Can execute arbitrary JavaScript'],
  },
  'nativeMessaging': {
    name: 'nativeMessaging',
    description: 'Communicate with native applications',
    riskLevel: 'critical',
    baseScore: 75,
    warnings: ['Can communicate with native apps', 'Potential bridge for sandbox escape'],
  },
  'proxy': {
    name: 'proxy',
    description: 'Proxy server management',
    riskLevel: 'critical',
    baseScore: 70,
    warnings: ['Can redirect all browser traffic', 'Man-in-the-middle capability'],
  },
  'webRequest': {
    name: 'webRequest',
    description: 'Observe and intercept network requests',
    riskLevel: 'high',
    baseScore: 65,
    warnings: ['Can see all network traffic', 'Can modify or block requests'],
  },
  'webRequestBlocking': {
    name: 'webRequestBlocking',
    description: 'Block network requests synchronously',
    riskLevel: 'critical',
    baseScore: 85,
    warnings: ['Can block any request', 'Deprecated in Manifest V3'],
  },

  // High permissions
  'tabs': {
    name: 'tabs',
    description: 'Access browser tabs',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can read tab URLs and titles', 'Can access tab content', 'Can inject scripts into tabs'],
  },
  'cookies': {
    name: 'cookies',
    description: 'Read and modify cookies',
    riskLevel: 'high',
    baseScore: 55,
    warnings: ['Can read session cookies', 'Can steal authentication tokens', 'Can modify authentication state'],
  },
  'history': {
    name: 'history',
    description: 'Access browsing history',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can read entire browsing history', 'Can delete history entries'],
  },
  'bookmarks': {
    name: 'bookmarks',
    description: 'Read and modify bookmarks',
    riskLevel: 'medium',
    baseScore: 30,
    warnings: ['Can read bookmark data'],
  },
  'idle': {
    name: 'idle',
    description: 'Detect device idle state',
    riskLevel: 'medium',
    baseScore: 15,
    warnings: ['Can detect when user is away'],
  },
  'notifications': {
    name: 'notifications',
    description: 'Create system notifications',
    riskLevel: 'medium',
    baseScore: 20,
    warnings: ['Can display phishing notifications'],
  },
  'clipboardWrite': {
    name: 'clipboardWrite',
    description: 'Write to clipboard',
    riskLevel: 'medium',
    baseScore: 25,
    warnings: ['Can overwrite clipboard content'],
  },
  'clipboardRead': {
    name: 'clipboardRead',
    description: 'Read clipboard data',
    riskLevel: 'high',
    baseScore: 45,
    warnings: ['Can read sensitive data from clipboard (passwords, etc.)'],
  },
  'storage': {
    name: 'storage',
    description: 'Access extension storage',
    riskLevel: 'low',
    baseScore: 10,
    warnings: [],
  },
  'unlimitedStorage': {
    name: 'unlimitedStorage',
    description: 'Unlimited storage quota',
    riskLevel: 'low',
    baseScore: 5,
    warnings: [],
  },
  'contextMenus': {
    name: 'contextMenus',
    description: 'Add items to context menu',
    riskLevel: 'low',
    baseScore: 5,
    warnings: [],
  },
  'commands': {
    name: 'commands',
    description: 'Keyboard shortcuts',
    riskLevel: 'low',
    baseScore: 5,
    warnings: [],
  },
  'alarms': {
    name: 'alarms',
    description: 'Schedule code execution',
    riskLevel: 'low',
    baseScore: 8,
    warnings: [],
  },
  'power': {
    name: 'power',
    description: 'Override power management',
    riskLevel: 'medium',
    baseScore: 15,
    warnings: ['Can prevent device from sleeping'],
  },
  'privacy': {
    name: 'privacy',
    description: 'Access privacy settings',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can modify privacy settings', 'Can disable tracking protection'],
  },
  'system.cpu': {
    name: 'system.cpu',
    description: 'Access CPU information',
    riskLevel: 'medium',
    baseScore: 15,
    warnings: ['Can fingerprint device'],
  },
  'system.memory': {
    name: 'system.memory',
    description: 'Access memory information',
    riskLevel: 'medium',
    baseScore: 15,
    warnings: ['Can fingerprint device'],
  },
  'system.storage': {
    name: 'system.storage',
    description: 'Access storage device info',
    riskLevel: 'medium',
    baseScore: 15,
    warnings: ['Can fingerprint device'],
  },
  'topSites': {
    name: 'topSites',
    description: 'Access most visited sites',
    riskLevel: 'medium',
    baseScore: 25,
    warnings: ['Reveals browsing habits'],
  },
  'tts': {
    name: 'tts',
    description: 'Text-to-speech',
    riskLevel: 'low',
    baseScore: 5,
    warnings: [],
  },
  'wallpaper': {
    name: 'wallpaper',
    description: 'Set wallpaper (ChromeOS)',
    riskLevel: 'low',
    baseScore: 5,
    warnings: [],
  },
  'fileBrowserHandler': {
    name: 'fileBrowserHandler',
    description: 'Access files in ChromeOS file browser',
    riskLevel: 'high',
    baseScore: 40,
    warnings: ['Can access local files'],
  },
  'gcm': {
    name: 'gcm',
    description: 'Google Cloud Messaging',
    riskLevel: 'medium',
    baseScore: 20,
    warnings: ['Can receive push messages'],
  },
  'identity': {
    name: 'identity',
    description: 'Access user identity',
    riskLevel: 'high',
    baseScore: 45,
    warnings: ['Can access Google account email', 'Can request OAuth tokens'],
  },
  'geolocation': {
    name: 'geolocation',
    description: 'Access geographic location',
    riskLevel: 'high',
    baseScore: 45,
    warnings: ['Can track user location'],
  },
  'audioCapture': {
    name: 'audioCapture',
    description: 'Capture audio from microphone',
    riskLevel: 'critical',
    baseScore: 70,
    warnings: ['Can record microphone audio'],
  },
  'videoCapture': {
    name: 'videoCapture',
    description: 'Capture video from camera',
    riskLevel: 'critical',
    baseScore: 70,
    warnings: ['Can record camera video'],
  },
  'serial': {
    name: 'serial',
    description: 'Access serial devices',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can communicate with hardware devices'],
  },
  'usb': {
    name: 'usb',
    description: 'Access USB devices',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can communicate with USB devices'],
  },
  'bluetooth': {
    name: 'bluetooth',
    description: 'Access Bluetooth devices',
    riskLevel: 'high',
    baseScore: 45,
    warnings: ['Can discover and connect to Bluetooth devices'],
  },
  'vpnProvider': {
    name: 'vpnProvider',
    description: 'Provide VPN configurations',
    riskLevel: 'high',
    baseScore: 50,
    warnings: ['Can intercept all network traffic via VPN'],
  },
};

export function getPermissionInfo(name: string): PermissionInfo {
  return PERMISSION_DATABASE[name] || {
    name,
    description: 'Unknown permission',
    riskLevel: 'medium',
    baseScore: 25,
    warnings: ['Unknown permission — risk level uncertain'],
  };
}

export function calculatePermissionScore(permissions: string[]): number {
  if (permissions.length === 0) return 0;

  let totalScore = 0;
  for (const perm of permissions) {
    const info = getPermissionInfo(perm);
    totalScore += info.baseScore;
  }

  // Diminishing returns — more permissions = higher risk, but not linearly
  const multiplier = 1 + Math.min(permissions.length * 0.05, 0.5);
  return Math.min(Math.round(totalScore * multiplier / Math.max(permissions.length, 1)), 100);
}
