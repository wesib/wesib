import { describe, expect, it } from '@jest/globals';
import { DefinitionContext } from './definition-context';

describe('component', () => {
  describe('DefinitionContext', () => {
    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(DefinitionContext)).toBe('[DefinitionContext]');
      });
    });
  });
});
