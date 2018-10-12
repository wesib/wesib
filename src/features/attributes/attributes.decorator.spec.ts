import { StatePath } from '../../common';
import { Component, ComponentContext, WesComponent } from '../../component';
import { testElement } from '../../spec/test-element';
import { Attributes } from './attributes.decorator';

describe('features/attributes/attributes', () => {
  describe('@Attributes', () => {
    it('updates the state', () => {

      @WesComponent({
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
      @Attributes({
        attr: updateSpy,
      })
      class TestComponent {
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

      const key = ['custom-key'];

      @WesComponent({
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
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', () => {

      @WesComponent({
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
      const updateStateSpy = spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});
