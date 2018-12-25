import { StatePath } from 'fun-events';
import { Component, ComponentContext } from '../../component';
import { testElement } from '../../spec/test-element';
import { Attributes } from './attributes.decorator';

describe('feature/attributes/attributes', () => {
  describe('@Attributes', () => {
    it('updates the state', () => {

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      @Attributes({
        attr: true,
      })
      class TestComponent {
      }

      const element = new (testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', () => {

      const updateSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      @Attributes({
        attr: updateSpy,
      })
      class TestComponent {
      }

      const element = new (testElement(TestComponent));
      const component = ComponentContext.of(element).component;
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([StatePath.attribute, 'attr'], 'new', 'old');
      expect(updateSpy.mock.instances[0]).toBe(component);
    });
    it('updates the state with custom key', () => {

      const key = ['custom-key'];

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      @Attributes({
        attr: key,
      })
      class TestComponent {
      }

      const element = new (testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', () => {

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
        }
      })
      @Attributes({
        attr: false,
      })
      class TestComponent {
      }

      const element = new (testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});