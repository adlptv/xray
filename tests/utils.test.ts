import { describe, it, expect } from 'vitest';
import { formatBytes, formatDuration, generateId, truncate, debounce } from '@/lib/utils';

describe('Utils', () => {
  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should format KB', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format MB', () => {
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });

    it('should format with decimal', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(1500)).toBe('1.5s');
    });

    it('should format minutes', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
    });
  });

  describe('generateId', () => {
    it('should generate 16-character id', () => {
      expect(generateId()).toHaveLength(16);
    });

    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('truncate', () => {
    it('should not truncate short strings', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long strings', () => {
      const result = truncate('hello world', 5);
      expect(result).toBe('hello...');
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);

      debounced();
      debounced();
      debounced();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
