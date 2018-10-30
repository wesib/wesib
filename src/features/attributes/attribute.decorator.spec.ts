import { Component, ComponentContext } from '../../component';
import { Attribute } from './attribute.decorator';
import SpyObj = jasmine.SpyObj;

describe('features/attributes/attribute.decorator', () => {
  describe('@Attribute', () => {

    let contextSpy: SpyObj<ComponentContext<any>>;
    let elementSpy: SpyObj<HTMLElement>;

    beforeEach(() => {
      contextSpy = jasmine.createSpyObj('componentContext', ['updateState']);
      elementSpy = jasmine.createSpyObj('element', ['getAttribute', 'setAttribute']);
      (contextSpy as any).element = elementSpy;
    });

    it('declares attribute field', () => {

      @Component('test-component')
      class TestComponent {

        @Attribute()
        attr!: string;

      }

      const component = Component.create<TestComponent>(TestComponent, contextSpy);

      elementSpy.getAttribute.and.returnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
    it('declares attribute property', () => {

      @Component('test-component')
      class TestComponent {

        @Attribute()
        get attr(): string {
          return '';
        }

        set attr(value: string) {
        }

      }

      const component = Component.create<TestComponent>(TestComponent, contextSpy);

      elementSpy.getAttribute.and.returnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
  });
});
