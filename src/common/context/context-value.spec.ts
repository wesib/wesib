import { ContextConstDef, ContextValueDef, SingleContextKey } from './context-value';
import { ContextValues } from './context-values';

describe('common/context/context-value', () => {
  describe('ContextValueDef', () => {
    describe('of', () => {

      let context: ContextValues;

      beforeEach(() => {
        context = { name: 'context values' } as any;
      });

      it('uses context value definition as is', () => {

        const spec: ContextValueDef<ContextValues, string> = {
          a: new SingleContextKey<string>('value'),
          by: () => 'foo',
        };

        expect(ContextValueDef.of(spec)).toBe(spec);
      });
      it('converts context constant to definition', () => {

        const spec: ContextConstDef<ContextValues, string> = {
          a: new SingleContextKey<string>('value'),
          as: 'foo',
        };
        const def = ContextValueDef.of(spec);

        expect(def.a).toBe(spec.a);
        expect(def.by(context)).toBe(spec.as);
      });
    });
  });
});
