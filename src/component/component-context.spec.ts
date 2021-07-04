import { beforeEach, describe, expect, it } from '@jest/globals';
import { valueProvider } from '@proc7ts/primitives';
import { ComponentContext, ComponentContext__symbol, ComponentInstance } from './component-context';

describe('component', () => {
  describe('ComponentContext', () => {
    describe('of', () => {

      let component: ComponentInstance;
      let context: ComponentContext;

      beforeEach(() => {
        component = {};
        context = { name: 'component context' } as any;
        component[ComponentContext__symbol] = valueProvider(context);
      });

      it('extracts component context from custom element', () => {
        expect(ComponentContext.of(component)).toBe(context);
      });
      it('fails when there is no context defined', () => {
        delete component[ComponentContext__symbol];

        expect(() => ComponentContext.of(component))
            .toThrow(new TypeError('No component context found in [object Object]'));
      });
    });

    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(ComponentContext)).toBe('[ComponentContext]');
      });
    });
  });
});
