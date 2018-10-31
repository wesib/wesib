import {
  field2accessor,
  isPropertyAccessorDescriptor,
  PropertyAccessorDescriptor,
  toPropertyAccessorDescriptor,
} from './reflect';

describe('common/reflect', () => {
  describe('field2accessor', () => {

    let target: { a: string };
    let desc: PropertyDescriptor;

    beforeEach(() => {
      target = { a: 'value' };
      desc = field2accessor(target, 'a');
    });

    it('converts field to accessor', () => {
      expect(Object.getOwnPropertyDescriptor(target, 'a')).toEqual(desc);
    });
    it('converts to configurable property', () => {
      expect(desc.configurable).toBe(true);
    });
    it('converts to enumerable property', () => {
      expect(desc.enumerable).toBe(true);
    });
    it('preserves the value', () => {
      expect(target.a).toBe('value');
    });
    it('allows to set the value', () => {

      const newValue = 'other';

      target.a = newValue;
      expect(target.a).toBe(newValue);
    });
  });
  describe('isPropertyAccessorDescriptor', () => {
    it('detect property accessor', () => {
      expect(isPropertyAccessorDescriptor({})).toBe(true);
    });
    it('detect data property', () => {
      expect(isPropertyAccessorDescriptor({ value: null })).toBe(false);
      expect(isPropertyAccessorDescriptor({ writable: false })).toBe(false);
    });
  });
  describe('toPropertyAccessorDescriptor', () => {
    it('does not modify property accessor descriptor', () => {

      const desc: PropertyAccessorDescriptor<string> = {
        get() {
          return 'value';
        },
      };

      expect(toPropertyAccessorDescriptor(desc)).toBe(desc);
    });
    it('converts read-only data property descriptor to property accessor one', () => {

      const target = {};
      const value = 'abc';
      const dataDesc: TypedPropertyDescriptor<string> = { value };
      const desc = toPropertyAccessorDescriptor(dataDesc);

      expect(desc.set).toBeUndefined();
      expect(desc.get).toEqual(jasmine.any(Function));

      const getter = desc.get!;

      expect(getter.call(target)).toBe(value);
    });
    it('converts writable data property descriptor to property accessor one', () => {

      const target = {};
      const value = 'abc';
      const dataDesc: TypedPropertyDescriptor<string> = {
        value,
        writable: true,
      };
      const desc = toPropertyAccessorDescriptor(dataDesc);

      expect(desc.set).toEqual(jasmine.any(Function));
      expect(desc.get).toEqual(jasmine.any(Function));

      const getter = desc.get!;
      const setter = desc.set!;

      expect(getter.call(target)).toBe(value);

      const newValue = 'def';

      setter.call(target, newValue);

      expect(getter.call(target)).toBe(newValue);
    });
  });
});
