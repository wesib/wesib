import { ContextRegistry, ContextSupply, ContextValues } from '@proc7ts/context-values';
import { Supply, valueProvider } from '@proc7ts/primitives';
import { ComponentContext, ComponentContext__symbol } from '../../component';
import { ElementAdapter } from './element-adapter';
import Mock = jest.Mock;

describe('boot', () => {
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
    it('returns a value when fallback is `null`', () => {
      expect(context.get(ElementAdapter, { or: null })).toBeInstanceOf(Function);
    });
    it('throws when context is destroyed', () => {

      const contextSupply = new Supply();

      registry.provide({ a: ContextSupply, is: contextSupply });

      const adapter = context.get(ElementAdapter);
      const reason = new Error('test');

      contextSupply.off(reason);
      expect(() => adapter(element)).toThrow(reason);
    });
    it('respects fallback value', () => {

      const componentContext: ComponentContext = { name: 'component context' } as any;
      const fallback = jest.fn((_element: any) => componentContext);
      const adapter = context.get(ElementAdapter, { or: fallback });

      expect(adapter(element)).toBe(componentContext);
      expect(fallback).toHaveBeenCalledWith(element);
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

        const componentContext: ComponentContext = { name: 'component context' } as any;

        element[ComponentContext__symbol] = valueProvider(componentContext);

        expect(adapter(element)).toBe(componentContext);
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

        const componentContext: ComponentContext = { name: 'component context' } as any;

        element[ComponentContext__symbol] = valueProvider(componentContext);

        expect(adapter(element)).toBe(componentContext);
        expect(adapter1).not.toHaveBeenCalled();
        expect(adapter2).not.toHaveBeenCalled();
      });
      it('returns the first adapted context', () => {

        const componentContext: ComponentContext = { name: 'component context' } as any;

        adapter1.mockImplementation(() => componentContext);

        expect(adapter(element)).toBe(componentContext);
        expect(adapter1).toHaveBeenCalledWith(element);
        expect(adapter2).not.toHaveBeenCalled();
      });
    });
  });
});
