import { noop, StateValueKey } from '../../common';
import { ComponentContext } from '../../component';
import { WebComponent } from '../../decorators';
import { AttributeChanged } from './attribute-changed';
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

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged()
        attr = attrSpy;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent(contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(self);
    });
    it('updates the state', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged({})
        attr = noop;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent(contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).toHaveBeenCalledWith([StateValueKey.attribute, 'attr'], 'new', 'old');
    });
    it('updates the state with custom function', () => {

      const updateSpy = jasmine.createSpy('updateState');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged({ updateState: updateSpy })
        attr = noop;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent(contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.updateState).not.toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalledWith([StateValueKey.attribute, 'attr'], 'new', 'old');
      expect(updateSpy.calls.first().object).toBe(self);
    });
    it('disables state update', () => {

      const notifySpy = jasmine.createSpy('notify');
      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged({ updateState: false })
        attr = attrSpy;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent(contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(attrSpy).toHaveBeenCalledWith('new', 'old');
      expect(attrSpy.calls.first().object).toBe(self);
      expect(notifySpy).not.toHaveBeenCalled();
    });
    it('declares attribute with custom attribute name', () => {

      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged('my-attr')
        attr = attrSpy;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs['my-attr']).toBeDefined();

      const self = new TestComponent(contextSpy);

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
