import { Component, ComponentContext, ComponentContext__symbol } from '../../component';
import { ObjectMock } from '../../spec/mocks';
import { Attribute } from './attribute.decorator';

describe('feature/attributes/attribute.decorator', () => {
  describe('@Attribute', () => {

    let contextSpy: ObjectMock<ComponentContext<any>>;
    let elementSpy: ObjectMock<HTMLElement>;

    beforeEach(() => {
      elementSpy = {
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
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
        attr!: string;

      }

      const component = new TestComponent();

      elementSpy.getAttribute.mockReturnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
    it('declares attribute property', () => {

      @Component('test-component')
      class TestComponent {

        [ComponentContext__symbol] = contextSpy;

        @Attribute()
        get attr(): string {
          return '';
        }

        set attr(value: string) {
        }

      }

      const component = new TestComponent();

      elementSpy.getAttribute.mockReturnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
  });
});
