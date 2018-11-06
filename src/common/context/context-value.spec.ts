import { ContextValueSpec, SingleContextKey } from './context-value';
import { ContextValues } from './context-values';

describe('common/context/context-value', () => {
  describe('ContextValueSpec', () => {
    describe('of', () => {

      let context: ContextValues;

      beforeEach(() => {
        context = { name: 'context values' } as any;
      });

      it('uses context value definition as is', () => {

        const spec: ContextValueSpec.ByProvider<ContextValues, string> = {
          a: new SingleContextKey<string>('value'),
          by: () => 'foo',
        };

        expect(ContextValueSpec.of(spec)).toBe(spec);
      });
      it('converts context constant to definition', () => {

        const spec: ContextValueSpec.IsConstant<ContextValues, string> = {
          a: new SingleContextKey<string>('value'),
          is: 'foo',
        };
        const def = ContextValueSpec.of(spec);

        expect(def.a).toBe(spec.a);
        expect(def.by(context)).toBe(spec.is);
      });
    });
  });
});
