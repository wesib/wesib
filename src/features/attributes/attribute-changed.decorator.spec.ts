import { noop, StatePath } from '../../common';
import { Component, ComponentContext, WesComponent } from '../../component';
import { testElement } from '../../spec/test-element';
import { AttributeChanged } from './attribute-changed.decorator';

describe('features/attributes/attribute-changed', () => {
  describe('@AttributeChanged', () => {
    it('declares attribute change callback', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged()
        attr = attrSpy;

      }

      const element = new (testElement(TestComponent));
      const component = Component.of(element) as TestComponent;

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
    });
    it('updates the state', () => {

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged({})
        attr = noop;

      }

      const element = new (testElement(TestComponent));
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', () => {

      const updateSpy = jasmine.createSpy('updateState');

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged({ updateState: updateSpy })
        attr = noop;

      }

      const element = new (testElement(TestComponent));
      const component = Component.of(element) as TestComponent;
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr'], 'new', 'old');
      expect(updateSpy.calls.first().object).toBe(component);
    });
    it('updates the state with custom key', () => {

      const key = ['attr-key'];

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged({ name: 'my-attr', updateState: key })
        attr = noop;

      }

      const element = new (testElement(TestComponent));
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged({ updateState: false })
        attr = attrSpy;

      }

      const element = new (testElement(TestComponent));
      const component = Component.of(element) as TestComponent;
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
      expect(updateStateSpy).not.toHaveBeenCalled();
    });
    it('declares attribute with custom attribute name', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      class TestComponent {

        @AttributeChanged('my-attr')
        attr = attrSpy;

      }

      const element = new (testElement(TestComponent));
      const component = Component.of(element) as TestComponent;

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
    });
    it('fails when attribute name is absent and property key is symbol', () => {

      const key = Symbol('test');
      const attrSpy = jasmine.createSpy('attrChanged');

      expect(() => {
        @WesComponent({ name: 'test-component' })
        class TestComponent {
          @AttributeChanged()
          [key] = attrSpy;
        }
      }).toThrowError(TypeError);
    });
  });
});
