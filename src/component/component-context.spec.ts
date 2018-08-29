import { ComponentContext } from './component-context';

describe('component/component-context', () => {
  describe('ComponentContext', () => {
    describe('of', () => {

      let element: HTMLDivElement;
      let context: ComponentContext<object, HTMLDivElement>;

      beforeEach(() => {
        element = { name: 'HTML element' } as any;
        context = { name: 'component context' } as any;
        (element as any)[ComponentContext.symbol] = context;
      });

      it('extracts component context from HTML element', () => {
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('fails when there is no context defined', () => {
        delete (element as any)[ComponentContext.symbol];

        expect(() => ComponentContext.of(element)).toThrowError(TypeError);
      });
    });
  });
});