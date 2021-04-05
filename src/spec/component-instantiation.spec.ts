import { CustomHTMLElement } from '@frontmeans/dom-primitives';
import { onSupplied } from '@proc7ts/fun-events';
import { Component, ComponentContext, ComponentSlot } from '../component';
import { ComponentClass } from '../component/definition';
import { Feature } from '../feature';
import { MockElement, testElement } from './test-element';
import Mock = jest.Mock;

describe('component instantiation', () => {
  describe('Life cycle', () => {

    let testComponent: ComponentClass;
    let constructorSpy: Mock;
    let context: ComponentContext;
    let componentListenerSpy: Mock;
    let element: any;

    beforeEach(() => {
      context = undefined!;
      constructorSpy = jest.fn((ctx: ComponentContext) => context = ctx);
      componentListenerSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Feature({
        init(bootCtx) {
          bootCtx.onComponent(componentListenerSpy);
        },
      })
      class TestComponent {

        constructor(...args: any[]) {
          constructorSpy(...args);
        }

      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      element = new (await testElement(testComponent))();
    });

    it('instantiates custom element', () => {
      expect(element).toBeDefined();
    });
    it('binds component to custom element', () => {
      expect(ComponentSlot.of(element).context).toBe(context);
    });
    it('assigns component context reference to component', () => {
      expect(ComponentContext.of(context.component)).toBe(context);
    });
    it('passes context to component', () => {

      const expectedContext: Partial<ComponentContext> = {
        element,
      };

      expect(constructorSpy).toHaveBeenCalledWith(expect.objectContaining(expectedContext));
    });
    it('uses custom element as content root', () => {
      expect(context.contentRoot).toBe(element);
    });
    it('sets component type', () => {
      expect(context.componentType).toBe(testComponent);
    });

    describe('onComponent listener', () => {
      it('is notified on new element instantiation', () => {
        expect(componentListenerSpy).toHaveBeenCalledWith(context);
      });
    });
  });

  describe('context callbacks', () => {
    describe('component', () => {
      it('is resolved on component instantiation', async () => {

        let context!: ComponentContext;
        const component = await new Promise((resolve, reject) => {

          @Component({
            name: 'test-component',
            extend: {
              type: MockElement,
            },
          })
          @Feature({
            init(featureCtx) {
              featureCtx.onComponent(ctx => {
                context = ctx;
                expect(() => context.component).toThrow(/not constructed yet/);
                ctx.whenReady(c => resolve(c.component));
              });
            },
          })
          class TestComponent {
          }

          testElement(TestComponent).then(cls => new cls()).catch(reject);
        });

        expect(component).toBeDefined();
        expect(context.component).toBe(component);

        const ready = jest.fn();

        context.whenReady(ready);

        expect(ready).toHaveBeenCalledWith(context);
      });
    });

    describe('whenConnected receiver', () => {
      it('is notified when custom element connected', async () => {

        const whenConnected = jest.fn();

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          constructor(ctx: ComponentContext) {
            ctx.whenConnected(whenConnected);
            ctx.whenConnected(() => expect(ctx.connected).toBe(true));
          }

        }

        const element: any = new (await testElement(TestComponent))();

        element.connectedCallback();

        expect(whenConnected).toHaveBeenCalled();
      });
    });

    describe('destruction callback', () => {
      it('is notified when custom element disconnected', async () => {

        const whenDestroyed = jest.fn();

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          constructor(ctx: ComponentContext) {
            ctx.supply
                .whenOff(whenDestroyed)
                .whenOff(() => expect(ctx.connected).toBe(false));
          }

        }

        const element: CustomHTMLElement = new (await testElement(TestComponent))();

        expect(whenDestroyed).not.toHaveBeenCalled();

        const receive1 = jest.fn();
        const slot = ComponentSlot.of(element);
        const supply1 = slot.read(receive1);
        const receive2 = jest.fn();
        const supply2 = onSupplied(slot)(receive2);

        element.disconnectedCallback!();

        expect(whenDestroyed).toHaveBeenCalled();
        expect(receive1).toHaveBeenLastCalledWith(undefined);
        expect(receive1).toHaveBeenCalledTimes(2);
        expect(supply1.isOff).toBe(false);

        expect(receive2).toHaveBeenLastCalledWith(undefined);
        expect(receive2).toHaveBeenCalledTimes(2);
        expect(supply2.isOff).toBe(false);

        const receive3 = jest.fn();
        const supply3 = slot.whenReady(receive3);

        expect(receive3).not.toHaveBeenCalled();
        expect(supply3.isOff).toBe(false);
      });
    });
  });
});
