import { ContextValueKey } from '../common/context';
import { ComponentClass, ComponentDef } from '../component';
import { BootstrapContext } from '../feature';
import { ComponentValueRegistry } from './component-value-registry';
import { ElementBuilder } from './element-builder';
import SpyObj = jasmine.SpyObj;

describe('element/element-builder', () => {
  describe('ElementBuilder', () => {

    let bootstrapContextSpy: SpyObj<BootstrapContext>;
    let valueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;

    beforeEach(() => {
      bootstrapContextSpy = jasmine.createSpyObj('bootstrapContext', ['get']);
      bootstrapContextSpy.get.and.callFake((key: ContextValueKey<any>) => key.merge(
          bootstrapContextSpy,
          [],
          defaultProvider => defaultProvider()));

      valueRegistry = ComponentValueRegistry.create();
      builder = ElementBuilder.create({ bootstrapContext: bootstrapContextSpy, valueRegistry });
    });

    describe('buildElement', () => {

      let TestComponent: ComponentClass;

      beforeEach(() => {
        TestComponent = class {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'test-component',
          };
        };
      });

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
  });
});
