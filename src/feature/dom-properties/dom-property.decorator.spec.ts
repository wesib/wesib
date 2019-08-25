import { Component, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { DomProperty } from './dom-property.decorator';

describe('feature/dom-properties', () => {
  describe('@DomProperty', () => {
    it('declares DOM property', () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      class TestComponent {
        @DomProperty()
        customProperty = 'value';
      }

      const element = new (testElement(TestComponent));
      const component = ComponentContext.of(element).component as TestComponent;

      expect(element.customProperty).toBe('value');

      element.customProperty = 'other';

      expect(component.customProperty).toBe('other');
    });
    it('declares DOM property with specified name', () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      class TestComponent {
        @DomProperty({ propertyKey: 'otherProperty' })
        customProperty = 'value';
      }

      const element = new (testElement(TestComponent));
      const component = ComponentContext.of(element).component as TestComponent;

      expect(element.otherProperty).toBe('value');

      element.otherProperty = 'other';

      expect(component.customProperty).toBe('other');
    });

    describe('for object property', () => {
      it('applies defaults', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
        class TestComponent {
          @DomProperty()
          customProperty = 'value';
        }

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: true,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies defaults to non-state-updating field', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: Object,
          }
        })
        class TestComponent {
          @DomProperty({ updateState: false })
          customProperty = 'value';
        }

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: true,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies custom property attributes', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
        class TestComponent {
          @DomProperty({
            configurable: false,
            enumerable: false,
            writable: false,
          })
          customProperty = 'value';
        }

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies custom property attributes to non-state-updating field', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
        class TestComponent {
          @DomProperty({
            configurable: false,
            enumerable: false,
            writable: false,
            updateState: false,
          })
          customProperty = 'value';
        }

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
    });
    describe('for property accessor', () => {
      it('applies read-only property defaults', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
        class TestComponent {
          @DomProperty()
          get customProperty() {
            return 'value';
          }
        }

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies custom read-only property attributes', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
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

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: true,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies writable property defaults', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
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

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: false,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies custom writable property attributes', () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          }
        })
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

        const elementType = testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: true,
          get: expect.any(Function),
          set: undefined,
        });
      });
    });
  });
});
