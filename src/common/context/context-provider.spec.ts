import Spy = jasmine.Spy;
import { ContextProviderRegistry } from './context-provider';
import { SingleValueKey } from './context-value-key';

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
  });
});
