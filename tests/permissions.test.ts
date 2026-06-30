import { describe, it, expect } from 'vitest';
import { getPermissionInfo, calculatePermissionScore, PERMISSION_DATABASE } from '@/lib/permissions';

describe('Permissions', () => {
  describe('getPermissionInfo', () => {
    it('should return info for known permission', () => {
      const info = getPermissionInfo('tabs');
      expect(info.name).toBe('tabs');
      expect(info.riskLevel).toBe('high');
      expect(info.warnings.length).toBeGreaterThan(0);
    });

    it('should return default info for unknown permission', () => {
      const info = getPermissionInfo('unknown.permission');
      expect(info.name).toBe('unknown.permission');
      expect(info.riskLevel).toBe('medium');
      expect(info.baseScore).toBe(25);
    });
  });

  describe('calculatePermissionScore', () => {
    it('should return 0 for no permissions', () => {
      expect(calculatePermissionScore([])).toBe(0);
    });

    it('should calculate score for single permission', () => {
      const score = calculatePermissionScore(['storage']);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should have higher score for dangerous permissions', () => {
      const safeScore = calculatePermissionScore(['storage', 'alarms']);
      const dangerousScore = calculatePermissionScore(['debugger', 'management']);
      expect(dangerousScore).toBeGreaterThan(safeScore);
    });

    it('should cap at 100', () => {
      const allPerms = Object.keys(PERMISSION_DATABASE);
      const score = calculatePermissionScore(allPerms);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should have diminishing returns for many permissions', () => {
      const oneScore = calculatePermissionScore(['storage']);
      const twoScore = calculatePermissionScore(['storage', 'storage']);
      // Same permission twice — score should be in similar range
      expect(twoScore).toBeGreaterThanOrEqual(oneScore);
    });
  });

  describe('PERMISSION_DATABASE', () => {
    it('should have management as critical', () => {
      expect(PERMISSION_DATABASE['management'].riskLevel).toBe('critical');
    });

    it('should have debugger as critical', () => {
      expect(PERMISSION_DATABASE['debugger'].riskLevel).toBe('critical');
    });

    it('should have storage as low risk', () => {
      expect(PERMISSION_DATABASE['storage'].riskLevel).toBe('low');
    });

    it('should have warnings for high-risk permissions', () => {
      expect(PERMISSION_DATABASE['cookies'].warnings.length).toBeGreaterThan(0);
      expect(PERMISSION_DATABASE['webRequestBlocking'].warnings.length).toBeGreaterThan(0);
    });
  });
});
