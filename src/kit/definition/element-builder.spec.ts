import { SingleContextKey } from 'context-values';
import { EventInterest } from 'fun-events';
import { JSDOM } from 'jsdom';
import { Class } from '../../common';
import { ComponentClass, ComponentContext, ComponentDef } from '../../component';
import { DefinitionContext, ElementBaseClass } from '../../component/definition';
import { BootstrapWindow } from '../bootstrap-window';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionValueRegistry } from './definition-value-registry';
import { ElementBuilder } from './element-builder';
import Mock = jest.Mock;

describe('kit/definition/element-builder', () => {

  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM();
  });

  describe('ElementBuilder', () => {

    let definitionValueRegistry: DefinitionValueRegistry;
    let componentValueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      definitionValueRegistry = DefinitionValueRegistry.create();
      definitionValueRegistry.provide({ a: BootstrapWindow, is: dom.window });
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
      it('builds custom element', () => {
        expect(builder.buildElement(TestComponent).prototype).toBeInstanceOf(dom.window.HTMLElement);
      });
      it('extends HTML element', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: dom.window.HTMLInputElement,
          },
        });

        expect(builder.buildElement(TestComponent).prototype).toBeInstanceOf(dom.window.HTMLInputElement);
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

          expect(await promise).toBeInstanceOf(Function);
        });
        it('is present when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext<any> = listenerSpy.mock.calls[0][0];

          expect(context.elementType).toBeInstanceOf(Function);
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
    describe('definition context value', () => {

      const key = new SingleContextKey<string>('test-key');
      let value: string;
      const key2 = new SingleContextKey<string>('another-key');
      let value2: string;
      let definitionContext: DefinitionContext<any>;
      let componentContext: ComponentContext;

      beforeEach(() => {
        value = 'some value';
        builder.definitions.on((ctx: DefinitionContext<any>) => {
          definitionContext = ctx;
          if (ctx.componentType === TestComponent) {
            ctx.forComponents({ a: key, is: value });
          }
        });
      });
      beforeEach(() => {
        value2 = 'other value';
        ComponentDef.define(TestComponent, {
          define(context: DefinitionContext<any>) {
            context.forComponents({ a: key2, is: value2 });
          }
        });
      });
      beforeEach(() => {
        definitionValueRegistry.provide({ a: ElementBaseClass, is: Object });
      });
      beforeEach(() => {

        const element = new (builder.buildElement(TestComponent));

        componentContext = ComponentContext.of(element);
      });

      describe('DefinitionContext', () => {
        it('is available as context value', () => {
          expect(definitionContext.get(DefinitionContext)).toBe(definitionContext);
        });
      });
      it('is available to component', () => {
        expect(componentContext.get(key)).toBe(value);
        expect(componentContext.get(key2)).toBe(value2);
      });
      it('is not available to another component', () => {

        class AnotherComponent {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'another-component',
          };
        }

        const otherElement = new (builder.buildElement(AnotherComponent));
        const otherContext = ComponentContext.of(otherElement);

        expect(otherContext.get(key, { or: null })).toBeNull();
        expect(otherContext.get(key2, { or: null })).toBeNull();
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

        const element = new (builder.buildElement(TestComponent));

        componentContext = ComponentContext.of(element);
      });

      it('is notified to component instantiation', () => {
        expect(onComponentSpy).toHaveBeenCalledWith(componentContext);
      });
    });
  });
});
