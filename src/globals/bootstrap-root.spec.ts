import { describe, expect, it } from '@jest/globals';
import { CxBuilder } from '@proc7ts/context-builder';
import { BootstrapRoot } from './bootstrap-root';

describe('boot', () => {
  describe('BootstrapRoot', () => {
    it('defaults to document body', () => {

      const context = new CxBuilder(get => ({ get })).context;

      expect(context.get(BootstrapRoot)).toBe(window.document.body);
    });
  });
});
