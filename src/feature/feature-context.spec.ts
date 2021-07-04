import { describe, expect, it } from '@jest/globals';
import { FeatureContext } from './feature-context';

describe('feature', () => {
  describe('FeatureContext', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(FeatureContext)).toBe('[FeatureContext]');
      });
    });
  });
});
