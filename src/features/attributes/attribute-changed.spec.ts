import { noop } from '../../common';
import { ComponentContext } from '../../component';
import { WebComponent } from '../../decorators';
import { AttributeChanged } from './attribute-changed';
import { AttributesDef } from './attributes-def';
import SpyObj = jasmine.SpyObj;

describe('features/attributes/attribute-changed', () => {
  describe('@AttributeChanged', () => {

    let contextSpy: SpyObj<ComponentContext>;

    beforeEach(() => {
      contextSpy = jasmine.createSpyObj('componentContext', ['refreshState']);
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
    it('refreshes the state', () => {

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

      expect(contextSpy.refreshState).toHaveBeenCalledWith('attr:attr', 'new', 'old');
    });
    it('refreshes the state with custom state refresh function', () => {

      const refreshSpy = jasmine.createSpy('refresh');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged({ refreshState: refreshSpy })
        attr = noop;

        constructor(context: ComponentContext) {
          this[ComponentContext.symbol] = context;
        }

      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent(contextSpy);

      attrs.attr.call(self, 'new', 'old');

      expect(contextSpy.refreshState).not.toHaveBeenCalled();
      expect(refreshSpy).toHaveBeenCalledWith('attr', 'new', 'old');
      expect(refreshSpy.calls.first().object).toBe(self);
    });
    it('disables state refresh', () => {

      const notifySpy = jasmine.createSpy('notify');
      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {

        readonly [ComponentContext.symbol]: ComponentContext;

        @AttributeChanged({ refreshState: false })
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
