import { drekAppender, drekContextOf, DrekFragment } from '@frontmeans/drek';
import { newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxBuildAsset, cxConstAsset } from '@proc7ts/context-builder';
import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { Class, noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Mock } from 'jest-mock';
import { BootstrapContext } from '../boot';
import { ComponentContext, ComponentDef, ComponentDef__symbol, ComponentSlot } from '../component';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { DefaultNamespaceAliaser } from '../globals';
import { MockElement } from '../testing';
import { BootstrapContextBuilder } from './bootstrap-context-builder';
import { ElementBuilder } from './element-builder';

describe('boot', () => {
  describe('ElementBuilder', () => {

    let bsBuilder: BootstrapContextBuilder;
    let bsContext: BootstrapContext;

    beforeEach(() => {
      bsBuilder = new BootstrapContextBuilder(get => ({ get } as BootstrapContext));
      bsContext = bsBuilder.context;
      bsBuilder.provide(cxBuildAsset(DefaultNamespaceAliaser, _target => newNamespaceAliaser()));
    });

    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      builder = bsContext.get(ElementBuilder);
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

    afterEach(() => {
      Supply.onUnexpectedAbort();
    });

    describe('buildElement', () => {
      it('builds component definition context', () => {
        expect(builder.buildElement(TestComponent)).toBeDefined();
      });
      it('builds custom element', () => {

        const defContext = builder.buildElement(TestComponent);

        expect(defContext.elementType.prototype).toBeInstanceOf(HTMLElement);
        expect(defContext.elementDef).toEqual({
          name: 'test-component',
          tagName: 'test-component',
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
          tagName: 'test-component',
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
            type: MockElement,
          },
        });

        const { elementType } = builder.buildElement(TestComponent);
        const element1 = new elementType();
        const element2 = new elementType();
        const ctx1 = ComponentSlot.of(element1).context!;
        const ctx2 = ComponentSlot.of(element2).context!;

        expect(ctx1).not.toBe(ctx2);
        expect(ctx1.element).toBe(element1);
        expect(ctx2.element).toBe(element2);
        expect(ctx1.get(ComponentContext)).toBe(ctx1);
        expect(ctx2.get(ComponentContext)).toBe(ctx2);
      });
    });

    describe('component definition listener', () => {

      let onDefinition: Mock<void, [DefinitionContext]>;

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
            onDefinition.mockImplementation((defContext: DefinitionContext) => defContext.whenReady(resolve));
          });

          builder.buildElement(TestComponent);

          const definitionContext = await promise;

          expect(typeof definitionContext.elementType).toBe('function');
        });
        it('is present when element built', () => {
          builder.buildElement(TestComponent);

          const defContext: DefinitionContext = onDefinition.mock.calls[0][0];

          expect(typeof defContext.elementType).toBe('function');
        });
        it('is reported immediately by callback when element built', () => {
          builder.buildElement(TestComponent);

          const defContext: DefinitionContext = onDefinition.mock.calls[0][0];

          let elementType: Class | undefined;

          defContext.whenReady(ctx => elementType = ctx.elementType);

          expect(elementType).toBe(defContext.elementType);
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

      let entry: CxEntry<string>;

      beforeEach(() => {
        entry = { perContext: cxSingle() };
        ComponentDef.define(
            TestComponent,
            {
              setup(setup) {
                setup.perDefinition(cxConstAsset(entry, 'definition value'));
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
        expect(definitionContext.get(entry)).toBe('definition value');
      });
    });

    describe('constructed element', () => {

      const entry1: CxEntry<string> = { perContext: cxSingle() };
      let value1: string;
      const entry2: CxEntry<string> = { perContext: cxSingle() };
      let value2: string;
      let context: ComponentContext;

      beforeEach(() => {
        value1 = 'some value';
        value2 = 'other value';
        builder.definitions.on(ctx => {
          if (ctx.componentType === TestComponent) {
            ctx.perComponent(cxConstAsset(entry1, value1));
          }
        });
      });

      let connectedCallback: Mock<void, []>;
      let disconnectedCallback: Mock<void, []>;

      beforeEach(() => {
        connectedCallback = jest.fn();
        disconnectedCallback = jest.fn();
        ComponentDef.define(
            TestComponent,
            {
              extend: {
                type: class extends MockElement {

                  connectedCallback(): void {
                    connectedCallback();
                  }

                  disconnectedCallback(): void {
                    disconnectedCallback();
                  }

                },
              },
              setup(setup) {
                setup.perComponent(cxConstAsset(entry2, value2));
              },
            },
        );
      });

      beforeEach(async () => {

        const element = new (builder.buildElement(TestComponent).elementType);

        context = await ComponentSlot.of(element).whenReady;
      });

      it('has access to definition context value', () => {
        expect(context.get(entry1)).toBe(value1);
      });
      it('has access to component context value', () => {
        expect(context.get(entry2)).toBe(value2);
      });
      it('is not mounted', () => {
        expect(context.mounted).toBe(false);
      });

      describe('settled', () => {
        it('is `false` by default', () => {
          expect(context.settled).toBe(false);
        });
      });

      describe('readiness', () => {
        it('is reported', () => {

          const onceReady = jest.fn();
          const whenReady = jest.fn();
          const statusReceiver = jest.fn();
          const onceSupply = context.onceReady(onceReady);
          const whenSupply = context.whenReady(whenReady);

          context.readStatus(statusReceiver);

          expect(context.ready).toBe(true);
          expect(onceReady).toHaveBeenCalledWith(context);
          expect(onceSupply.isOff).toBe(false);
          expect(whenReady).toHaveBeenCalledWith(context);
          expect(whenSupply.isOff).toBe(true);
          expect(statusReceiver).toHaveBeenLastCalledWith(expect.objectContaining({ ready: true, settled: false }));
          expect(statusReceiver).toHaveBeenCalledTimes(1);
        });
      });

      describe('settle', () => {
        it('settles component', () => {

          const onceSettled = jest.fn();
          const whenSettled = jest.fn();
          const statusReceiver = jest.fn();
          const onceSupply = context.onceSettled(onceSettled);
          const whenSupply = context.whenSettled(whenSettled);

          context.readStatus(statusReceiver);

          expect(context.settled).toBe(false);
          expect(onceSettled).not.toHaveBeenCalled();
          expect(whenSettled).not.toHaveBeenCalled();
          expect(statusReceiver).toHaveBeenLastCalledWith(expect.objectContaining({ ready: true, settled: false }));
          expect(statusReceiver).toHaveBeenCalledTimes(1);

          context.settle();

          expect(context.settled).toBe(true);
          expect(onceSettled).toHaveBeenCalledWith(context);
          expect(onceSupply.isOff).toBe(false);
          expect(whenSettled).toHaveBeenCalledWith(context);
          expect(whenSupply.isOff).toBe(true);
          expect(statusReceiver).toHaveBeenLastCalledWith(expect.objectContaining({ ready: true, settled: true }));
          expect(statusReceiver).toHaveBeenCalledTimes(2);
        });
        it('does nothing when connected already', () => {
          context.element.connectedCallback();
          context.settle();
          expect(context.settled).toBe(true);
          expect(context.connected).toBe(true);
        });
        it('reports readiness only once', () => {

          const onceReady = jest.fn();
          const whenReady = jest.fn();
          const onceSupply = context.onceReady(onceReady);
          const whenSupply = context.whenReady(whenReady);

          expect(context.ready).toBe(true);
          expect(onceReady).toHaveBeenCalledTimes(1);
          expect(onceSupply.isOff).toBe(false);
          expect(whenReady).toHaveBeenCalledTimes(1);
          expect(whenSupply.isOff).toBe(true);

          context.settle();
          expect(onceReady).toHaveBeenCalledTimes(1);
          expect(whenReady).toHaveBeenCalledTimes(1);
          expect(onceSupply.isOff).toBe(false);
        });
      });

      describe('connectedCallback', () => {
        it('makes component settled', () => {

          const whenSettled = jest.fn();
          const supply = context.whenSettled(whenSettled);

          expect(whenSettled).not.toHaveBeenCalled();

          context.element.connectedCallback();
          expect(context.settled).toBe(true);
          expect(whenSettled).toHaveBeenCalledWith(context);
          expect(supply.isOff).toBe(true);
        });
        it('makes component connected', () => {

          const onceConnected = jest.fn();
          const whenConnected = jest.fn();
          const statusReceiver = jest.fn();
          const onceSupply = context.onceConnected(onceConnected);
          const whenSupply = context.whenConnected(whenConnected);

          context.readStatus(statusReceiver);

          expect(whenConnected).not.toHaveBeenCalled();
          expect(statusReceiver).toHaveBeenLastCalledWith(expect.objectContaining({
            ready: true,
            settled: false,
            connected: false,
          }));
          expect(statusReceiver).toHaveBeenCalledTimes(1);

          context.element.connectedCallback();
          expect(context.connected).toBe(true);
          expect(onceConnected).toHaveBeenCalledWith(context);
          expect(onceSupply.isOff).toBe(false);
          expect(whenConnected).toHaveBeenCalledWith(context);
          expect(whenSupply.isOff).toBe(true);
          expect(statusReceiver).toHaveBeenLastCalledWith(expect.objectContaining({
            ready: true,
            settled: true,
            connected: true,
          }));
          expect(statusReceiver).toHaveBeenCalledTimes(2);
        });
        it('calls `connectedCallback()` of original element', () => {
          context.element.connectedCallback();
          expect(connectedCallback).toHaveBeenCalledWith();
        });

        describe('after settlement', () => {
          it('reports settlement only once', () => {

            const onceSettled = jest.fn();
            const whenSettled = jest.fn();
            const onceSupply = context.onceSettled(onceSettled);
            const whenSupply = context.whenSettled(whenSettled);

            context.settle();
            expect(context.settled).toBe(true);
            expect(onceSettled).toHaveBeenCalledTimes(1);
            expect(onceSupply.isOff).toBe(false);
            expect(whenSettled).toHaveBeenCalledTimes(1);
            expect(whenSupply.isOff).toBe(true);

            context.element.connectedCallback();
            expect(onceSettled).toHaveBeenCalledTimes(1);
            expect(whenSettled).toHaveBeenCalledTimes(1);
            expect(onceSupply.isOff).toBe(false);
          });
        });
      });

      describe('disconnectedCallback', () => {
        it('calls `disconnectedCallback()` of original element when disconnected', () => {
          context.element.disconnectedCallback();
          expect(disconnectedCallback).toHaveBeenCalledWith();
        });
      });

      it('can not access values of another component type', async () => {

        class AnotherComponent {

          static [ComponentDef__symbol]: ComponentDef = {
            name: 'another-component',
            extend: {
              type: MockElement,
            },
          };

        }

        const otherElement = new (builder.buildElement(AnotherComponent).elementType);
        const otherContext = await ComponentSlot.of(otherElement).whenReady;

        expect(otherContext.get(entry1, { or: null })).toBeNull();
        expect(otherContext.get(entry2, { or: null })).toBeNull();
      });

      describe('supply', () => {
        it('is cut off by `disconnectedCallback()`', () => {

          const destroyed = jest.fn();

          context.supply.whenOff(destroyed);
          context.element.disconnectedCallback();

          expect(destroyed).toHaveBeenCalledWith(undefined);
        });
        it('cuts off connection events supply', () => {

          const whenOff = jest.fn();
          const whenConnected = jest.fn();
          const reason = 'Destruction reason';

          context.supply.off(reason);
          context.whenConnected(whenConnected).whenOff(whenOff);

          expect(whenConnected).not.toHaveBeenCalled();
          expect(whenOff).toHaveBeenCalledWith(reason);
        });
        it('makes component unavailable', () => {

          const { element, component } = context;

          context.supply.off();
          expect(() => context.component).toThrow(new TypeError('Component destroyed already'));
          expect(element[ComponentDef__symbol]).toBeUndefined();
          expect(component[ComponentDef__symbol]).toBeUndefined();
        });
        it('makes component disconnected', () => {
          context.element.connectedCallback();
          context.supply.off();
          expect(context.connected).toBe(false);
          expect(context.settled).toBe(false);
        });
      });
    });

    describe('mounted element', () => {

      let doc: Document;

      beforeEach(() => {
        doc = document.implementation.createHTMLDocument('test');
      });

      let defContext: DefinitionContext;
      let element: any;
      let context: ComponentContext;

      beforeEach(() => {
        defContext = builder.buildElement(TestComponent);
        element = doc.createElement('test-element');
      });

      function doMount(): void {
        context = defContext.mountTo(element);
      }

      it('has context reference', async () => {
        doMount();
        expect(await ComponentSlot.of(element).whenReady).toBe(context);
      });
      it('is mounted', () => {
        doMount();
        expect(context.mounted).toBe(true);
      });

      describe('component mount', () => {
        it('refers to element', () => {
          doMount();
          expect(context.element).toBe(element);
        });
        it('refers to component', () => {
          doMount();
          expect(context.component).toBe(context.component);
        });
        it('is not connected when element is not in document', () => {
          doMount();
          expect(context.connected).toBe(false);
        });
        it('is connected initially when element is in document', () => {
          doc.body.appendChild(element);

          doMount();

          expect(context.connected).toBe(true);
        });
        it('is not settled initially when element is not in document', () => {
          doMount();

          expect(context.settled).toBe(false);
        });
        it('is settled once requested', () => {
          doMount();

          const whenSettled = jest.fn();

          context.whenSettled(whenSettled);

          const fragment = new DrekFragment(drekAppender(doc.body));

          fragment.innerContext.scheduler()(({ content }) => {

            const drekCtx = drekContextOf(element);

            content.appendChild(element);
            drekCtx.lift();
          });
          fragment.settle();

          expect(context.settled).toBe(true);
          expect(whenSettled).toHaveBeenCalledWith(context);
        });
        it('is not connected initially when element is not in document', () => {
          doMount();

          expect(context.connected).toBe(false);
        });
        it('reports already connected element', () => {
          doc.body.appendChild(element);
          doMount();

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
        it('cuts off component supply when disposed', () => {
          Supply.onUnexpectedAbort(noop);
          doc.body.appendChild(element);
          doMount();

          const disconnected = jest.fn();

          context.supply.whenOff(disconnected);
          expect(disconnected).not.toHaveBeenCalled();

          const reason = 'test';

          context.supply.off(reason);
          expect(context.connected).toBe(false);
          expect(disconnected).toHaveBeenCalledWith(reason);
        });
        it('can not be re-bound', () => {
          Supply.onUnexpectedAbort(noop);
          doc.body.appendChild(element);
          doMount();

          context.supply.off();
          expect(ComponentSlot.of(element).rebind()).toBeUndefined();
        });
        it('can be re-mounted', () => {
          Supply.onUnexpectedAbort(noop);
          doc.body.appendChild(element);
          doMount();

          const context2 = defContext.mountTo(element);

          expect(context2).not.toBe(context);
          expect(ComponentSlot.of(element).context).toBe(context2);

          context.supply.off();
          expect(context2.supply.isOff).toBe(false);
          expect(ComponentSlot.of(element).context).toBe(context2);
        });
      });
    });

    describe('connected element', () => {

      let defContext: DefinitionContext;
      let element: any;
      let context: ComponentContext;

      beforeEach(() => {
        defContext = builder.buildElement(TestComponent);

        element = new MockElement();
        context = defContext.mountTo(element);
      });

      it('is connected by default', () => {
        expect(context.connected).toBe(true);
      });
      it('disconnects element', () => {
        Supply.onUnexpectedAbort(noop);

        const disconnected = jest.fn();

        context.supply.whenOff(disconnected);

        const reason = 'test';

        context.supply.off(reason);
        expect(context.connected).toBe(false);
        expect(disconnected).toHaveBeenCalledWith(reason);
      });
    });
  });
});
