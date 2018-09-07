import { ComponentDef, ComponentType } from '../component';
import { ComponentValueRegistry } from './component-value-registry';
import { ElementBuilder } from './element-builder';

describe('element/element-builder', () => {
  describe('ElementBuilder', () => {

    let valueRegistry: ComponentValueRegistry;
    let builder: ElementBuilder;

    beforeEach(() => {
      valueRegistry = ComponentValueRegistry.create();
      builder = ElementBuilder.create({ valueRegistry });
    });

    describe('buildElement', () => {

      let TestComponent: ComponentType;

      beforeEach(() => {
        TestComponent = class {
          static [ComponentDef.symbol]: ComponentDef = {
            name: 'test-component',
          };
        };
      });

      it('builds HTML element', () => {
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
