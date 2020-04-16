import { Component, ComponentContext, ComponentContext__symbol } from '../../component';
import { Attribute } from './attribute.decorator';
import Mocked = jest.Mocked;

describe('feature/attributes', () => {
  describe('@Attribute', () => {

    let contextSpy: Mocked<ComponentContext>;
    let elementSpy: Mocked<HTMLElement>;

    beforeEach(() => {
      elementSpy = {
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      } as any;
      contextSpy = {
        updateState: jest.fn(),
        element: elementSpy,
      } as any;
    });

    it('declares attribute field', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = contextSpy;

        @Attribute()
        testAttr!: string;

      }

      const component = new TestComponent();

      elementSpy.getAttribute.mockReturnValue('value1');

      expect(component.testAttr).toBe('value1');

      component.testAttr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('test-attr', 'value2');
    });
    it('declares attribute property', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = contextSpy;

        @Attribute()
        get testAttr(): string | null {
          return '';
        }

        set testAttr(_value: string | null) {
          /* do not set */
        }

      }

      const component = new TestComponent();

      elementSpy.getAttribute.mockReturnValue('value1');

      expect(component.testAttr).toBe('value1');

      component.testAttr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('test-attr', 'value2');

      component.testAttr = null;
      expect(elementSpy.removeAttribute).toHaveBeenCalledWith('test-attr');
    });
  });
});
