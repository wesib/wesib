import { ComponentDesc, componentDesc, ComponentType, describeComponent } from '../component';
import { ElementBuilder } from './element-builder';

describe('element/element-builder', () => {
  describe('ElementBuilder', () => {

    let builder: ElementBuilder;

    beforeEach(() => {
      builder = new ElementBuilder();
    });

    describe('buildElement', () => {

      let TestComponent: ComponentType;

      beforeEach(() => {
        TestComponent = class {
          static [componentDesc]: ComponentDesc = {
            name: 'test-component',
          };
        };
      });

      it('builds HTML element', () => {
        expect(builder.buildElement(TestComponent).prototype).toEqual(jasmine.any(HTMLElement));
      });
      it('extends HTML element', () => {
        describeComponent(TestComponent, {
          extend: {
            name: 'input',
            type: HTMLInputElement,
          },
        });

        expect(builder.buildElement(TestComponent).prototype).toEqual(jasmine.any(HTMLInputElement));
      });
      it('applies properties', () => {
        describeComponent(TestComponent, {
          properties: {
            testProperty: {
              value: 'test value',
            },
          },
        });

        const element = builder.buildElement(TestComponent);

        expect<any>(element.prototype).toEqual(jasmine.objectContaining({
          testProperty: 'test value',
        }));
      });
    });
  });
});
