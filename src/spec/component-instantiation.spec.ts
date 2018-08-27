import { Component, ComponentContext, ComponentType, ComponentValueKey } from '../component';
import { ElementMethod, ElementProperty, WebComponent } from '../decorators';
import { EventInterest } from '../events';
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
    let propertyValue: number;

    beforeEach(() => {
      context = undefined!;
      constructorSpy = jasmine.createSpy('constructor')
          .and.callFake((ctx: ComponentContext) => context = ctx);
      propertyValue = 0;

      @WebComponent({
        name: 'test-component',
        properties: {
          tagName: {
            value: 'MODIFIED-CUSTOM-COMPONENT',
          }
        },
      })
      class TestComponent {

        constructor(...args: any[]) {
          constructorSpy(...args);
        }

        @ElementProperty()
        get readonlyProperty() {
          return propertyValue;
        }

        get writableProperty() {
          return propertyValue;
        }

        @ElementProperty()
        set writableProperty(value: number) {
          propertyValue = value;
        }

        @ElementMethod({ name: 'elementMethod' })
        componentMethod(...args: string[]): string {
          return `${this.readonlyProperty}: ${args.join(', ')}`;
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
    it('passes context to component', () => {

      const expectedContext: Partial<ComponentContext> = {
        element,
      };

      expect(constructorSpy).toHaveBeenCalledWith(jasmine.objectContaining(expectedContext));
    });
    it('defines properties', () => {
      expect(element.tagName).toEqual('MODIFIED-CUSTOM-COMPONENT');
    });
    it('allows to access inherited element properties', () => {
      expect(context.elementSuper('tagName')).toEqual('TEST-COMPONENT');
    });
    it('reads element property', () => {
      expect((element as any).readonlyProperty).toBe(propertyValue);
      propertyValue = 1;
      expect((element as any).readonlyProperty).toBe(propertyValue);
    });
    it('writes element property', () => {
      expect((element as any).writableProperty).toBe(propertyValue);
      (element as any).writableProperty = 1;
      expect(propertyValue).toBe(1);
    });
    it('calls component method', () => {
      expect((element as any).elementMethod('1', '2', '3')).toBe(`${propertyValue}: 1, 2, 3`);
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

    beforeEach(() => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      await bootstrap.addElement(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    describe('onComponent listener', () => {
      it('is notified on component instantiation', async () => {

        const listenerSpy = jasmine.createSpy('onElement');

        bootstrap.context.onElement((_el, ctx) => {
          ctx.onComponent(listenerSpy);
        });

        await bootstrap.addElement(testComponent);

        expect(listenerSpy).toHaveBeenCalled();
      });
    });

    describe('onConnect listener', () => {
      it('is notified on when custom element connected', async () => {

        const listenerSpy = jasmine.createSpy('onConnect');

        bootstrap.context.onElement((_el, ctx) => {
          ctx.onComponent(listenerSpy);
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
