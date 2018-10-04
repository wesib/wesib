import { MultiValueKey, SingleValueKey } from './context-value';
import { ContextValueRegistry } from './context-value-registry';
import { ContextValues } from './context-values';
import Spy = jasmine.Spy;

describe('common/context/context-value-registry', () => {
  describe('ContextValueRegistry', () => {

    const key = new SingleValueKey<string>('test-key');
    let registry: ContextValueRegistry<ContextValues>;
    let values: ContextValues;
    let providerSpy: Spy;

    beforeEach(() => {
      registry = new ContextValueRegistry();
      values = registry.newValues();
      providerSpy = jasmine.createSpy('provider');
      registry.provide(key, providerSpy);
    });

    describe('Single value', () => {
      it('is associated with provided value', () => {

        const value = 'test value';

        providerSpy.and.returnValue(value);

        expect(values.get(key)).toBe(value);
      });
      it('throws if there is no default value', () => {
        expect(() => values.get(new SingleValueKey(key.name))).toThrowError();
      });
      it('provides default value is there is no provider', () => {
        expect(values.get(new SingleValueKey<string>(key.name), 'default')).toBe('default');
      });
      it('provides default value if provider did not provide any value', () => {

        const defaultValue = 'default';
        const keyWithDefaults = new SingleValueKey(key.name, () => defaultValue);

        registry.provide(keyWithDefaults, () => null);

        expect(values.get(keyWithDefaults)).toBe(defaultValue);
      });
      it('is associated with default value is there is no provider', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'))).toBe('default');
      });
      it('prefers explicit default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'key default'), 'explicit default'))
            .toBe('explicit default');
      });
      it('prefers explicit `null` default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'), null))
            .toBeNull();
      });
      it('prefers explicit `undefined` default value over key one', () => {
        expect(values.get(new SingleValueKey<string>(key.name, () => 'default'), undefined))
            .toBeUndefined();
      });
      it('caches value sources', () => {

        const value = 'test value';

        providerSpy.and.returnValue(value);

        expect([...values.get(key.sourcesKey)]).toEqual([value]);
        expect(values.get(key)).toBe(value);

        providerSpy.and.returnValue('other');

        expect([...values.get(key.sourcesKey)]).toEqual([value]);
        expect(values.get(key)).toBe(value);
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
    });

    describe('Multi-value', () => {

      let multiKey: MultiValueKey<string>;

      beforeEach(() => {
        multiKey = new MultiValueKey('values');
      });

      it('is associated with empty array by default', () => {
        expect(values.get(multiKey)).toEqual([]);
      });
      it('is associated with empty array if providers did not return any values', () => {
        registry.provide(multiKey, () => null);
        registry.provide(multiKey, () => undefined);

        expect(values.get(multiKey)).toEqual([]);
      });
      it('is associated with default value if there is no provider', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', () => defaultValue);

        expect(values.get(keyWithDefaults)).toEqual(defaultValue);
      });
      it('is associated with default value if providers did not return any values', () => {

        const defaultValue = ['default'];
        const keyWithDefaults = new MultiValueKey('key', () => defaultValue);

        registry.provide(keyWithDefaults, () => null);
        registry.provide(keyWithDefaults, () => undefined);

        expect(values.get(keyWithDefaults)).toEqual(defaultValue);
      });
      it('is associated with provided values array', () => {
        registry.provide(multiKey, () => 'a');
        registry.provide(multiKey, () => undefined);
        registry.provide(multiKey, () => 'c');

        expect(values.get(multiKey)).toEqual(['a', 'c']);
      });
      it('is associated with value', () => {
        registry.provide(multiKey, () => 'value');

        expect(values.get(multiKey)).toEqual(['value']);
      });
      it('throws if there is no default value', () => {
        expect(() => values.get(new MultiValueKey(multiKey.name, () => null))).toThrowError();
      });
      it('is associated with empty array by default', () => {
        expect(values.get(new MultiValueKey(multiKey.name))).toEqual([]);
      });
      it('is associated with default value is there is no value', () => {
        expect(values.get(new MultiValueKey<string>(multiKey.name), ['default'])).toEqual(['default']);
      });
      it('is associated with key default value is there is no value', () => {
        expect(values.get(new MultiValueKey<string>(multiKey.name, () => ['default']))).toEqual(['default']);
      });
      it('prefers explicit default value over key one', () => {
        expect(values.get(new MultiValueKey<string>(multiKey.name, () => ['key', 'default']), ['explicit', 'default']))
            .toEqual(['explicit', 'default']);
      });
      it('prefers explicit `null` default value over key one', () => {
        expect(values.get(new MultiValueKey<string>(multiKey.name, () => ['key', 'default']), null))
            .toBeNull();
      });
      it('prefers explicit `undefined` default value over key one', () => {
        expect(values.get(new MultiValueKey<string>(multiKey.name, () => ['key', 'default']), undefined))
            .toBeUndefined();
      });
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

        expect(values.get(key)).toBe('value2');
      });
      it('provides the first constructed value if the second one is undefined', () => {
        providerSpy.and.returnValue('value1');

        expect(values.get(key)).toBe('value1');
      });
      it('provides the first constructed value if the second one is null', () => {
        providerSpy.and.returnValue('value1');
        provider2Spy.and.returnValue(null);

        expect(values.get(key)).toBe('value1');
      });
    });

    describe('Chained registry', () => {

      let chained: ContextValueRegistry<ContextValues>;
      let chainedValues: ContextValues;
      let provider2Spy: Spy;
      let context: ContextValues;

      beforeEach(() => {
        context = { name: 'context' } as any;
        chained = new ContextValueRegistry(registry.bindSources(context));
        chainedValues = chained.newValues();
        provider2Spy = jasmine.createSpy('provider2');
      });

      it('prefers explicit value', () => {

        const value1 = 'initial value';
        const value2 = 'actual value';

        providerSpy.and.returnValue(value1);

        chained.provide(key, provider2Spy);
        provider2Spy.and.returnValue(value2);

        expect(chainedValues.get(key)).toBe(value2);
      });
      it('falls back to initial value', () => {

        const value1 = 'initial value';

        providerSpy.and.returnValue(value1);

        chained.provide(key, provider2Spy);
        provider2Spy.and.returnValue(null);

        expect(chainedValues.get(key)).toBe(value1);
      });
    });

    describe('append', () => {

      let registry2: ContextValueRegistry<ContextValues>;
      let combined: ContextValueRegistry<ContextValues>;
      let context: ContextValues;

      beforeEach(() => {
        registry2 = new ContextValueRegistry();
        combined = registry.append(registry2);
        context = { name: 'context' } as any;
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

  });
});