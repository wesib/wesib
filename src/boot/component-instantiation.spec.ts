import { CustomHTMLElement } from '@frontmeans/dom-primitives';
import { drekAppender, drekBuild, DrekFragment, drekLift } from '@frontmeans/drek';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { onSupplied } from '@proc7ts/fun-events';
import { Class } from '@proc7ts/primitives';
import { Mock } from 'jest-mock';
import { Component, ComponentContext, ComponentElement, ComponentSlot } from '../component';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { Feature } from '../feature';
import { MockElement, testElement } from '../testing';

describe('component instantiation', () => {
  describe('Life cycle', () => {
    let testComponent: ComponentClass;
    let mockConstructor: Mock<(context: ComponentContext) => unknown>;
    let context: ComponentContext;
    let onComponent: Mock<(context: ComponentContext) => void>;
    let element: ComponentElement;

    beforeEach(() => {
      context = undefined!;
      mockConstructor = jest.fn((ctx: ComponentContext) => (context = ctx));
      onComponent = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Feature({
        init(bootCtx) {
          bootCtx.onComponent(onComponent);
        },
      })
      class TestComponent {

        constructor(context: ComponentContext) {
          mockConstructor(context);
        }

}

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      element = new (await testElement(testComponent))();
      await ComponentSlot.of(element).whenReady;
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

      expect(mockConstructor).toHaveBeenCalledWith(expect.objectContaining(expectedContext));
    });
    it('uses custom element as content root', () => {
      expect(context.contentRoot).toBe(element);
    });
    it('sets component type', () => {
      expect(context.componentType).toBe(testComponent);
    });

    describe('onComponent listener', () => {
      it('is notified on new element instantiation', () => {
        expect(onComponent).toHaveBeenCalledWith(context);
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
          class TestComponent {}

          testElement(TestComponent)
            .then(cls => new cls())
            .then((element: ComponentElement) => ComponentSlot.of(element).whenReady)
            .then(context => context.component)
            .catch(reject);
        });

        expect(component).toBeDefined();
        expect(context.component).toBe(component);

        const ready = jest.fn();

        context.whenReady(ready);

        expect(ready).toHaveBeenCalledWith(context);
      });
    });

    describe('whenSettled receiver', () => {
      it('is notified when render context is settled', async () => {
        const whenSettled = jest.fn();
        let root: Element;

        class BaseElement extends MockElement {

          override getRootNode(): Node {
            return root;
          }

}

        @Component({
          name: 'test-component',
          extend: {
            type: BaseElement,
          },
        })
        class TestComponent {

          constructor(ctx: ComponentContext) {
            ctx.whenSettled(whenSettled);
            ctx.whenSettled(() => expect(ctx.settled).toBe(true));
          }

}

        const elementType: Class<Element> = await testElement(TestComponent);
        const fragment = new DrekFragment(drekAppender(document.body));

        drekBuild(() => {
          root = document.createElement('root-element');
          fragment.content.appendChild(root);

          return new elementType();
        });

        fragment.settle();
        expect(whenSettled).toHaveBeenCalled();
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

        const element = new (await testElement(TestComponent))();

        element.connectedCallback();

        expect(whenConnected).toHaveBeenCalled();
      });
    });

    describe('replacement', () => {
      it('can be replaced by mounted component', async () => {
        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {}

        const element: CustomHTMLElement = new (await testElement(TestComponent))();
        const slot = ComponentSlot.of(element);
        const context1 = slot.context!;
        const context2 = context1.get(DefinitionContext).mountTo(element);

        expect(context2).not.toBe(context1);

        context1.supply.off();
        expect(context2.supply.isOff).toBe(false);
        expect(slot.context).toBe(context2);
      });
    });

    describe('disconnection', () => {
      it('destroys component', async () => {
        const whenDestroyed = jest.fn();

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          constructor(ctx: ComponentContext) {
            ctx.supply.whenOff(whenDestroyed).whenOff(() => expect(ctx.connected).toBe(false));
          }

}

        const element: CustomHTMLElement = new (await testElement(TestComponent))();

        expect(whenDestroyed).not.toHaveBeenCalled();

        const receive1 = jest.fn();
        const slot = ComponentSlot.of(element);
        const supply1 = slot.read(receive1);
        const receive2 = jest.fn();
        const supply2 = onSupplied(slot)(receive2);

        jest.spyOn(element, 'getRootNode').mockImplementation(() => element);
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
      it('allows to re-bind component', async () => {
        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {}

        const element: CustomHTMLElement = new (await testElement(TestComponent))();
        const slot = ComponentSlot.of(element);
        const context1 = slot.context!;

        expect(context1.supply.isOff).toBe(false);

        jest.spyOn(element, 'getRootNode').mockImplementation(() => element);
        element.disconnectedCallback!();
        expect(context1.supply.isOff).toBe(true);
        expect(slot.context).toBeUndefined();

        const context2 = slot.rebind()!;

        expect(context2).toBeDefined();
        expect(ComponentSlot.of(element).context).toBe(context2);
        expect(context2).not.toBe(context1);
        expect(context2.supply.isOff).toBe(false);
        expect(context2.settled).toBe(false);
      });
      it('allows to recreate component on settlement', async () => {
        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {}

        const element: CustomHTMLElement = new (await testElement(TestComponent))();
        const slot = ComponentSlot.of(element);
        const context1 = slot.context!;

        expect(context1.supply.isOff).toBe(false);

        const getRootNodeSpy = jest.spyOn(element, 'getRootNode');

        getRootNodeSpy.mockImplementation(() => element);
        element.disconnectedCallback!();
        expect(context1.supply.isOff).toBe(true);
        expect(slot.context).toBeUndefined();

        const fragment = new DrekFragment(drekAppender(document.body));

        getRootNodeSpy.mockImplementation(() => fragment.content);
        drekLift(element);

        fragment.settle();

        const context2 = slot.context!;

        expect(context2).not.toBe(context1);
        expect(context2.supply.isOff).toBe(false);
        expect(context2.settled).toBe(true);
      });
      it('allows to recreate component on reconnection', async () => {
        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {}

        const element: CustomHTMLElement = new (await testElement(TestComponent))();
        const slot = ComponentSlot.of(element);
        const context1 = slot.context!;

        expect(context1.supply.isOff).toBe(false);

        const getRootNodeSpy = jest.spyOn(element, 'getRootNode');

        getRootNodeSpy.mockImplementation(() => element);
        element.disconnectedCallback!();
        expect(context1.supply.isOff).toBe(true);
        expect(slot.context).toBeUndefined();

        getRootNodeSpy.mockImplementation(() => document.body);
        element.connectedCallback!();

        const context2 = slot.context!;

        expect(context2).not.toBe(context1);
        expect(context2.supply.isOff).toBe(false);
        expect(context2.connected).toBe(true);
      });
    });
  });
});
