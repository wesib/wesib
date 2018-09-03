import Spy = jasmine.Spy;
import { noop } from '../functions';
import { ContextProviderRegistry } from './context-provider';
import { MultiValueKey, SingleValueKey } from './context-value-key';

describe('common/context/context-provider', () => {
  describe('ContextProviderRegistry', () => {

    const key = new SingleValueKey<string>('test-key');
    let registry: ContextProviderRegistry<object>;
    let providerSpy: Spy;
    let context: object;

    beforeEach(() => {
      registry = new ContextProviderRegistry();
      providerSpy = jasmine.createSpy('provider');
      registry.provide(key, providerSpy);
      context = { name: 'context' } as any;
    });

    it('does not provide any value if there is no provider', () => {
      expect(registry.get(new SingleValueKey(key.name), context)).toBeUndefined();
    });
    it('does not provide any value if provider did not provide any value', () => {
      expect(registry.get(key, context)).toBeUndefined();
    });
    it('provides the value', () => {

      const value = 'test value';

      providerSpy.and.returnValue(value);

      expect(registry.get(key, context)).toBe(value);
    });
    it('provides default value if there is no provider', () => {

      const defaultValue = 'default';
      const keyWithDefaults = new SingleValueKey(key.name, defaultValue);

      expect(registry.get(keyWithDefaults, context)).toBe(defaultValue);
    });
    it('provides default value if provider did not provide any value', () => {

      const defaultValue = 'default';
      const keyWithDefaults = new SingleValueKey(key.name, defaultValue);

      registry.provide(keyWithDefaults, () => null);

      expect(registry.get(keyWithDefaults, context)).toBe(defaultValue);
    });

    describe('providers combination', () => {

      let provider2Spy: Spy;

      beforeEach(() => {
        provider2Spy = jasmine.createSpy('provider2');
        registry.provide(key, provider2Spy);
      });

      it('provides the first constructed value', () => {
        providerSpy.and.returnValue('value1');
        provider2Spy.and.returnValue('value2');

        expect(registry.get(key, context)).toBe('value1');
      });
      it('provides the second constructed value if the first one is undefined', () => {
        provider2Spy.and.returnValue('value2');

        expect(registry.get(key, context)).toBe('value2');
      });
      it('provides the second constructed value if the first one is null', () => {
        providerSpy.and.returnValue(null);
        provider2Spy.and.returnValue('value2');

        expect(registry.get(key, context)).toBe('value2');
      });
    });
    describe('multi-value', () => {

      let multiKey: MultiValueKey<string>;

      beforeEach(() => {
        multiKey = new MultiValueKey('values');
      });

      it('is associated with empty array by default', () => {
        expect(registry.get(multiKey, context)).toEqual([]);
      });
      it('is associated with empty array if providers did not return any values', () => {
        registry.provide(multiKey, () => null);
        registry.provide(multiKey, () => undefined);

        expect(registry.get(multiKey, context)).toEqual([]);
      });
      it('is associated with default value if there is no provider', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', defaultValue);

        expect(registry.get(keyWithDefaults, context)).toEqual(defaultValue);
      });
      it('is associated with default value if providers did not return any values', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', defaultValue);

        registry.provide(keyWithDefaults, () => null);
        registry.provide(keyWithDefaults, () => undefined);

        expect(registry.get(keyWithDefaults, context)).toEqual(defaultValue);
      });
      it('is associated with provided values array', () => {
        registry.provide(multiKey, () => 'a');
        registry.provide(multiKey, () => undefined);
        registry.provide(multiKey, () => 'c');

        expect(registry.get(multiKey, context)).toEqual(['a', 'c']);
      });
    });
  });
});
