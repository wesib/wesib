import { MultiValueKey, SingleValueKey } from './context-value-key';
import { ContextValueRegistry } from './context-value-provider';
import Spy = jasmine.Spy;

describe('common/context/context-provider', () => {
  describe('ContextValueRegistry', () => {

    const key = new SingleValueKey<string>('test-key');
    let registry: ContextValueRegistry<object>;
    let providerSpy: Spy;
    let context: object;

    beforeEach(() => {
      registry = new ContextValueRegistry();
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

    describe('Providers combination', () => {

      let provider2Spy: Spy;

      beforeEach(() => {
        provider2Spy = jasmine.createSpy('provider2');
        registry.provide(key, provider2Spy);
      });

      it('provides the last constructed value', () => {
        providerSpy.and.returnValue('value1');
        provider2Spy.and.returnValue('value2');

        expect(registry.get(key, context)).toBe('value2');
      });
      it('provides the first constructed value if the second one is undefined', () => {
        providerSpy.and.returnValue('value1');

        expect(registry.get(key, context)).toBe('value1');
      });
      it('provides the first constructed value if the second one is null', () => {
        providerSpy.and.returnValue('value1');
        provider2Spy.and.returnValue(null);

        expect(registry.get(key, context)).toBe('value1');
      });
    });

    describe('Chained registry', () => {

      let chained: ContextValueRegistry<object>;
      let provider2Spy: Spy;

      beforeEach(() => {
        chained = new ContextValueRegistry(registry.bindSources(context));
        provider2Spy = jasmine.createSpy('provider2');
      });

      it('prefers explicit value', () => {

        const value1 = 'initial value';
        const value2 = 'actual value';

        providerSpy.and.returnValue(value1);

        chained.provide(key, provider2Spy);
        provider2Spy.and.returnValue(value2);

        expect(chained.get(key, context)).toBe(value2);
      });
      it('falls back to initial value', () => {

        const value1 = 'initial value';

        providerSpy.and.returnValue(value1);

        chained.provide(key, provider2Spy);
        provider2Spy.and.returnValue(null);

        expect(chained.get(key, context)).toBe(value1);
      });
    });

    describe('Multi-value', () => {

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
