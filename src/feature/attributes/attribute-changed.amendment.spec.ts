import { CustomHTMLElement } from '@frontmeans/dom-primitives';
import { describe, expect, it, jest } from '@jest/globals';
import { noop } from '@proc7ts/primitives';
import { Component, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../testing';
import { AttributeChanged } from './attribute-changed.amendment';
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
        testAttr = attrSpy;

}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const component = context.component;

      element.attributeChangedCallback!('test-attr', 'old', 'new');

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
        testAttr = noop;

}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(attributePathTo('test-attr'), 'new', 'old');
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
        testAttr = noop;

}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        context.component,
        attributePathTo('test-attr'),
        'new',
        'old',
      );
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

        @AttributeChanged({ name: 'myAttr', updateState: key })
        attr = noop;

}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('my-attr', 'old', 'new');

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
        testAttr = attrSpy;

}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
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

        @AttributeChanged('myAttr')
        attr = attrSpy;

}

      const element = new (await testElement(TestComponent))();

      element.attributeChangedCallback('my-attr', 'old', 'new');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
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
