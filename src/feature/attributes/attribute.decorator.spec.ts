import { valueProvider } from '@proc7ts/primitives';
import { Component, ComponentContext, ComponentContext__symbol } from '../../component';
import { Attribute } from './attribute.decorator';
import Mocked = jest.Mocked;

describe('feature/attributes', () => {
  describe('@Attribute', () => {

    let mockContext: Mocked<ComponentContext>;
    let mockElement: Mocked<HTMLElement>;

    beforeEach(() => {
      mockElement = {
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      } as any;
      mockContext = {
        updateState: jest.fn(),
        element: mockElement,
      } as any;
    });

    it('declares attribute field', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = valueProvider(mockContext);

        @Attribute()
        testAttr!: string;

      }

      const component = new TestComponent();

      mockElement.getAttribute.mockReturnValue('value1');

      expect(component.testAttr).toBe('value1');

      component.testAttr = 'value2';
      expect(mockElement.setAttribute).toHaveBeenCalledWith('test-attr', 'value2');
    });
    it('declares attribute property', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = valueProvider(mockContext);

        @Attribute()
        get testAttr(): string | null {
          return '';
        }

        set testAttr(_value: string | null) {
          /* do not set */
        }

      }

      const component = new TestComponent();

      mockElement.getAttribute.mockReturnValue('value1');

      expect(component.testAttr).toBe('value1');

      component.testAttr = 'value2';
      expect(mockElement.setAttribute).toHaveBeenCalledWith('test-attr', 'value2');

      component.testAttr = null;
      expect(mockElement.removeAttribute).toHaveBeenCalledWith('test-attr');
    });
  });
});
