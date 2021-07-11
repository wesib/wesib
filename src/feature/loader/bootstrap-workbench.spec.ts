import { describe, expect, it } from '@jest/globals';
import { BootstrapWorkbench } from './bootstrap-workbench.impl';

describe('feature', () => {
  describe('BootstrapWorkbench', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(BootstrapWorkbench)).toBe('[BootstrapWorkbench]');
      });
    });
  });
});
