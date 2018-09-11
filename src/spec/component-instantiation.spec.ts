import { EventInterest } from '../common';
import { Component, ComponentClass, ComponentContext, WesComponent } from '../component';
import { TestBootstrap } from './test-bootstrap';
import Spy = jasmine.Spy;

describe('component instantiation', () => {
  describe('Life cycle', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentClass;
    let constructorSpy: Spy;
    let context: ComponentContext;
    let componentListenerSpy: Spy;
    let elementListenerInterest: EventInterest;
    let element: HTMLElement;

    beforeEach(() => {
      context = undefined!;
      constructorSpy = jasmine.createSpy('constructor')
          .and.callFake((ctx: ComponentContext) => context = ctx);

      @WesComponent({ name: 'test-component' })
      class TestComponent {

        constructor(...args: any[]) {
          constructorSpy(...args);
        }

      }

      testComponent = TestComponent;
    });
    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
      componentListenerSpy = jasmine.createSpy('componentListener');
      elementListenerInterest = bootstrap.context.onComponent(componentListenerSpy);
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

    describe('onComponent listener', () => {
      it('is notified on new element instantiation', () => {
        expect(componentListenerSpy).toHaveBeenCalledWith(context);
      });
    });
  });

  describe('context callbacks', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentClass;
    let constructorSpy: Spy;

    beforeEach(() => {
      constructorSpy = jasmine.createSpy('constructor');

      @WesComponent({ name: 'test-component' })
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

        let context: ComponentContext = { name: 'component context' } as any;

        const promise = new Promise(resolve => {
          bootstrap.context.onComponent(ctx => {
            context = ctx;
            expect(() => context.component).toThrowError(/not constructed yet/);
            ctx.whenReady(comp => resolve(comp));
          });
        });

        await bootstrap.addElement(testComponent);

        const component = await promise;

        expect(component).toEqual(jasmine.any(testComponent));
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
      it('is notified on when custom element connected', async () => {

        const listenerSpy = jasmine.createSpy('onConnect');

        bootstrap.context.onComponent(ctx => {
          ctx.onConnect(listenerSpy);
          ctx.onConnect(() => expect(ctx.connected).toBe(true));
        });

        await bootstrap.addElement(testComponent);

        expect(listenerSpy).toHaveBeenCalled();
      });
    });

    describe('onDisconnect listener', () => {
      it('is notified on when custom element disconnected', async () => {

        const listenerSpy = jasmine.createSpy('onDisconnect');

        bootstrap.context.onComponent(ctx => {
          ctx.onDisconnect(listenerSpy);
          ctx.onDisconnect(() => expect(ctx.connected).toBe(false));
        });

        const el = await bootstrap.addElement(testComponent);

        expect(listenerSpy).not.toHaveBeenCalled();

        el.remove();

        expect(listenerSpy).toHaveBeenCalled();
      });
    });
  });
});
