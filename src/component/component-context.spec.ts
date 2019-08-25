import { ComponentContext, ComponentContext__symbol } from './component-context';

describe('component', () => {
  describe('ComponentContext', () => {
    describe('of', () => {

      let element: HTMLDivElement;
      let context: ComponentContext;

      beforeEach(() => {
        element = { name: 'HTML element' } as any;
        context = { name: 'component context' } as any;
        (element as any)[ComponentContext__symbol] = context;
      });

      it('extracts component context from custom element', () => {
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('fails when there is no context defined', () => {
        delete (element as any)[ComponentContext__symbol];

        expect(() => ComponentContext.of(element)).toThrowError(TypeError);
      });
    });
  });
});
