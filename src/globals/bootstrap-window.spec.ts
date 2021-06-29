import { describe, expect, it } from '@jest/globals';
import { CxBuilder } from '@proc7ts/context-builder';
import { BootstrapWindow } from './bootstrap-window';

describe('boot', () => {
  describe('BootstrapWindow', () => {
    it('defaults to window object', () => {

      const context = new CxBuilder(get => ({ get })).context;

      expect(context.get(BootstrapWindow)).toBe(window);
    });
  });
});
