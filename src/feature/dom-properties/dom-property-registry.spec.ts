import { describe, expect, it } from '@jest/globals';
import { DomPropertyRegistry } from './dom-property-registry';

describe('feature/dom-properties', () => {
  describe('DomPropertyRegistry', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(DomPropertyRegistry)).toBe('[DomPropertyRegistry]');
      });
    });
  });
});
