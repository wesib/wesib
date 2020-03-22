import { ContextRegistry, ContextValues, SingleContextKey } from '@proc7ts/context-values';
import { BootstrapContext } from './bootstrap-context';
import { bootstrapDefault } from './bootstrap-default';

describe('boot', () => {
  describe('bootstrapDefault', () => {

    let values: ContextValues;
    let bootstrapContext: BootstrapContext;
    let valueKey: SingleContextKey<string>;

    beforeEach(() => {

      const bootstrapRegistry = new ContextRegistry();
      const bootstrapValues = bootstrapRegistry.newValues();

      bootstrapContext = {
        get: bootstrapValues.get,
      } as any;

      bootstrapRegistry.provide({ a: BootstrapContext, is: bootstrapContext });

      const registry = new ContextRegistry(bootstrapValues);

      values = registry.newValues();

      valueKey = new SingleContextKey<string>('value');
      registry.provide({ a: valueKey, is: 'value' });
      bootstrapRegistry.provide({ a: valueKey, is: 'bootstrap' });
    });

    let key: SingleContextKey<string>;

    beforeEach(() => {
      key = new SingleContextKey<string>(
          'test',
          {
            byDefault: bootstrapDefault(bsContext => bsContext.get(valueKey)),
          },
      );
    });

    it('requests bootstrap value from derived context', () => {
      expect(values.get(key)).toBe('bootstrap');
    });
    it('requests bootstrap value from bootstrap context', () => {
      expect(bootstrapContext.get(key)).toBe('bootstrap');
    });
  });
});
