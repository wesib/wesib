import { describe, expect, it } from '@jest/globals';
import { ElementNaming } from './element-naming';

describe('globals', () => {
  describe('ElementNaming', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ElementNaming)).toBe('[ElementNaming]');
      });
    });
  });
});
