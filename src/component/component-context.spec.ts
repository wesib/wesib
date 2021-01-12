import { valueProvider } from '@proc7ts/primitives';
import { ComponentContext, ComponentContext__symbol, ComponentContextHolder } from './component-context';

describe('component', () => {
  describe('ComponentContext', () => {
    describe('of', () => {

      let element: HTMLDivElement & ComponentContextHolder;
      let context: ComponentContext;

      beforeEach(() => {
        element = { name: 'HTML element' } as any;
        context = { name: 'component context' } as any;
        element[ComponentContext__symbol] = valueProvider(context);
      });

      it('extracts component context from custom element', () => {
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('fails when there is no context defined', () => {
        delete element[ComponentContext__symbol];

        expect(() => ComponentContext.of(element)).toThrow(TypeError);
      });
    });
  });
});
