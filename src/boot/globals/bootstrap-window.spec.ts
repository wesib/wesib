import { describe, expect, it } from '@jest/globals';
import { ContextRegistry } from '@proc7ts/context-values';
import { BootstrapWindow } from './bootstrap-window';

describe('boot', () => {
  describe('BootstrapWindow', () => {
    it('defaults to window object', () => {

      const context = new ContextRegistry().newValues();

      expect(context.get(BootstrapWindow)).toBe(window);
    });
  });
});
