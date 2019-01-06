import { ContextKey, SingleContextKey } from 'context-values';
import { EventInterest } from 'fun-events';
import { Class } from '../../common';
import { ComponentClass, ComponentContext, ComponentDef, ComponentMount } from '../../component';
import { ComponentFactory, DefinitionContext, ElementBaseClass } from '../../component/definition';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionValueRegistry } from './definition-value-registry';
import { ElementBuilder } from './element-builder';
import Mock = jest.Mock;

describe('kit/definition/element-builder', () => {
  describe('ElementBuilder', () => {

    let definitionValueRegistry: DefinitionValueRegistry;
    let componentValueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      definitionValueRegistry = DefinitionValueRegistry.create();
      componentValueRegistry = ComponentValueRegistry.create();
      builder = ElementBuilder.create({ definitionValueRegistry, componentValueRegistry });
    });

    beforeEach(() => {
      TestComponent = class {
        static [ComponentDef.symbol]: ComponentDef = {
          name: 'test-component',
        };
      };
    });

    describe('buildElement', () => {
      it('builds component factory', () => {
        expect(builder.buildElement(TestComponent)).toBeInstanceOf(ComponentFactory);
      });
      it('builds custom element', () => {
        expect(builder.buildElement(TestComponent).elementType.prototype).toBeInstanceOf(HTMLElement);
      });
      it('extends HTML element', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });

        expect(builder.buildElement(TestComponent).elementType.prototype).toBeInstanceOf(HTMLInputElement);
      });
    });

    describe('component factory', () => {

      let factory: ComponentFactory;

      beforeEach(() => {
        factory = builder.buildElement(TestComponent);
      });

      it('refers the component type', () => {
        expect(factory.componentType).toBe(TestComponent);
      });
    });

    describe('component definition listener', () => {

      let listenerSpy: Mock;
      let interest: EventInterest;

      beforeEach(() => {
        listenerSpy = jest.fn();
        interest = builder.definitions.on(listenerSpy);
      });

      it('is notified on component definition', () => {
        builder.buildElement(TestComponent);

        expect(listenerSpy).toHaveBeenCalledWith(expect.objectContaining({ componentType: TestComponent }));
      });

      describe('element type', () => {
        it('is absent when listener notified', () => {
          listenerSpy.mockImplementation((context: DefinitionContext<any>) => {
            expect(() => context.elementType).toThrowError(/not constructed yet/);
          });

          builder.buildElement(TestComponent);
        });
        it('is reported when ready', async () => {

          const promise = new Promise<Class>(resolve => {
            listenerSpy.mockImplementation((context: DefinitionContext<any>) => context.whenReady(resolve));
          });

          builder.buildElement(TestComponent);

          expect(typeof await promise).toBe('function');
        });
        it('is present when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext<any> = listenerSpy.mock.calls[0][0];

          expect(typeof context.elementType).toBe('function');
        });
        it('is reported immediately by callback when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext<any> = listenerSpy.mock.calls[0][0];

          let elementType: Class | undefined;

          context.whenReady(type => elementType = type);

          expect(elementType).toBe(context.elementType);
        });
      });
    });

    describe('definition context', () => {

      let definitionContext: DefinitionContext<any>;

      beforeEach(() => {
        builder.definitions.on((ctx: DefinitionContext<any>) => {
          definitionContext = ctx;
        });
      });

      let key: ContextKey<string>;

      beforeEach(() => {
        key = new SingleContextKey('definition-key');
        ComponentDef.define(TestComponent, { set: { a: key, is: 'definition value' } });
      });

      let factory: ComponentFactory;

      beforeEach(() => {
        factory = builder.buildElement(TestComponent);
      });

      it('contains itself', () => {
        expect(definitionContext.get(DefinitionContext)).toBe(definitionContext);
      });
      it('contains component factory', () => {
        expect(definitionContext.get(ComponentFactory)).toBe(factory);
      });
      it('contains definition context values', () => {
        expect(definitionContext.get(key)).toBe('definition value');
      });
    });

    describe('constructed element', () => {

      const key1 = new SingleContextKey<string>('test-key-1');
      let value1: string;
      const key2 = new SingleContextKey<string>('test-key-2');
      let value2: string;
      let definitionContext: DefinitionContext<any>;
      let componentContext: ComponentContext;

      beforeEach(() => {
        value1 = 'some value';
        value2 = 'other value';
        builder.definitions.on((ctx: DefinitionContext<any>) => {
          definitionContext = ctx;
          if (ctx.componentType === TestComponent) {
            ctx.forComponents({ a: key1, is: value1 });
          }
        });
      });
      beforeEach(() => {
        ComponentDef.define(
            TestComponent, {
              extend: {
                type: Object,
              },
              forComponents: { a: key2, is: value2, }
            });
      });

      beforeEach(() => {

        const element = new (builder.buildElement(TestComponent).elementType);

        componentContext = ComponentContext.of(element);
      });

      it('has access to definition context value', () => {
        expect(componentContext.get(key1)).toBe(value1);
      });
      it('has access to component context value', () => {
        expect(componentContext.get(key2)).toBe(value2);
      });
      it('is not mounted', () => {
        expect(componentContext.mount).toBeUndefined();
      });
      it('can not access values of another component type', () => {

        class AnotherComponent {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'another-component',
            extend: {
              type: Object,
            }
          };
        }

        const otherElement = new (builder.buildElement(AnotherComponent).elementType);
        const otherContext = ComponentContext.of(otherElement);

        expect(otherContext.get(key1, { or: null })).toBeNull();
        expect(otherContext.get(key2, { or: null })).toBeNull();
      });
    });

    describe('mounted element', () => {

      let factory: ComponentFactory;
      let element: any;
      let mount: ComponentMount;
      let context: ComponentContext;

      beforeEach(() => {
        factory = builder.buildElement(TestComponent);

        class Element {
          get property() {
            return 'overridden';
          }
        }

        element = new Element();
        mount = factory.mountTo(element);
        context = mount.context;
      });

      it('has context reference', () => {
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('has access ot overridden element properties', () => {
        expect(context.elementSuper('property')).toBe('overridden');
      });
      it('is mounted', () => {
        expect(context.mount).toBe(mount);
      });
      it('fails is already bound', () => {
         expect(() => factory.mountTo(element)).toThrow('already bound');
      });
      describe('component mount', () => {
        it('refers to element', () => {
          expect(mount.element).toBe(element);
        });
        it('refers to component', () => {
          expect(mount.component).toBe(context.component);
        });
        it('is not connected by default', () => {
          expect(mount.connected).toBe(false);
        });
        it('connects element', () => {

          const connected = jest.fn();

          context.onConnect(connected);
          mount.connected = true;

          expect(connected).toHaveBeenCalledWith();
          expect(connected.mock.instances[0]).toBe(context);
        });
        it('does not disconnect not connected element', () => {

          const disconnected = jest.fn();

          context.onDisconnect(disconnected);
          mount.connected = false;

          expect(disconnected).not.toHaveBeenCalled();
        });
      });
    });

    describe('connected element', () => {

      let factory: ComponentFactory;
      let element: any;
      let mount: ComponentMount;
      let context: ComponentContext;

      beforeEach(() => {
        factory = builder.buildElement(TestComponent);

        class Element {}

        element = new Element();
        mount = factory.connectTo(element);
        context = mount.context;
      });

      it('is connected by default', () => {
        expect(mount.connected).toBe(true);
      });
      it('disconnects element', () => {

        const disconnected = jest.fn();

        context.onDisconnect(disconnected);
        mount.connected = false;

        expect(disconnected).toHaveBeenCalledWith();
        expect(disconnected.mock.instances[0]).toBe(context);
      });
    });

    describe('component listener', () => {

      let componentContext: ComponentContext;
      let onComponentSpy: Mock;

      beforeEach(() => {
        onComponentSpy = jest.fn();
        ComponentDef.define(TestComponent, {
          define(context) {
            context.onComponent(onComponentSpy);
          }
        });
      });
      beforeEach(() => {
        definitionValueRegistry.provide({ a: ElementBaseClass, is: Object });
      });
      beforeEach(() => {

        const element = new (builder.buildElement(TestComponent).elementType);

        componentContext = ComponentContext.of(element);
      });

      it('is notified to component instantiation', () => {
        expect(onComponentSpy).toHaveBeenCalledWith(componentContext);
      });
    });
  });
});
