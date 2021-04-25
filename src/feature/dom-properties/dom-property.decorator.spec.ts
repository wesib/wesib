import { Component, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../testing';
import { DomProperty } from './dom-property.decorator';

describe('feature/dom-properties', () => {
  describe('@DomProperty', () => {
    it('declares DOM property', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @DomProperty()
        customProperty = 'value';

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentSlot.of<TestComponent>(element).context!.component;

      expect(element.customProperty).toBe('value');

      element.customProperty = 'other';

      expect(component.customProperty).toBe('other');
    });
    it('declares DOM property with specified name', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @DomProperty({ propertyKey: 'otherProperty' })
        customProperty = 'value';

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentSlot.of<TestComponent>(element).context!.component;

      expect(element.otherProperty).toBe('value');

      element.otherProperty = 'other';

      expect(component.customProperty).toBe('other');
    });

    describe('for object property', () => {
      it('applies defaults', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          @DomProperty()
          customProperty = 'value';

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: true,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies defaults to non-state-updating field', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: Object,
          },
        })
        class TestComponent {

          @DomProperty({ updateState: false })
          customProperty = 'value';

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: true,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies custom property attributes', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          @DomProperty({
            configurable: false,
            enumerable: false,
            writable: false,
          })
          customProperty = 'value';

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies custom property attributes to non-state-updating field', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
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

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
    });

    describe('for property accessor', () => {
      it('applies read-only property defaults', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          @DomProperty()
          get customProperty(): string {
            return 'value';
          }

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: false,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies custom read-only property attributes', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          @DomProperty({
            configurable: false,
            enumerable: true,
            writable: false,
          })
          get customProperty(): string {
            return 'value';
          }

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: false,
          enumerable: true,
          get: expect.any(Function),
          set: undefined,
        });
      });
      it('applies writable property defaults', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          private _value = 'value';

          get customProperty(): string {
            return this._value;
          }

          @DomProperty()
          set customProperty(value: string) {
            this._value = value;
          }

        }

        const elementType = await testElement(TestComponent);

        expect(Object.getOwnPropertyDescriptor(elementType.prototype, 'customProperty')).toEqual({
          configurable: true,
          enumerable: false,
          get: expect.any(Function),
          set: expect.any(Function),
        });
      });
      it('applies custom writable property attributes', async () => {

        @Component({
          name: 'test-component',
          extend: {
            type: MockElement,
          },
        })
        class TestComponent {

          private _value = 'value';

          get customProperty(): string {
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

        const elementType = await testElement(TestComponent);

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
