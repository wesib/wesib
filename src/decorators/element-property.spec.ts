import { definitionOf } from '../component';
import { ElementProperty } from './element-property';
import { WebComponent } from './web-component';

describe('decorators/element-property', () => {
  describe('@ElementProperty', () => {
    it('declares element property', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @ElementProperty()
        customProperty = 'value';
      }

      const def = definitionOf(TestComponent);

      expect<any>(def.properties).toEqual(jasmine.objectContaining({ customProperty: jasmine.anything() }));
    });
    it('declares element property with specified name', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @ElementProperty({ name: 'otherProperty' })
        customProperty = 'value';
      }

      const def = definitionOf(TestComponent);

      expect<any>(def.properties).not.toEqual(jasmine.objectContaining({ customProperty: jasmine.anything() }));
      expect<any>(def.properties).toEqual(jasmine.objectContaining({ otherProperty: jasmine.anything() }));
    });

    describe('for object property', () => {
      it('applies defaults', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @ElementProperty()
          customProperty = 'value';
        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: true,
          get: jasmine.any(Function),
          set: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom property attributes', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @ElementProperty({
            configurable: false,
            enumerable: false,
            writable: false,
          })
          customProperty = 'value';
        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: false,
          get: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
    });
    describe('for property accessor', () => {
      it('applies read-only property defaults', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @ElementProperty()
          get customProperty() {
            return 'value';
          }
        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: false,
          get: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom read-only property attributes', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @ElementProperty({
            configurable: false,
            enumerable: true,
            writable: false,
          })
          get customProperty() {
            return 'value';
          }
        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: true,
          get: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies writable property defaults', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {

          private _value = 'value';

          get customProperty() {
            return this._value;
          }

          @ElementProperty()
          set customProperty(value: string) {
            this._value = value;
          }

        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: false,
          get: jasmine.any(Function),
          set: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom writable property attributes', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {

          private _value = 'value';

          get customProperty() {
            return this._value;
          }

          @ElementProperty({
            configurable: false,
            enumerable: true,
            writable: false,
          })
          set customProperty(value: string) {
            this._value = value;
          }

        }

        const def = definitionOf(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: true,
          get: jasmine.any(Function),
        };

        expect<any>(def.properties).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
    });
  });
});
