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
        @AttributeChanged()
        attr = attrSpy;
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent();

      attrs.attr.call(self, 'old', 'new', contextSpy);

      expect(attrSpy).toHaveBeenCalledWith('old', 'new', contextSpy);
      expect(attrSpy.calls.first().object).toBe(self);
    });
    it('refreshes the state', () => {

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @AttributeChanged({})
        attr = noop;
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent();

      attrs.attr.call(self, 'old', 'new', contextSpy);

      expect(contextSpy.refreshState).toHaveBeenCalledWith();
    });
    it('disables state refresh', () => {

      const notifySpy = jasmine.createSpy('notify');
      const attrSpy = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @AttributeChanged({ refreshState: false })
        attr = attrSpy;
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent();

      attrs.attr.call(self, 'old', 'new', contextSpy);

      expect(attrSpy).toHaveBeenCalledWith('old', 'new', contextSpy);
      expect(attrSpy.calls.first().object).toBe(self);
      expect(notifySpy).not.toHaveBeenCalled();
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

      const self = new TestComponent();

      attrs['my-attr'].call(self, 'old', 'new', contextSpy);

      expect(attrSpy).toHaveBeenCalledWith('old', 'new', contextSpy);
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
