import { WebComponent } from '../../decorators';
import { DomPropertiesDef } from './dom-properties-def';
import { DomProperty } from './dom-property';

describe('features/dom-properties/dom-property', () => {
  describe('@DomProperty', () => {
    it('declares DOM property', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @DomProperty()
        customProperty = 'value';
      }

      const def = DomPropertiesDef.of(TestComponent);

      expect<any>(def).toEqual(jasmine.objectContaining({ customProperty: jasmine.anything() }));
    });
    it('declares DOM property with specified name', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @DomProperty({ name: 'otherProperty' })
        customProperty = 'value';
      }

      const def = DomPropertiesDef.of(TestComponent);

      expect<any>(def).not.toEqual(jasmine.objectContaining({ customProperty: jasmine.anything() }));
      expect<any>(def).toEqual(jasmine.objectContaining({ otherProperty: jasmine.anything() }));
    });

    describe('for object property', () => {
      it('applies defaults', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty()
          customProperty = 'value';
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: true,
          get: jasmine.any(Function),
          set: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies defaults to non-refreshing field', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty({ refreshState: false })
          customProperty = 'value';
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: true,
          get: jasmine.any(Function),
          set: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom property attributes', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty({
            configurable: false,
            enumerable: false,
            writable: false,
          })
          customProperty = 'value';
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: false,
          get: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom property attributes to non-refreshing field', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty({
            configurable: false,
            enumerable: false,
            writable: false,
            refreshState: false,
          })
          customProperty = 'value';
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: false,
          get: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
    });
    describe('for property accessor', () => {
      it('applies read-only property defaults', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty()
          get customProperty() {
            return 'value';
          }
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: false,
          get: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom read-only property attributes', () => {

        @WebComponent('test-component')
        class TestComponent {
          @DomProperty({
            configurable: false,
            enumerable: true,
            writable: false,
          })
          get customProperty() {
            return 'value';
          }
        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: true,
          get: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies writable property defaults', () => {

        @WebComponent('test-component')
        class TestComponent {

          private _value = 'value';

          get customProperty() {
            return this._value;
          }

          @DomProperty()
          set customProperty(value: string) {
            this._value = value;
          }

        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: true,
          enumerable: false,
          get: jasmine.any(Function),
          set: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
      it('applies custom writable property attributes', () => {

        @WebComponent('test-component')
        class TestComponent {

          private _value = 'value';

          get customProperty() {
            return this._value;
          }

          @DomProperty({
            configurable: false,
            enumerable: true,
            writable: false,
          })
          set customProperty(value: string) {
            this._value = value;
          }

        }

        const def = DomPropertiesDef.of(TestComponent);
        const expectedDesc: PropertyDescriptor = {
          configurable: false,
          enumerable: true,
          get: jasmine.any(Function),
        };

        expect<any>(def).toEqual(jasmine.objectContaining({
          customProperty: expectedDesc,
        }));
      });
    });
  });
});
