import { describe, expect, it } from '@jest/globals';
import { ShadowRootBuilder } from './shadow-root-builder';

describe('feature/shadow-dom', () => {
  describe('ShadowRootBuilder', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ShadowRootBuilder)).toBe('[ShadowRootBuilder]');
      });
    });
  });
});
