import { WebComponent } from '../../decorators';
import { AttributeChanged } from './attribute-changed';
import { AttributesDef } from './attributes-def';

describe('features/attributes/attribute-changed', () => {
  describe('@AttributeChanged', () => {
    it('declares attribute change callback', () => {

      const attr = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @AttributeChanged()
        attr = attr;
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs.attr).toBeDefined();

      const self = new TestComponent();

      attrs.attr.call(self, 'old', 'new');

      expect(attr).toHaveBeenCalledWith('old', 'new');
      expect(attr.calls.first().object).toBe(self);
    });
    it('declares attribute with custom attribute name', () => {

      const attr = jasmine.createSpy('attrChanged');

      @WebComponent({ name: 'test-component' })
      class TestComponent {
        @AttributeChanged('my-attr')
        attr = attr;
      }

      const attrs = AttributesDef.of(TestComponent);

      expect(attrs['my-attr']).toBeDefined();

      const self = new TestComponent();

      attrs['my-attr'].call(self, 'old', 'new');

      expect(attr).toHaveBeenCalledWith('old', 'new');
      expect(attr.calls.first().object).toBe(self);
    });
    it('fails when attribute name is absent and property key is symbol', () => {

      const key = Symbol('test');
      const attr = jasmine.createSpy('attrChanged');

      expect(() => {
        @WebComponent({ name: 'test-component' })
        class TestComponent {
          @AttributeChanged()
          [key] = attr;
        }
      }).toThrowError(TypeError);
    });
  });
});
