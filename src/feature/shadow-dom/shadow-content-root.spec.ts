import { describe, expect, it } from '@jest/globals';
import { ShadowContentRoot } from './shadow-content-root';

describe('feature/shadow-dom', () => {
  describe('ShadowContentRoot', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ShadowContentRoot)).toBe('[ShadowContentRoot]');
      });
    });
  });
});
