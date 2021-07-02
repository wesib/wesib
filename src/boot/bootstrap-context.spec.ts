import { describe, expect, it } from '@jest/globals';
import { BootstrapContext } from './bootstrap-context';

describe('boot', () => {
  describe('BootstrapContext', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(BootstrapContext)).toBe('[BootstrapContext]');
      });
    });
  });
});
