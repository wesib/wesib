import { Component, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { AttributePath__root } from './attribute-path';
import { Attributes } from './attributes.decorator';

describe('feature/attributes', () => {
  describe('@Attributes', () => {
    it('updates the state', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes({
        attr: true,
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'attr'], 'new', 'old');
    });
    it('updates the state when listed', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes([
        'attr',
      ])
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'attr'], 'new', 'old');
    });
    it('updates the state when single', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes('attr')
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', async () => {

      const updateSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes({
        attr: updateSpy,
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const component = ComponentContext.of(element).component;
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([AttributePath__root, 'attr'], 'new', 'old');
      expect(updateSpy.mock.instances[0]).toBe(component);
    });
    it('updates the state with custom key', async () => {

      const key = ['custom-key'];

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes({
        attr: key,
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        }
      })
      @Attributes({
        attr: false,
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});
