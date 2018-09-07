import { Component, ComponentContext, WesComponent } from '../../component';
import { Attribute } from './attribute.decorator';
import { AttributesDef } from './attributes-def';
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

      @WesComponent('test-component')
      class TestComponent {

        @Attribute()
        attr!: string;

      }

      expect(AttributesDef.of(TestComponent).attr).toBeDefined();

      const component = Component.create<TestComponent>(TestComponent, contextSpy);

      elementSpy.getAttribute.and.returnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
    it('declares attribute property', () => {

      @WesComponent('test-component')
      class TestComponent {

        @Attribute()
        get attr(): string {
          return '';
        }

        set attr(value: string) {
        }

      }

      expect(AttributesDef.of(TestComponent).attr).toBeDefined();

      const component = Component.create<TestComponent>(TestComponent, contextSpy);

      elementSpy.getAttribute.and.returnValue('value1');

      expect(component.attr).toBe('value1');

      component.attr = 'value2';
      expect(elementSpy.setAttribute).toHaveBeenCalledWith('attr', 'value2');
    });
  });
});
