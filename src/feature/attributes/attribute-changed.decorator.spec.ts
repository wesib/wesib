import { noop } from 'call-thru';
import { Component, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { AttributeChanged } from './attribute-changed.decorator';
import { attributePathTo } from './attribute-path';

describe('feature/attributes', () => {
  describe('@AttributeChanged', () => {
    it('declares attribute change callback', async () => {

      const attrSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged()
        attr = attrSpy;

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentContext.of(element).component;

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.mock.instances[0]).toBe(component);
    });
    it('updates the state', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged({})
        attr = noop;

      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(attributePathTo('attr'), 'new', 'old');
    });
    it('updates the state with custom function', async () => {

      const updateSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged({ updateState: updateSpy })
        attr = noop;

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentContext.of(element).component;
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(attributePathTo('attr'), 'new', 'old');
      expect(updateSpy.mock.instances[0]).toBe(component);
    });
    it('updates the state with custom key', async () => {

      const key = ['attr-key'];

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged({ name: 'my-attr', updateState: key })
        attr = noop;

      }

      const element = new (await testElement(TestComponent));
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', async () => {

      const attrSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged({ updateState: false })
        attr = attrSpy;

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentContext.of(element).component;
      const updateStateSpy = jest.spyOn(ComponentContext.of(element), 'updateState');

      element.attributeChangedCallback('attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.mock.instances[0]).toBe(component);
      expect(updateStateSpy).not.toHaveBeenCalled();
    });
    it('declares attribute with custom attribute name', async () => {

      const attrSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {

        @AttributeChanged('my-attr')
        attr = attrSpy;

      }

      const element = new (await testElement(TestComponent));
      const component = ComponentContext.of(element).component;

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.mock.instances[0]).toBe(component);
    });
    it('fails when attribute name is absent and property key is symbol', () => {

      const key = Symbol('test');
      const attrSpy = jest.fn();

      expect(() => {

        @Component('test-component')
        class TestComponent {

          @AttributeChanged()
          [key] = attrSpy;

        }

        return TestComponent;
      }).toThrow(/Attribute name is required as property key is not a string/);
    });
  });
});
