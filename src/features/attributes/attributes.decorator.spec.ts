import { StateValueKey } from '../../common';
import { Component, ComponentContext, WesComponent } from '../../component';
import { AttributesDef } from './attributes-def';
import { Attributes } from './attributes.decorator';
import SpyObj = jasmine.SpyObj;

describe('features/attributes/attributes', () => {
  describe('@Attributes', () => {

    let contextSpy: SpyObj<ComponentContext>;

    beforeEach(() => {
      contextSpy = jasmine.createSpyObj('componentContext', ['updateState']);
    });

    it('updates the state', () => {

      @WesComponent({ name: 'test-component' })
      @Attributes({
        attr: true,
      })
      class TestComponent {
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).toHaveBeenCalledWith([StateValueKey.attribute, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', () => {

      const updateSpy = jasmine.createSpy('updateState');

      @WesComponent({ name: 'test-component' })
      @Attributes({
        attr: updateSpy,
      })
      class TestComponent {
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([StateValueKey.attribute, 'attr'], 'new', 'old');
      expect(updateSpy.calls.first().object).toBe(self);
    });
    it('updates the state with custom key', () => {

      const key = ['custom-key'];

      @WesComponent({ name: 'test-component' })
      @Attributes({
        attr: key,
      })
      class TestComponent {
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', () => {

      @WesComponent({ name: 'test-component' })
      @Attributes({
        attr: false,
      })
      class TestComponent {
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).not.toHaveBeenCalled();
    });
  });
});
