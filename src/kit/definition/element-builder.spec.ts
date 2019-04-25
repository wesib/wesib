import { ContextKey, SingleContextKey } from 'context-values';
import { DomEventDispatcher, EventInterest } from 'fun-events';
import { Class } from '../../common';
import {
  ComponentClass,
  ComponentContext,
  ComponentDef,
  ComponentDef__symbol,
  ComponentEvent,
  ComponentEventDispatcher,
  ComponentMount,
} from '../../component';
import { ComponentFactory, DefinitionContext, ElementDef } from '../../component/definition';
import { ObjectMock } from '../../spec/mocks';
import { MockElement } from '../../spec/test-element';
import { BootstrapContext } from '../bootstrap-context';
import { BootstrapValueRegistry } from '../bootstrap/bootstrap-value-registry';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionValueRegistry } from './definition-value-registry';
import { ElementBuilder } from './element-builder';
import Mock = jest.Mock;

describe('kit/definition/element-builder', () => {
  describe('ElementBuilder', () => {

    let bootstrapValueRegistry: BootstrapValueRegistry;
    let bootstrapContextSpy: ObjectMock<BootstrapContext>;

    beforeEach(() => {
      bootstrapValueRegistry = BootstrapValueRegistry.create();
      bootstrapContextSpy = {
        get: bootstrapValueRegistry.values.get,
      } as any;
      bootstrapValueRegistry.provide({ a: BootstrapContext, is: bootstrapContextSpy });
    });

    let definitionValueRegistry: DefinitionValueRegistry;
    let componentValueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      definitionValueRegistry = DefinitionValueRegistry.create(bootstrapValueRegistry.values);
      componentValueRegistry = ComponentValueRegistry.create();
      builder = ElementBuilder.create({ definitionValueRegistry, componentValueRegistry });
    });

    beforeEach(() => {
      TestComponent = class {
        static [ComponentDef__symbol]: ComponentDef = {
          name: 'test-component',
        };
      };
    });

    describe('buildElement', () => {
      it('builds component factory', () => {
        expect(builder.buildElement(TestComponent)).toBeInstanceOf(ComponentFactory);
      });
      it('builds custom element', () => {

        const factory = builder.buildElement(TestComponent);

        expect(factory.elementType.prototype).toBeInstanceOf(HTMLElement);
        expect(factory.elementDef).toEqual({
          name: 'test-component',
          extend: {
            type: HTMLElement,
          },
        });
      });
      it('extends HTML element', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });

        const factory = builder.buildElement(TestComponent);

        expect(factory.elementType.prototype).toBeInstanceOf(HTMLInputElement);
        expect(factory.elementDef).toEqual({
          name: 'test-component',
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });
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
            ctx.perComponent({ a: key1, is: value1 });
          }
        });
      });

      let mockDispatcher: ObjectMock<ComponentEventDispatcher>;

      beforeEach(() => {
        mockDispatcher = {
          dispatch: jest.fn(),
          on: jest.fn((context: ComponentContext<any>, type: string) =>
              new DomEventDispatcher(context.element).on<any>(type)),
        };
        bootstrapValueRegistry.provide({ a: ComponentEventDispatcher, is: mockDispatcher });
      });

      let addEventListenerSpy: Mock;
      let removeEventListenerSpy: Mock;

      beforeEach(() => {
        addEventListenerSpy = jest.fn();
        removeEventListenerSpy = jest.fn();
        ComponentDef.define(
            TestComponent, {
              extend: {
                type: class {
                  addEventListener = addEventListenerSpy;
                  removeEventListener = removeEventListenerSpy;
                },
              },
              perComponent: { a: key2, is: value2, }
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
      it('dispatches component event', () => {
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(componentContext, expect.any(ComponentEvent));
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(componentContext, expect.objectContaining({
          type: 'wesib:component',
          cancelable: false,
          bubbles: true,
        }));
      });
      it('allows to listen for component events', () => {

        const listener = jest.fn().mockName('event listener');
        const interest = componentContext.on('test-event')(listener);

        expect(addEventListenerSpy).toHaveBeenCalledWith('test-event', expect.any(Function), undefined);

        const actualListener = addEventListenerSpy.mock.calls[0][1];

        interest.off();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('test-event', actualListener);
      });
      it('can not access values of another component type', () => {

        class AnotherComponent {
          static [ComponentDef__symbol]: ComponentDef = {
            name: 'another-component',
            extend: {
              type: MockElement,
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

      let mockDispatcher: ObjectMock<ComponentEventDispatcher>;

      beforeEach(() => {
        mockDispatcher = {
          dispatch: jest.fn(),
          on: jest.fn((ctx: ComponentContext<any>, type: string) =>
              new DomEventDispatcher(ctx.element).on<any>(type)),
        };
        bootstrapValueRegistry.provide({ a: ComponentEventDispatcher, is: mockDispatcher });
      });

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
      });

      function doMount() {
        mount = factory.mountTo(element);
        context = mount.context;
      }

      it('has context reference', () => {
        doMount();
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('has access ot overridden element properties', () => {
        doMount();
        expect(context.elementSuper('property')).toBe('overridden');
      });
      it('is mounted', () => {
        doMount();
        expect(context.mount).toBe(mount);
      });
      it('fails is already bound', () => {
        doMount();
        expect(() => factory.mountTo(element)).toThrow('already bound');
      });
      it('dispatches component event', () => {
        doMount();
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(context, expect.any(ComponentEvent));
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(context, expect.objectContaining({
          type: 'wesib:component',
          cancelable: false,
          bubbles: true,
        }));
      });
      describe('component mount', () => {
        it('refers to element', () => {
          doMount();
          expect(mount.element).toBe(element);
        });
        it('refers to component', () => {
          doMount();
          expect(mount.component).toBe(context.component);
        });
        it('is not connected by default', () => {
          doMount();
          expect(mount.connected).toBe(false);
        });
        it('is connected initially when element is in document', () => {

          element.ownerDocument = {
            contains: jest.fn(() => true),
          };

          doMount();

          expect(mount.connected).toBe(true);
        });
        it('is not connected initially when element is not in document', () => {

          element.ownerDocument = {
            contains: jest.fn(() => false),
          };

          doMount();

          expect(mount.connected).toBe(false);
        });
        it('connects element', () => {
          doMount();

          const connected = jest.fn();

          context.onConnect(connected);
          mount.connected = true;

          expect(connected).toHaveBeenCalledWith(context);
        });
        it('does not disconnect not connected element', () => {
          doMount();

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

        element = new MockElement();
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

        expect(disconnected).toHaveBeenCalledWith(context);
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
        definitionValueRegistry.provide({ a: ElementDef, is: { extend: { type: MockElement } } });
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
