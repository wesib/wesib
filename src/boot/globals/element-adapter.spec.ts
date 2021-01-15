import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { ContextRegistry, ContextSupply, ContextValues } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/primitives';
import { ComponentContext, ComponentSlot } from '../../component';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';
import { ComponentBinder, ElementAdapter } from './element-adapter';

describe('boot', () => {
  describe('ElementAdapter', () => {

    let registry: ContextRegistry;
    let context: ContextValues;
    let element: Element;

    beforeEach(() => {
      registry = new ContextRegistry();
      registry.provide({ a: DefaultNamespaceAliaser, by: newNamespaceAliaser });
      context = registry.newValues();
      element = document.createElement('test-element');
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
      it('returns `undefined` if no binders match', () => {

        const componentContext: ComponentContext = { name: 'component context' } as any;

        registry.provide({
          a: ElementAdapter,
          is: {
            to: 'wrong-element',
            bind(element) {
              ComponentSlot.of(element).bind(componentContext);
            },
          },
        });

        expect(adapter(element)).toBeUndefined();
      });
      it('does not adapt an element with bound component', () => {

        const componentContext: ComponentContext = { name: 'component context' } as any;

        ComponentSlot.of(element).bind(componentContext);
        expect(adapter(element)).toBe(componentContext);
      });
    });

    describe('constructed adapter', () => {

      let binder1: jest.Mocked<ComponentBinder>;
      let binder2: jest.Mocked<ComponentBinder>;

      beforeEach(() => {
        binder1 = { to: 'test-element', bind: jest.fn() };
        binder2 = { to: 'test-element', bind: jest.fn() };
        registry.provide({ a: ElementAdapter, is: binder1 });
        registry.provide({ a: ElementAdapter, is: binder2 });
      });

      let adapter: ElementAdapter;

      beforeEach(() => {
        adapter = context.get(ElementAdapter);
      });

      it('combines binders', () => {
        adapter(element);

        expect(binder1.bind).toHaveBeenCalledWith(element);
        expect(binder2.bind).toHaveBeenCalledWith(element);
      });
      it('does not adapt an element with bound component', () => {

        const componentContext: ComponentContext = { name: 'component context' } as any;

        ComponentSlot.of(element).bind(componentContext);

        expect(adapter(element)).toBe(componentContext);
        expect(binder1.bind).not.toHaveBeenCalled();
        expect(binder2.bind).not.toHaveBeenCalled();
      });
      it('returns the first context bound', () => {

        const componentContext: ComponentContext = { name: 'component context' } as any;

        binder1.bind.mockImplementation(element => ComponentSlot.of(element).bind(componentContext));

        expect(adapter(element)).toBe(componentContext);
        expect(binder1.bind).toHaveBeenCalledWith(element);
        expect(binder2.bind).not.toHaveBeenCalled();
      });
      it('applies binder to matching element only', () => {

        const binder3: jest.Mocked<ComponentBinder> = {
          to: 'other-element',
          bind: jest.fn(),
        };

        registry.provide({ a: ElementAdapter, is: binder3 });
        expect(adapter(element)).toBeUndefined();
        expect(binder1.bind).toHaveBeenCalledWith(element);
        expect(binder2.bind).toHaveBeenCalledWith(element);
        expect(binder3.bind).not.toHaveBeenCalled();
      });
    });
  });
});
