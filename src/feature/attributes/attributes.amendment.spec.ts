import { CustomHTMLElement } from '@frontmeans/dom-primitives';
import { describe, expect, it, jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../testing';
import { AttributePath__root } from './attribute-path';
import { Attributes } from './attributes.amendment';

describe('feature/attributes', () => {
  describe('@Attributes', () => {
    it('updates the state', async () => {
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes({
        testAttr: true,
      })
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState') as Mock<
        ComponentContext['updateState']
      >;

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'test-attr'], 'new', 'old');
    });
    it('updates the state when listed', async () => {
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes('testAttr')
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState') as Mock<
        ComponentContext['updateState']
      >;

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'test-attr'], 'new', 'old');
    });
    it('updates the state when single', async () => {
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes('testAttr')
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState') as Mock<
        ComponentContext['updateState']
      >;

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith([AttributePath__root, 'test-attr'], 'new', 'old');
    });
    it('updates the state with custom function', async () => {
      const updateSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes({
        testAttr: updateSpy,
      })
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith(
        context.component,
        [AttributePath__root, 'test-attr'],
        'new',
        'old',
      );
    });
    it('updates the state with custom key', async () => {
      const key = ['custom-key'];

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes({
        testAttr: key,
      })
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState') as Mock<
        ComponentContext['updateState']
      >;

      element.attributeChangedCallback!('test-attr', 'old', 'new');

      expect(updateStateSpy).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', async () => {
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Attributes({
        attr: false,
      })
      class TestComponent {}

      const element: CustomHTMLElement = new (await testElement(TestComponent))();
      const context = await ComponentSlot.of(element).whenReady;
      const updateStateSpy = jest.spyOn(context, 'updateState');

      element.attributeChangedCallback!('attr', 'old', 'new');

      expect(updateStateSpy).not.toHaveBeenCalled();
    });
  });
});
