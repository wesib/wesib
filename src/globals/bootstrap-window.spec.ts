import { describe, expect, it } from '@jest/globals';
import { CxBuilder } from '@proc7ts/context-builder';
import { BootstrapWindow } from './bootstrap-window';

describe('globals', () => {
  describe('BootstrapWindow', () => {
    it('defaults to window object', () => {

      const context = new CxBuilder(get => ({ get })).context;

      expect(context.get(BootstrapWindow)).toBe(window);
    });

    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(BootstrapWindow)).toBe('[BootstrapWindow]');
      });
    });
  });
});
