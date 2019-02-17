import { ContextRegistry, ContextValues } from 'context-values';
import { ComponentContext, componentContextSymbol } from '../component';
import { ElementAdapter } from './element-adapter';
import Mock = jest.Mock;

describe('kit/element-adapter', () => {
  describe('ElementAdapter', () => {

    let registry: ContextRegistry;
    let context: ContextValues;
    let element: any;

    beforeEach(() => {
      registry = new ContextRegistry();
      context = registry.newValues();
      element = { name: 'element' };
    });

    it('always returns a value', () => {
      expect(context.get(ElementAdapter)).toBeInstanceOf(Function);
    });
    it('respects fallback value', () => {

      const fallback = jest.fn();

      expect(context.get(ElementAdapter, { or: fallback })).toBe(fallback);
    });

    describe('default adapter', () => {

      let adapter: ElementAdapter;

      beforeEach(() => {
        adapter = context.get(ElementAdapter);
      });

      it('returns `undefined` for raw elements', () => {
        expect(adapter(element)).toBeUndefined();
      });
      it('does not adapt component element', () => {

        const componentContextSpy: ComponentContext = { name: 'component context' } as any;

        element[componentContextSymbol] = componentContextSpy;

        expect(adapter(element)).toBe(componentContextSpy);
      });
    });

    describe('constructed adapter', () => {

      let adapter1: Mock;
      let adapter2: Mock;

      beforeEach(() => {
        adapter1 = jest.fn();
        adapter2 = jest.fn();
        registry.provide({ a: ElementAdapter, is: adapter1 });
        registry.provide({ a: ElementAdapter, is: adapter2 });
      });

      let adapter: ElementAdapter;

      beforeEach(() => {
        adapter = context.get(ElementAdapter);
      });

      it('combines adapters', () => {
        adapter(element);

        expect(adapter1).toHaveBeenCalledWith(element);
        expect(adapter2).toHaveBeenCalledWith(element);
      });
      it('does not adapt component element', () => {

        const componentContextSpy: ComponentContext = { name: 'component context' } as any;

        element[componentContextSymbol] = componentContextSpy;

        expect(adapter(element)).toBe(componentContextSpy);
        expect(adapter1).not.toHaveBeenCalled();
        expect(adapter2).not.toHaveBeenCalled();
      });
      it('returns the first adapted context', () => {

        const componentContextSpy: ComponentContext = { name: 'component context' } as any;

        adapter1.mockImplementation(() => componentContextSpy);

        expect(adapter(element)).toBe(componentContextSpy);
        expect(adapter1).toHaveBeenCalledWith(element);
        expect(adapter2).not.toHaveBeenCalled();
      });
    });
  });
});
