import { noop, StateValueKey } from '../../common';
import { Component, ComponentContext, WebComponent } from '../../component';
import { AttributeChanged } from './attribute-changed.decorator';
import { AttributesDef } from './attributes-def';
import SpyObj = jasmine.SpyObj;

describe('features/attributes/attribute-changed', () => {
  describe('@AttributeChanged', () => {

    let contextSpy: SpyObj<ComponentContext>;

    beforeEach(() => {
      contextSpy = jasmine.createSpyObj('componentContext', ['updateState']);
    });

    it('declares attribute change callback', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged()
        attr = attrSpy;

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const component = Component.create(TestComponent, contextSpy);

      attrs.attr.call(component, 'new', 'old');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(component);
    });
    it('updates the state', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged({})
        attr = noop;

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).toHaveBeenCalledWith([StateValueKey.attribute, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', () => {

      const updateSpy = jasmine.createSpy('updateState');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged({ updateState: updateSpy })
        attr = noop;

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

      const key = ['attr-key'];

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged({ name: 'my-attr', updateState: key })
        attr = noop;

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs['my-attr']).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs['my-attr'].call(self, 'new', 'old');

      expect(contextSpy.updateState).toHaveBeenCalledWith(key, 'new', 'old');
    });
    it('disables state update', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged({ updateState: false })
        attr = attrSpy;

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(self);
      expect(contextSpy.updateState).not.toHaveBeenCalled();
    });
    it('declares attribute with custom attribute name', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        @AttributeChanged('my-attr')
        attr = attrSpy;

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs['my-attr']).toBeDefined();

      const self = Component.create(TestComponent, contextSpy);

      attrs['my-attr'].call(self, 'new', 'old');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(self);
    });
    it('fails when attribute name is absent and property key is symbol', () => {

      const key = Symbol('test');
      const attrSpy = jasmine.createSpy('attrChanged');

      expect(() => {
        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @AttributeChanged()
          [key] = attrSpy;
        }
      }).toThrowError(TypeError);
    });
  });
});
