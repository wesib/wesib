import { EventInterest } from '../common';
import { Component, ComponentContext, ComponentType, ComponentValueKey } from '../component';
import { WebComponent } from '../decorators';
import { TestBootstrap } from './test-bootstrap';
import Spy = jasmine.Spy;

describe('component instantiation', () => {
  describe('Life cycle', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let constructorSpy: Spy;
    let context: ComponentContext;
    let elementListenerSpy: Spy;
    let elementListenerInterest: EventInterest;
    let element: HTMLElement;

    beforeEach(() => {
      context = undefined!;
      constructorSpy = jasmine.createSpy('constructor')
          .and.callFake((ctx: ComponentContext) => context = ctx);

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        constructor(...args: any[]) {
          constructorSpy(...args);
        }

      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      elementListenerSpy = jasmine.createSpy('elementListener');
      elementListenerInterest = bootstrap.context.onElement(elementListenerSpy);
      element = await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    it('instantiates custom element', async () => {
      expect(element).toBeDefined();
    });
    it('assigns component reference to custom element', () => {
      expect(Component.of(element)).toEqual(jasmine.any(testComponent));
    });
    it('assigns component context reference to custom element', () => {
      expect(ComponentContext.of(element)).toBe(context);
    });
    it('assigns component context reference to component', () => {
      expect(ComponentContext.of(Component.of(element) as object)).toBe(context);
    });
    it('passes context to component', () => {

      const expectedContext: Partial<ComponentContext> = {
        element,
      };

      expect(constructorSpy).toHaveBeenCalledWith(jasmine.objectContaining(expectedContext));
    });
    it('allows to access inherited element properties', () => {
      expect(context.elementSuper('tagName')).toEqual('TEST-COMPONENT');
    });

    describe('onElement listener', () => {
      it('is notified on new element instantiation', () => {
        expect(elementListenerSpy).toHaveBeenCalledWith(element, context);
      });
    });
  });

  describe('context callbacks', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let constructorSpy: Spy;

    beforeEach(() => {
      constructorSpy = jasmine.createSpy('constructor');

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        constructor() {
          constructorSpy();
        }
      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    describe('component', () => {
      it('is resolved on component instantiation', async () => {

        const promise = new Promise((resolve, reject) => {
          bootstrap.context.onElement((_el, ctx) => {
            ctx.component.then(resolve, reject);
          });
        });

        await bootstrap.addElement(testComponent);

        expect(await promise).toEqual(jasmine.any(testComponent));
      });
      it('is rejected on component construction failure', async () => {

        const error = new Error('Not constructed');

        constructorSpy.and.callFake(() => { throw error; });

        const promise = new Promise((resolve, reject) => {
          bootstrap.context.onElement((_el, ctx) => {
            ctx.component.then(resolve, reject);
          });
        });

        bootstrap.addElement(testComponent);
        expect(await promise.catch(err => err)).toBe(error);
      });
    });

    describe('onConnect listener', () => {
      it('is notified on when custom element connected', async () => {

        const listenerSpy = jasmine.createSpy('onConnect');

        bootstrap.context.onElement((_el, ctx) => {
          ctx.onConnect(listenerSpy);
        });

        await bootstrap.addElement(testComponent);

        expect(listenerSpy).toHaveBeenCalled();
      });
    });

    describe('onDisconnect listener', () => {
      it('is notified on when custom element disconnected', async () => {

        const listenerSpy = jasmine.createSpy('onDisconnect');

        bootstrap.context.onElement((_el, ctx) => {
          ctx.onDisconnect(listenerSpy);
        });

        const el = await bootstrap.addElement(testComponent);

        expect(listenerSpy).not.toHaveBeenCalled();

        el.remove();

        expect(listenerSpy).toHaveBeenCalled();
      });
    });
  });

  describe('component value', () => {

    const valueKey = new ComponentValueKey<string>('provided-value-key');
    let bootstrap: TestBootstrap;
    let context: ComponentContext;
    let testComponent: ComponentType;
    let providerSpy: Spy;

    beforeEach(() => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        constructor(ctx: ComponentContext) {
          context = ctx;
        }
      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    beforeEach(() => {
      providerSpy = jasmine.createSpy('valueProvider');
    });

    it('is available', () => {

      const value = 'test value';

      bootstrap.context.provide(valueKey, providerSpy);
      providerSpy.and.returnValue(value);

      expect(context.get(valueKey)).toEqual(value);
    });
    it('throws when no value provided', () => {
      expect(() => context.get(valueKey)).toThrow(jasmine.any(Error));
    });
    it('provides the default value from the key', () => {

      const defaultValue = 'default value';
      const valueKeyWithDefaults = new ComponentValueKey<string>('value-key-with-defaults', defaultValue);

      expect(context.get(valueKeyWithDefaults)).toBe(defaultValue);
    });
    it('is default value when provided', () => {
      const defaultValue = 'default value';
      expect(context.get(valueKey, defaultValue)).toBe(defaultValue);
    });
    it('is null when default value is null', () => {
      expect(context.get(valueKey, null)).toBeNull();
    });
    it('is undefined when default value is undefined', () => {
      expect(context.get(valueKey, undefined)).toBeUndefined();
    });
    it('is cached', () => {

      const value = 'test value 1';

      bootstrap.context.provide(valueKey, providerSpy);
      providerSpy.and.returnValue(value);
      expect(context.get(valueKey)).toEqual(value);

      providerSpy.and.returnValue('test value 2');
      expect(context.get(valueKey)).toEqual(value);
    });
    it('is not cached when there is no value provided', () => {
      bootstrap.context.provide(valueKey, providerSpy);
      context.get(valueKey, 'default value');

      const value = 'test value 2';

      providerSpy.and.returnValue('test value 2');
      expect(context.get(valueKey)).toEqual(value);
    });
  });
});
