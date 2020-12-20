import { ContextKey, SingleContextKey } from '@proc7ts/context-values';
import { Class } from '@proc7ts/primitives';
import { ComponentContext, ComponentDef, ComponentDef__symbol, ComponentEvent, ComponentMount } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
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

        constructor(ctx: ComponentContext) {
          ctx.settle();
          // eslint-disable-next-line jest/no-standalone-expect
          expect(ctx.settled).toBe(false);
        }

      };
    });

    describe('buildElement', () => {
      it('builds component definition context', () => {
        expect(builder.buildElement(TestComponent)).toBeInstanceOf(DefinitionContext);
      });
      it('builds custom element', () => {

        const defContext = builder.buildElement(TestComponent);

        expect(defContext.elementType.prototype).toBeInstanceOf(HTMLElement);
        expect(defContext.elementDef).toEqual({
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

        const defContext = builder.buildElement(TestComponent);

        expect(defContext.elementType.prototype).toBeInstanceOf(HTMLInputElement);
        expect(defContext.elementDef).toEqual({
          name: 'test-component',
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });
      });
      it('provides different contexts for components of the same type', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: Object,
          },
        });

        const { elementType } = builder.buildElement(TestComponent);
        const element1 = new elementType();
        const element2 = new elementType();
        const ctx1 = ComponentContext.of(element1);
        const ctx2 = ComponentContext.of(element2);

        expect(ctx1).not.toBe(ctx2);
        expect(ctx1.element).toBe(element1);
        expect(ctx2.element).toBe(element2);
        expect(ctx1.get(ComponentContext)).toBe(ctx1);
        expect(ctx2.get(ComponentContext)).toBe(ctx2);
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

      let defContext: DefinitionContext;

      beforeEach(() => {
        defContext = builder.buildElement(TestComponent);
      });

      it('is returned by element builder', () => {
        expect(defContext).toBe(definitionContext);
      });
      it('refers the component type', () => {
        expect(defContext.componentType).toBe(TestComponent);
      });
      it('contains itself', () => {
        expect(definitionContext.get(DefinitionContext)).toBe(definitionContext);
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

      let connectedCallbackSpy: Mock;
      let disconnectedCallbackSpy: Mock;
      let addEventListenerSpy: Mock;
      let removeEventListenerSpy: Mock;
      let dispatchEventSpy: Mock<boolean, [Event]>;

      beforeEach(() => {
        connectedCallbackSpy = jest.fn();
        disconnectedCallbackSpy = jest.fn();
        addEventListenerSpy = jest.fn();
        removeEventListenerSpy = jest.fn();
        dispatchEventSpy = jest.fn();
        ComponentDef.define(
            TestComponent,
            {
              extend: {
                type: class {

                  addEventListener = addEventListenerSpy;
                  removeEventListener = removeEventListenerSpy;
                  dispatchEvent = dispatchEventSpy;

                  connectedCallback(): void {
                    connectedCallbackSpy();
                  }

                  disconnectedCallback(): void {
                    disconnectedCallbackSpy();
                  }

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

      describe('settled', () => {
        it('is `false` by default', () => {
          expect(componentContext.settled).toBe(false);
        });
      });

      describe('settle', () => {
        it('settles component', () => {

          const whenSettled = jest.fn();
          const supply = componentContext.whenSettled(whenSettled);

          expect(whenSettled).not.toHaveBeenCalled();

          componentContext.settle();
          expect(componentContext.settled).toBe(true);
          expect(whenSettled).toHaveBeenCalledWith(componentContext);
          expect(supply.isOff).toBe(true);
        });
        it('does nothing when connected already', () => {
          componentContext.element.connectedCallback();
          componentContext.settle();
          expect(componentContext.settled).toBe(true);
          expect(componentContext.connected).toBe(true);
        });
      });

      describe('connectedCallback', () => {
        it('makes component settled', () => {

          const whenSettled = jest.fn();
          const supply = componentContext.whenSettled(whenSettled);

          expect(whenSettled).not.toHaveBeenCalled();

          componentContext.element.connectedCallback();
          expect(componentContext.settled).toBe(true);
          expect(whenSettled).toHaveBeenCalledWith(componentContext);
          expect(supply.isOff).toBe(true);
        });
        it('makes component connected', () => {

          const whenConnected = jest.fn();
          const supply = componentContext.whenConnected(whenConnected);

          expect(whenConnected).not.toHaveBeenCalled();

          componentContext.element.connectedCallback();
          expect(componentContext.connected).toBe(true);
          expect(whenConnected).toHaveBeenCalledWith(componentContext);
          expect(supply.isOff).toBe(true);
        });
        it('calls `connectedCallback()` of original element', () => {
          componentContext.element.connectedCallback();
          expect(connectedCallbackSpy).toHaveBeenCalledWith();
        });
        it('dispatches component event', () => {
          expect(dispatchEventSpy).not.toHaveBeenCalled();

          componentContext.element.connectedCallback();

          expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(ComponentEvent));
          expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
            type: 'wesib:component',
            cancelable: false,
            bubbles: true,
          }));
        });
      });

      describe('disconnectedCallback', () => {
        it('calls `disconnectedCallback()` of original element when disconnected', () => {
          componentContext.element.disconnectedCallback();
          expect(disconnectedCallbackSpy).toHaveBeenCalledWith();
        });
      });

      describe('on', () => {
        it('listens for component events', () => {

          const listener = jest.fn().mockName('event listener');
          const supply = componentContext.on('test-event')(listener);

          expect(addEventListenerSpy).toHaveBeenCalledWith('test-event', expect.any(Function), undefined);

          const actualListener = addEventListenerSpy.mock.calls[0][1];

          supply.off();

          expect(removeEventListenerSpy).toHaveBeenCalledWith('test-event', actualListener);
        });
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
        it('is called by `disconnectedCallback()`', () => {

          const destroyed = jest.fn();

          componentContext.supply.whenOff(destroyed);
          componentContext.element.disconnectedCallback();

          expect(destroyed).toHaveBeenCalledWith(undefined);
        });
        it('notifies destruction callbacks', () => {

          const destroyed = jest.fn();
          const reason = 'Destruction reason';

          componentContext.supply.whenOff(destroyed);
          componentContext.destroy(reason);

          expect(destroyed).toHaveBeenCalledWith(reason);
        });
        it('removes element', () => {

          const element = componentContext.element;
          const mockRemove = jest.fn();

          element.parentNode = {
            removeChild: mockRemove,
          };

          componentContext.destroy();

          expect(mockRemove).toHaveBeenCalledWith(element);
        });
        it('cuts off connection events supply', () => {

          const whenOff = jest.fn();
          const whenConnected = jest.fn();
          const reason = 'Destruction reason';

          componentContext.destroy(reason);
          componentContext.whenConnected(whenConnected).whenOff(whenOff);

          expect(whenConnected).not.toHaveBeenCalled();
          expect(whenOff).toHaveBeenCalledWith(reason);
        });
        it('makes component unavailable', () => {

          const { element, component } = componentContext;

          componentContext.destroy();
          expect(() => componentContext.component).toThrow(TypeError);
          expect(element[ComponentDef__symbol]).toBeUndefined();
          expect(component[ComponentDef__symbol]).toBeUndefined();
        });
        it('makes component disconnected', () => {
          componentContext.element.connectedCallback();
          componentContext.destroy();
          expect(componentContext.connected).toBe(false);
          expect(componentContext.settled).toBe(false);
        });
      });
    });

    describe('mounted element', () => {

      let defContext: DefinitionContext;
      let element: any;
      let mount: ComponentMount;
      let context: ComponentContext;
      let dispatchEventSpy: Mock<void, [Event]>;

      beforeEach(() => {
        defContext = builder.buildElement(TestComponent);
        dispatchEventSpy = jest.fn();
        class Element {

          readonly dispatchEvent = dispatchEventSpy;

          get property(): string {
            return 'overridden';
          }

        }

        element = new Element();
      });

      function doMount(): void {
        mount = defContext.mountTo(element);
        context = mount.context;
      }

      it('has context reference', () => {
        doMount();
        expect(ComponentContext.of(element)).toBe(context);
      });
      it('is mounted', () => {
        doMount();
        expect(context.mount).toBe(mount);
      });
      it('fails is already bound', () => {
        doMount();
        expect(() => defContext.mountTo(element)).toThrow('already bound');
      });
      it('dispatches component event when connected', () => {
        doMount();
        expect(dispatchEventSpy).not.toHaveBeenCalled();
        mount.connect();
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(ComponentEvent));
        expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
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
        it('is settled initially when element is not in document', () => {

          element.ownerDocument = {
            contains: jest.fn(() => false),
          };

          doMount();

          expect(context.settled).toBe(true);
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

          context.whenConnected(connected);
          mount.connect();

          expect(connected).toHaveBeenCalledWith(context);
        });
        it('reports already connected element', () => {
          doMount();

          mount.connect();

          const connected = jest.fn();

          context.whenConnected(connected);
          expect(connected).toHaveBeenCalledWith(context);
        });
        it('does not report disconnected element', () => {
          doMount();

          const connected = jest.fn();

          context.whenConnected(connected);

          expect(connected).not.toHaveBeenCalled();
        });
        it('cuts off component supply when destroyed', () => {
          doMount();

          const disconnected = jest.fn();

          context.supply.whenOff(disconnected);
          expect(disconnected).not.toHaveBeenCalled();

          mount.connect();
          expect(disconnected).not.toHaveBeenCalled();

          const reason = 'test';

          mount.context.destroy(reason);
          expect(mount.connected).toBe(false);
          expect(disconnected).toHaveBeenCalledWith(reason);
        });
        it('does not destroy not connected element', () => {
          doMount();

          const disconnected = jest.fn();

          context.supply.whenOff(disconnected);
          mount.checkConnected();

          expect(disconnected).not.toHaveBeenCalled();
        });
      });
    });

    describe('connected element', () => {

      let defContext: DefinitionContext;
      let element: any;
      let mount: ComponentMount;
      let context: ComponentContext;

      beforeEach(() => {
        defContext = builder.buildElement(TestComponent);

        element = new MockElement();
        mount = defContext.connectTo(element);
        context = mount.context;
      });

      it('is connected by default', () => {
        expect(mount.connected).toBe(true);
      });
      it('disconnects element', () => {

        const disconnected = jest.fn();

        context.supply.whenOff(disconnected);

        const reason = 'test';

        mount.context.destroy(reason);
        expect(mount.connected).toBe(false);
        expect(disconnected).toHaveBeenCalledWith(reason);
      });
    });
  });
});
