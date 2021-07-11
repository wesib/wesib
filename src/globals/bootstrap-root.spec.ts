import { describe, expect, it } from '@jest/globals';
import { CxBuilder } from '@proc7ts/context-builder';
import { BootstrapRoot } from './bootstrap-root';

describe('globals', () => {
  describe('BootstrapRoot', () => {
    it('defaults to document body', () => {

      const context = new CxBuilder(get => ({ get })).context;

      expect(context.get(BootstrapRoot)).toBe(window.document.body);
    });

    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(BootstrapRoot)).toBe('[BootstrapRoot]');
      });
    });
  });
});
