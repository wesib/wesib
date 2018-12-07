import { StatePath } from 'fun-events';
import { noop } from '../../common';
import { Component, ComponentContext } from '../../component';
import { testElement } from '../../spec/test-element';
import { AttributeChanged } from './attribute-changed.decorator';

describe('features/attributes/attribute-changed', () => {
  describe('@AttributeChanged', () => {
    it('declares attribute change callback', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @Component({
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
      const component = ComponentContext.of(element).component;

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
    });
    it('updates the state', () => {

      @Component({
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

      @Component({
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
      const component = ComponentContext.of(element).component;
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr'], 'new', 'old');
      expect(updateSpy.calls.first().object).toBe(component);
    });
    it('updates the state with custom key', () => {

      const key = ['attr-key'];

      @Component({
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

      @Component({
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
      const component = ComponentContext.of(element).component;
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
      expect(updateStateSpy).not.toHaveBeenCalled();
    });
    it('declares attribute with custom attribute name', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @Component({
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
      const component = ComponentContext.of(element).component;

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
    });
    it('fails when attribute name is absent and property key is symbol', () => {

      const key = Symbol('test');
      const attrSpy = jasmine.createSpy('attrChanged');

      expect(() => {
        @Component({ name: 'test-component' })
        class TestComponent {
          @AttributeChanged()
          [key] = attrSpy;
        }
      }).toThrowError(TypeError);
    });
  });
});
