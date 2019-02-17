import { ComponentContext, componentContextSymbol } from './component-context';

describe('component/component-context', () => {
  describe('ComponentContext', () => {
    describe('of', () => {

      let element: HTMLDivElement;
      let context: ComponentContext;

      beforeEach(() => {
        element = { name: 'HTML element' } as any;
        context = { name: 'component context' } as any;
        (element as any)[componentContextSymbol] = context;
      });

      it('extracts component context from custom element', () => {
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('fails when there is no context defined', () => {
        delete (element as any)[componentContextSymbol];

        expect(() => ComponentContext.of(element)).toThrowError(TypeError);
      });
    });
  });
});
