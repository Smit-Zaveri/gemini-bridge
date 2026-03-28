import { describe, it, expect } from 'vitest';
import { cn, formatDate, getCriticalityColor } from '../src/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
      expect(cn('px-2 py-1', { 'px-4': true })).toBe('py-1 px-4');
    });
  });

  describe('formatDate', () => {
    it('formats a valid date string', () => {
      const dateStr = '2024-03-28T12:00:00Z';
      expect(formatDate(dateStr)).toBe(new Date(dateStr).toLocaleString());
    });
  });

  describe('getCriticalityColor', () => {
    it('returns correct color classes for different levels', () => {
      expect(getCriticalityColor('low')).toContain('text-green-500');
      expect(getCriticalityColor('medium')).toContain('text-amber-500');
      expect(getCriticalityColor('high')).toContain('text-orange-500');
      expect(getCriticalityColor('critical')).toContain('text-red-500');
      expect(getCriticalityColor('critical')).toContain('animate-pulse');
      expect(getCriticalityColor('unknown')).toContain('text-slate-500');
      
      // Case insensitive check
      expect(getCriticalityColor('LOW')).toContain('text-green-500');
    });
  });
});
