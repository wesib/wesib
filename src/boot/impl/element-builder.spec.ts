import { noop } from 'call-thru';
import { ContextKey, SingleContextKey } from 'context-values';
import { DomEventDispatcher, EventSupply } from 'fun-events';
import { Class } from '../../common';
import {
  ComponentContext,
  ComponentDef,
  ComponentDef__symbol,
  ComponentEvent,
  ComponentEventDispatcher,
  ComponentMount,
} from '../../component';
import { ComponentClass, ComponentFactory, DefinitionContext } from '../../component/definition';
import { MockElement } from '../../spec/test-element';
import { BootstrapContext } from '../bootstrap-context';
import { BootstrapContextRegistry } from './bootstrap-context-registry.impl';
import { ElementBuilder } from './element-builder.impl';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('boot', () => {
  describe('ElementBuilder', () => {

    let bsContextRegistry: BootstrapContextRegistry;
    let mockBootstrapContext: Mocked<BootstrapContext>;

    beforeEach(() => {
      bsContextRegistry = BootstrapContextRegistry.create();
      mockBootstrapContext = {
        get: bsContextRegistry.values.get,
      } as any;
      bsContextRegistry.provide({ a: BootstrapContext, is: mockBootstrapContext });
    });

    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      builder = mockBootstrapContext.get(ElementBuilder);
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

      let onDefinition: Mock;

      beforeEach(() => {
        onDefinition = jest.fn();
        builder.definitions.on(onDefinition);
      });

      it('is notified on component definition', () => {
        builder.buildElement(TestComponent);

        expect(onDefinition).toHaveBeenCalledWith(expect.objectContaining({ componentType: TestComponent }));
      });

      describe('element type', () => {
        it('is absent when listener notified', () => {
          onDefinition.mockImplementation((context: DefinitionContext) => {
            expect(() => context.elementType).toThrow(/not constructed yet/);
          });

          builder.buildElement(TestComponent);
        });
        it('is reported when ready', async () => {

          const promise = new Promise<DefinitionContext>(resolve => {
            onDefinition.mockImplementation((context: DefinitionContext) => context.whenReady(resolve));
          });

          builder.buildElement(TestComponent);

          const definitionContext = await promise;

          expect(typeof definitionContext.elementType).toBe('function');
        });
        it('is present when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext = onDefinition.mock.calls[0][0];

          expect(typeof context.elementType).toBe('function');
        });
        it('is reported immediately by callback when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext = onDefinition.mock.calls[0][0];

          let elementType: Class | undefined;

          context.whenReady(ctx => elementType = ctx.elementType);

          expect(elementType).toBe(context.elementType);
        });
        it('is reported for setup when element built', () => {

          const whenReady = jest.fn();

          builder.buildElement(ComponentDef.define(
              TestComponent,
              {
                setup(setup) {
                  expect(setup.componentType).toBe(TestComponent);
                  setup.whenReady(whenReady);
                  expect(whenReady).not.toHaveBeenCalled();
                },
              },
          ));

          expect(whenReady).toHaveBeenCalledWith(onDefinition.mock.calls[0][0]);
        });
      });
    });

    describe('definition context', () => {

      let definitionContext: DefinitionContext;

      beforeEach(() => {
        builder.definitions.on((ctx: DefinitionContext) => {
          definitionContext = ctx;
        });
      });

      let key: ContextKey<string>;

      beforeEach(() => {
        key = new SingleContextKey('definition-key');
        ComponentDef.define(
            TestComponent,
            {
              setup(setup) {
                setup.perDefinition({ a: key, is: 'definition value' });
              },
            },
        );
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
      let componentContext: ComponentContext;

      beforeEach(() => {
        value1 = 'some value';
        value2 = 'other value';
        builder.definitions.on(ctx => {
          if (ctx.componentType === TestComponent) {
            ctx.perComponent({ a: key1, is: value1 });
          }
        });
      });

      let mockDispatcher: Mocked<ComponentEventDispatcher>;

      beforeEach(() => {
        mockDispatcher = {
          dispatch: jest.fn(),
          on: jest.fn(
              (context: ComponentContext, type: string) => new DomEventDispatcher(context.element).on<any>(type),
          ),
        };
        bsContextRegistry.provide({ a: ComponentEventDispatcher, is: mockDispatcher });
      });

      let addEventListenerSpy: Mock;
      let removeEventListenerSpy: Mock;

      beforeEach(() => {
        addEventListenerSpy = jest.fn();
        removeEventListenerSpy = jest.fn();
        ComponentDef.define(
            TestComponent,
            {
              extend: {
                type: class {

                  addEventListener = addEventListenerSpy;
                  removeEventListener = removeEventListenerSpy;

                },
              },
              setup(setup) {
                setup.perComponent({ a: key2, is: value2 });
              },
            },
        );
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
      it('dispatches component event when first connected', () => {
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();

        componentContext.element.connectedCallback();

        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(componentContext, expect.any(ComponentEvent));
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(componentContext, expect.objectContaining({
          type: 'wesib:component',
          cancelable: false,
          bubbles: true,
        }));
      });
      it('allows to listen for component events', () => {

        const listener = jest.fn().mockName('event listener');
        const supply = componentContext.on('test-event')(listener);

        expect(addEventListenerSpy).toHaveBeenCalledWith('test-event', expect.any(Function), undefined);

        const actualListener = addEventListenerSpy.mock.calls[0][1];

        supply.off();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('test-event', actualListener);
      });
      it('can not access values of another component type', () => {

        class AnotherComponent {

          static [ComponentDef__symbol]: ComponentDef = {
            name: 'another-component',
            extend: {
              type: MockElement,
            },
          };

        }

        const otherElement = new (builder.buildElement(AnotherComponent).elementType);
        const otherContext = ComponentContext.of(otherElement);

        expect(otherContext.get(key1, { or: null })).toBeNull();
        expect(otherContext.get(key2, { or: null })).toBeNull();
      });

      describe('destroy', () => {
        it('notifies destruction callbacks', () => {

          const destroyed = jest.fn();
          const reason = 'Destruction reason';

          componentContext.whenDestroyed(destroyed);
          componentContext.destroy(reason);

          expect(destroyed).toHaveBeenCalledWith(reason);
        });
        it('notifies destruction callbacks only once', () => {

          const destroyed = jest.fn();
          const reason1 = 'Destruction reason 1';
          const reason2 = 'Destruction reason 2';

          componentContext.whenDestroyed(destroyed);
          componentContext.destroy(reason1);
          componentContext.destroy(reason2);

          expect(destroyed).toHaveBeenCalledWith(reason1);
          expect(destroyed).not.toHaveBeenCalledWith(reason2);
          expect(destroyed).toHaveBeenCalledTimes(1);
        });
        it('notifies destruction callbacks immediately when destroyed already', () => {

          const destroyed = jest.fn();
          const reason = 'Destruction reason';

          componentContext.destroy(reason);
          componentContext.whenDestroyed(destroyed);

          expect(destroyed).toHaveBeenCalledWith(reason);
        });
        it('removes element', () => {

          const element = componentContext.element;
          const mockRemove = jest.fn();

          element.parentElement = {
            removeChild: mockRemove,
          };

          componentContext.destroy();

          expect(mockRemove).toHaveBeenCalledWith(element);
        });
        it('cuts off connection events supply', () => {

          const done = jest.fn();
          const reason = 'Destruction reason';

          componentContext.whenOn(noop).whenOff(done);
          componentContext.destroy(reason);

          expect(done).toHaveBeenCalledWith(reason);
        });
        it('cuts off disconnection events supply', () => {

          const done = jest.fn();
          const reason = 'Destruction reason';

          componentContext.whenOff(noop).whenOff(done);
          componentContext.destroy(reason);

          expect(done).toHaveBeenCalledWith(reason);
        });
      });
    });

    describe('mounted element', () => {

      let mockDispatcher: Mocked<ComponentEventDispatcher>;

      beforeEach(() => {
        mockDispatcher = {
          dispatch: jest.fn(),
          on: jest.fn(
              (ctx: ComponentContext, type: string) => new DomEventDispatcher(ctx.element).on<any>(type),
          ),
        };
        bsContextRegistry.provide({ a: ComponentEventDispatcher, is: mockDispatcher });
      });

      let factory: ComponentFactory;
      let element: any;
      let mount: ComponentMount;
      let context: ComponentContext;

      beforeEach(() => {
        factory = builder.buildElement(TestComponent);

        class Element {

          get property(): string {
            return 'overridden';
          }

        }

        element = new Element();
      });

      function doMount(): void {
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
      it('dispatches component event when first connected', () => {
        doMount();
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
        mount.connected = true;
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(context, expect.any(ComponentEvent));
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith(context, expect.objectContaining({
          type: 'wesib:component',
          cancelable: false,
          bubbles: true,
        }));
        mount.connected = false;
        mount.connected = true;
        expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
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

          context.whenOn(connected);
          mount.connected = true;

          expect(connected).toHaveBeenCalledWith(expect.any(EventSupply));
        });
        it('reports connected element', () => {
          doMount();

          mount.connected = true;

          const connected = jest.fn();

          context.whenOn(connected);
          expect(connected).toHaveBeenCalledWith(expect.any(EventSupply));
        });
        it('reports disconnected element', () => {
          doMount();

          const disconnected = jest.fn();

          context.whenOff(disconnected);

          expect(disconnected).toHaveBeenCalledWith();
        });
        it('cuts off connection supply when element disconnected', () => {
          doMount();

          const disconnected = jest.fn();

          context.whenOn(supply => supply.whenOff(disconnected));
          expect(disconnected).not.toHaveBeenCalled();

          mount.connected = true;
          expect(disconnected).not.toHaveBeenCalled();

          mount.connected = false;
          expect(disconnected).toHaveBeenCalledWith(undefined);
        });
        it('does not disconnect not connected element', () => {
          doMount();

          const disconnected = jest.fn();

          context.whenOff(disconnected);
          disconnected.mockClear();
          mount.connected = false;

          expect(disconnected).not.toHaveBeenCalled();
        });
        describe('destroy', () => {
          it('disconnects element', () => {
            doMount();

            mount.connected = true;

            const disconnected = jest.fn();

            context.whenOff(disconnected);
            context.destroy();

            expect(disconnected).toHaveBeenCalledWith();
          });
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

        context.whenOff(disconnected);
        mount.connected = false;

        expect(disconnected).toHaveBeenCalledWith();
      });
    });
  });
});
