import { Class, ContextValueKey, EventInterest } from '../../common';
import { BootstrapContext } from '../../feature';
import { ComponentClass } from '../component';
import { ComponentDef } from '../component-def';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionContext } from './definition-context';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;
import Spy = jasmine.Spy;

describe('component/definition/element-builder', () => {
  describe('ElementBuilder', () => {

    let bootstrapContextSpy: SpyObj<BootstrapContext>;
    let valueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;
    let TestComponent: ComponentClass;

    beforeEach(() => {
      bootstrapContextSpy = jasmine.createSpyObj('bootstrapContext', ['get']);
      bootstrapContextSpy.get.and.callFake((key: ContextValueKey<any>) => key.merge(
          bootstrapContextSpy,
          [],
          defaultProvider => defaultProvider()));

      valueRegistry = ComponentValueRegistry.create();
      builder = ElementBuilder.create({ bootstrapContext: bootstrapContextSpy, valueRegistry });
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
  });
});
