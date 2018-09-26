import { ContextValueDefaultHandler, MultiValueKey, SingleValueKey } from './context-value';
import { ContextValueRegistry } from './context-value-registry';
import { ContextValues } from './context-values';
import Spy = jasmine.Spy;

describe('common/context/context-value-registry', () => {
  describe('ContextValueRegistry', () => {

    const key = new SingleValueKey<string>('test-key');
    let registry: ContextValueRegistry<ContextValues>;
    let providerSpy: Spy;
    let context: ContextValues;
    let handleDefault: ContextValueDefaultHandler<any>;

    beforeEach(() => {
      registry = new ContextValueRegistry();
      providerSpy = jasmine.createSpy('provider');
      registry.provide(key, providerSpy);
      context = { name: 'context' } as any;
      handleDefault = defaultProvider => defaultProvider();
    });

    it('does not provide any value if there is no provider', () => {
      expect(registry.get(new SingleValueKey(key.name), context, handleDefault)).toBeUndefined();
    });
    it('does not provide any value if provider did not provide any value', () => {
      expect(registry.get(key, context, handleDefault)).toBeUndefined();
    });
    it('provides the value', () => {

      const value = 'test value';

      providerSpy.and.returnValue(value);

      expect(registry.get(key, context, handleDefault)).toBe(value);
    });
    it('provides default value if there is no provider', () => {

      const defaultValue = 'default';
      const keyWithDefaults = new SingleValueKey(key.name, () => defaultValue);

      expect(registry.get(keyWithDefaults, context, handleDefault)).toBe(defaultValue);
    });
    it('provides default value if provider did not provide any value', () => {

      const defaultValue = 'default';
      const keyWithDefaults = new SingleValueKey(key.name, () => defaultValue);

      registry.provide(keyWithDefaults, () => null);

      expect(registry.get(keyWithDefaults, context, handleDefault)).toBe(defaultValue);
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

        expect(registry.get(key, context, handleDefault)).toBe('value2');
      });
      it('provides the first constructed value if the second one is undefined', () => {
        providerSpy.and.returnValue('value1');

        expect(registry.get(key, context, handleDefault)).toBe('value1');
      });
      it('provides the first constructed value if the second one is null', () => {
        providerSpy.and.returnValue('value1');
        provider2Spy.and.returnValue(null);

        expect(registry.get(key, context, handleDefault)).toBe('value1');
      });
    });

    describe('Chained registry', () => {

      let chained: ContextValueRegistry<ContextValues>;
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

        expect(chained.get(key, context, handleDefault)).toBe(value2);
      });
      it('falls back to initial value', () => {

        const value1 = 'initial value';

        providerSpy.and.returnValue(value1);

        chained.provide(key, provider2Spy);
        provider2Spy.and.returnValue(null);

        expect(chained.get(key, context, handleDefault)).toBe(value1);
      });
    });

    describe('Multi-value', () => {

      let multiKey: MultiValueKey<string>;

      beforeEach(() => {
        multiKey = new MultiValueKey('values');
      });

      it('is associated with empty array by default', () => {
        expect(registry.get(multiKey, context, handleDefault)).toEqual([]);
      });
      it('is associated with empty array if providers did not return any values', () => {
        registry.provide(multiKey, () => null);
        registry.provide(multiKey, () => undefined);

        expect(registry.get(multiKey, context, handleDefault)).toEqual([]);
      });
      it('is associated with default value if there is no provider', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', () => defaultValue);

        expect(registry.get(keyWithDefaults, context, handleDefault)).toEqual(defaultValue);
      });
      it('is associated with default value if providers did not return any values', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', () => defaultValue);

        registry.provide(keyWithDefaults, () => null);
        registry.provide(keyWithDefaults, () => undefined);

        expect(registry.get(keyWithDefaults, context, handleDefault)).toEqual(defaultValue);
      });
      it('is associated with provided values array', () => {
        registry.provide(multiKey, () => 'a');
        registry.provide(multiKey, () => undefined);
        registry.provide(multiKey, () => 'c');

        expect(registry.get(multiKey, context, handleDefault)).toEqual(['a', 'c']);
      });
    });

    describe('append', () => {

      let registry2: ContextValueRegistry<ContextValues>;
      let combined: ContextValueRegistry<ContextValues>;

      beforeEach(() => {
        registry2 = new ContextValueRegistry();
        combined = registry.append(registry2);
      });

      it('contains all sources', () => {
        providerSpy.and.returnValue('1');
        registry2.provide(key, () => '2');
        registry2.provide(key, () => '3');
        expect([...combined.sources(context, key)]).toEqual(['1', '2', '3']);
      });
      it('contains reverted sources', () => {
        providerSpy.and.returnValue('1');
        registry2.provide(key, () => '2');
        registry2.provide(key, () => '3');
        expect([...combined.sources(context, key).reverse()]).toEqual(['3', '2', '1']);
      });
    });

    describe('Values', () => {

      let values: ContextValues;

      beforeEach(() => {
        values = registry.values;
      });

      it('is singleton instance', () => {
        expect(registry.values).toBe(values);
      });
      it('return associated value', () => {
        providerSpy.and.returnValue('value');

        expect(values.get(key)).toBe('value');
      });
      it('throw if there is no default value', () => {
        expect(() => values.get(new SingleValueKey(key.name))).toThrowError();
      });
      it('return default value is there is no value', () => {
        expect(values.get(new SingleValueKey<string>(key.name), 'default')).toBe('default');
      });
      it('return key default value is there is no value', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'))).toBe('default');
      });
      it('prefer explicit default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'key default'), 'explicit default'))
            .toBe('explicit default');
      });
      it('prefer explicit `null` default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'), null))
            .toBeNull();
      });
      it('prefer explicit `undefined` default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'), undefined))
            .toBeUndefined();
      });
      it('caches the value', () => {

        const value = 'value';
        providerSpy.and.returnValue(value);

        expect(values.get(key)).toBe(value);
        expect(values.get(key)).toBe(value);

        expect(providerSpy).toHaveBeenCalledTimes(1);
      });
      it('caches default key value', () => {

        const value = 'default value';
        const defaultProviderSpy = jasmine.createSpy('default').and.returnValue(value);
        const keyWithDefault = new SingleValueKey('key-with-default', defaultProviderSpy);

        expect(values.get(keyWithDefault)).toBe(value);
        expect(values.get(keyWithDefault)).toBe(value);
        expect(defaultProviderSpy).toHaveBeenCalledTimes(1);
      });
      it('does not cache explicit default value', () => {

        const value1 = 'value1';
        const value2 = 'value2';

        expect(values.get(key, value1)).toBe(value1);
        expect(values.get(key, value2)).toBe(value2);
      });

      describe('on multi-value', () => {

        const mvKey = new MultiValueKey<string>('test-mv-key');

        beforeEach(() => {
          providerSpy = jasmine.createSpy('mvProvider');
          registry.provide(mvKey, providerSpy);
        });

        it('return associated value', () => {
          providerSpy.and.returnValue('value');

          expect(values.get(mvKey)).toEqual(['value']);
        });
        it('throw if there is no default value', () => {
          expect(() => values.get(new MultiValueKey(mvKey.name, () => null))).toThrowError();
        });
        it('return empty array by default', () => {
          expect(values.get(new MultiValueKey(mvKey.name))).toEqual([]);
        });
        it('return default value is there is no value', () => {
          expect(values.get(new MultiValueKey<string>(mvKey.name), ['default'])).toEqual(['default']);
        });
        it('return key default value is there is no value', () => {
          expect(values.get(new MultiValueKey<string>(mvKey.name, () => ['default']))).toEqual(['default']);
        });
        it('prefer explicit default value over key one', () => {
          expect(values.get(new MultiValueKey<string>(mvKey.name, () => ['key', 'default']), ['explicit', 'default']))
              .toEqual(['explicit', 'default']);
        });
        it('prefer explicit `null` default value over key one', () => {
          expect(values.get(new MultiValueKey<string>(mvKey.name, () => ['key', 'default']), null))
              .toBeNull();
        });
        it('prefer explicit `undefined` default value over key one', () => {
          expect(values.get(new MultiValueKey<string>(mvKey.name, () => ['key', 'default']), undefined))
              .toBeUndefined();
        });
      });
    });
  });
});
