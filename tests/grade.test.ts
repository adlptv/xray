import { describe, it, expect } from 'vitest';
import { scoreToGrade, calculateOverallGrade, gradeColor, gradeLabel, gradeDescription } from '@/lib/grade';

describe('Grade Utilities', () => {
  describe('scoreToGrade', () => {
    it('should return A for scores 0-10', () => {
      expect(scoreToGrade(0)).toBe('A');
      expect(scoreToGrade(5)).toBe('A');
      expect(scoreToGrade(10)).toBe('A');
    });

    it('should return B for scores 11-20', () => {
      expect(scoreToGrade(11)).toBe('B');
      expect(scoreToGrade(15)).toBe('B');
      expect(scoreToGrade(20)).toBe('B');
    });

    it('should return C for scores 21-35', () => {
      expect(scoreToGrade(21)).toBe('C');
      expect(scoreToGrade(30)).toBe('C');
      expect(scoreToGrade(35)).toBe('C');
    });

    it('should return D for scores 36-50', () => {
      expect(scoreToGrade(36)).toBe('D');
      expect(scoreToGrade(45)).toBe('D');
      expect(scoreToGrade(50)).toBe('D');
    });

    it('should return E for scores 51-70', () => {
      expect(scoreToGrade(51)).toBe('E');
      expect(scoreToGrade(60)).toBe('E');
      expect(scoreToGrade(70)).toBe('E');
    });

    it('should return F for scores > 70', () => {
      expect(scoreToGrade(71)).toBe('F');
      expect(scoreToGrade(90)).toBe('F');
      expect(scoreToGrade(100)).toBe('F');
    });
  });

  describe('calculateOverallGrade', () => {
    it('should calculate weighted overall grade', () => {
      const result = calculateOverallGrade({
        permissionScore: 10,
        networkScore: 20,
        contentScriptScore: 5,
        exfiltrationScore: 10,
        manifestScore: 0,
      });
      expect(result.overall).toBe('A');
      expect(result.permissions).toBe('A');
      expect(result.network).toBe('B');
    });

    it('should handle all worst-case scores', () => {
      const result = calculateOverallGrade({
        permissionScore: 100,
        networkScore: 100,
        contentScriptScore: 100,
        exfiltrationScore: 100,
        manifestScore: 100,
      });
      expect(result.overall).toBe('F');
    });
  });

  describe('gradeColor', () => {
    it('should return correct color for each grade', () => {
      expect(gradeColor('A')).toBe('#22c55e');
      expect(gradeColor('F')).toBe('#dc2626');
    });
  });

  describe('gradeLabel', () => {
    it('should return correct label', () => {
      expect(gradeLabel('A')).toBe('Excellent');
      expect(gradeLabel('F')).toBe('Critical');
    });
  });

  describe('gradeDescription', () => {
    it('should return non-empty description', () => {
      expect(gradeDescription('A')).toBeTruthy();
      expect(gradeDescription('F')).toContain('Critical');
    });
  });
});
