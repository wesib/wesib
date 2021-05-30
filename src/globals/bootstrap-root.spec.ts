import { describe, expect, it } from '@jest/globals';
import { ContextRegistry } from '@proc7ts/context-values';
import { BootstrapRoot } from './bootstrap-root';

describe('boot', () => {
  describe('BootstrapRoot', () => {
    it('defaults to document body', () => {

      const context = new ContextRegistry().newValues();

      expect(context.get(BootstrapRoot)).toBe(window.document.body);
    });
  });
});
