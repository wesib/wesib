import { EventInterest } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../component';
import { Feature } from '../feature';
import { MockElement, testElement } from './test-element';
import Mock = jest.Mock;

describe('component instantiation', () => {
  describe('Life cycle', () => {

    let testComponent: ComponentClass;
    let constructorSpy: Mock;
    let context: ComponentContext;
    let componentListenerSpy: Mock;
    let elementListenerInterest: EventInterest;
    let element: any;

    beforeEach(() => {
      context = undefined!;
      constructorSpy = jest.fn((ctx: ComponentContext) => context = ctx);
      componentListenerSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: class extends MockElement {
            get inheritedProperty() {
              return 'inherited-value';
            }
          },
        },
      })
      @Feature({
        init(bootCtx) {
          elementListenerInterest = bootCtx.onComponent(componentListenerSpy);
        }
      })
      class TestComponent {

        constructor(...args: any[]) {
          constructorSpy(...args);
        }

      }

      testComponent = TestComponent;
    });
    beforeEach(() => {
      element = new (testElement(testComponent))();
    });

    it('instantiates custom element', async () => {
      expect(element).toBeDefined();
    });
    it('assigns component context reference to custom element', () => {
      expect(ComponentContext.of(element)).toBe(context);
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
    it('allows to access inherited element properties', () => {
      expect(context.elementSuper('inheritedProperty')).toEqual('inherited-value');
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

        let context: ComponentContext<any> = { name: 'component context' } as any;

        const promise = new Promise(resolve => {

          @Component({
            name: 'test-component',
            extend: {
              type: Object,
            },
          })
          @Feature({
            init(bootCtx) {
              bootCtx.onComponent(ctx => {
                context = ctx;
                expect(() => context.component).toThrow(/not constructed yet/);
                ctx.whenReady(comp => resolve(comp));
              });
            }
          })
          class TestComponent {
          }

          const _element = new (testElement(TestComponent))();
        });

        const component = await promise;

        expect(component).toBeDefined();
        expect(context.component).toBe(component);

        let callbackInvoked = false;

        context.whenReady(comp => {
          callbackInvoked = true;
          expect(comp).toBe(component);
        });

        expect(callbackInvoked).toBe(true);
      });
    });

    describe('onConnect listener', () => {
      it('is notified on when custom element connected', () => {

        const listenerSpy = jest.fn();

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        @Feature({
          init(bootCtx) {
            bootCtx.onComponent(ctx => {
              ctx.onConnect(listenerSpy);
              ctx.onConnect(() => expect(ctx.connected).toBe(true));
            });
          }
        })
        class TestComponent {
        }

        const element: any = new (testElement(TestComponent))();

        element.connectedCallback();

        expect(listenerSpy).toHaveBeenCalled();
      });
    });

    describe('onDisconnect listener', () => {
      it('is notified on when custom element disconnected', () => {

        const listenerSpy = jest.fn();

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        @Feature({
          init(bootCtx) {
            bootCtx.onComponent(ctx => {
              ctx.onDisconnect(listenerSpy);
              ctx.onDisconnect(() => expect(ctx.connected).toBe(false));
            });
          }
        })
        class TestComponent {
        }

        const element: any = new (testElement(TestComponent))();

        expect(listenerSpy).not.toHaveBeenCalled();

        element.disconnectedCallback();

        expect(listenerSpy).toHaveBeenCalled();
      });
    });
  });
});
