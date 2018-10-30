import { Class, EventInterest, SingleValueKey } from '../../common';
import { ComponentClass } from '../component-class';
import { ComponentContext } from '../component-context';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionContext, ElementBaseClass } from './definition-context';
import { DefinitionValueRegistry } from './definition-value-registry';
import { ElementBuilder } from './element-builder';
import Spy = jasmine.Spy;

describe('component/definition/element-builder', () => {
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
      it('builds custom element', () => {
        expect(builder.buildElement(TestComponent).prototype).toEqual(jasmine.any(HTMLElement));
      });
      it('extends HTML element', () => {
        ComponentDef.define(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });

        expect(builder.buildElement(TestComponent).prototype).toEqual(jasmine.any(HTMLInputElement));
      });
    });
    describe('component definition listener', () => {

      let listenerSpy: Spy;
      let interest: EventInterest;

      beforeEach(() => {
        listenerSpy = jasmine.createSpy('listener');
        interest = builder.definitions.on(listenerSpy);
      });

      it('is notified on component definition', () => {
        builder.buildElement(TestComponent);

        expect(listenerSpy).toHaveBeenCalledWith(jasmine.objectContaining({ componentType: TestComponent }));
      });

      describe('element type', () => {
        it('is absent when listener notified', () => {
          listenerSpy.and.callFake((context: DefinitionContext<any>) => {
            expect(() => context.elementType).toThrowError(/not constructed yet/);
          });

          builder.buildElement(TestComponent);
        });
        it('is reported when ready', async () => {

          const promise = new Promise<Class>(resolve => {
            listenerSpy.and.callFake((context: DefinitionContext<any>) => context.whenReady(resolve));
          });

          builder.buildElement(TestComponent);

          expect(await promise).toEqual(jasmine.any(Function));
        });
        it('is present when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext<any> = listenerSpy.calls.first().args[0];

          expect(context.elementType).toEqual(jasmine.any(Function));
        });
        it('is reported immediately by callback when element built', () => {
          builder.buildElement(TestComponent);

          const context: DefinitionContext<any> = listenerSpy.calls.first().args[0];

          let elementType: Class | undefined;

          context.whenReady(type => elementType = type);

          expect(elementType).toBe(context.elementType);
        });
      });
    });
    describe('definition context value', () => {

      const key = new SingleValueKey<string>('test-key');
      let value: string;
      const key2 = new SingleValueKey<string>('another-key');
      let value2: string;
      let definitionContext: DefinitionContext<any>;
      let componentContext: ComponentContext;

      beforeEach(() => {
        value = 'some value';
        builder.definitions.on((ctx: DefinitionContext<any>) => {
          definitionContext = ctx;
          if (ctx.componentType === TestComponent) {
            ctx.forComponents({ provide: key, value });
          }
        });
      });
      beforeEach(() => {
        value2 = 'other value';
        ComponentDef.define(TestComponent, {
          define(context: DefinitionContext<any>) {
            context.forComponents({ provide: key2, value: value2 });
          }
        });
      });
      beforeEach(() => {
        definitionValueRegistry.provide({ provide: ElementBaseClass, value: Object });
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

        expect(otherContext.get(key, null)).toBeNull();
        expect(otherContext.get(key2, null)).toBeNull();
      });
    });
    describe('component listener', () => {

      let componentContext: ComponentContext;
      let onComponentSpy: Spy;

      beforeEach(() => {
        onComponentSpy = jasmine.createSpy('onComponent');
        ComponentDef.define(TestComponent, {
          define(context) {
            context.onComponent(onComponentSpy);
          }
        });
      });
      beforeEach(() => {
        definitionValueRegistry.provide({ provide: ElementBaseClass, value: Object });
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
