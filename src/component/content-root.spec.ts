import { describe, expect, it } from '@jest/globals';
import { ContentRoot } from './content-root';

describe('component', () => {
  describe('ContentRoot', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ContentRoot)).toBe('[ContentRoot]');
      });
    });
  });
});
