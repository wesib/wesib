import { describe, expect, it } from '@jest/globals';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';

describe('globals', () => {
  describe('DefaultNamespaceAliaser', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(DefaultNamespaceAliaser)).toBe('[DefaultNamespaceAliaser]');
      });
    });
  });
});
