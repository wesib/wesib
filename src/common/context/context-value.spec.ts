import { ContextConstDef, ContextValueDef, SingleValueKey } from './context-value';
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
          provide: new SingleValueKey<string>('value'),
          provider: () => 'foo',
        };

        expect(ContextValueDef.of(spec)).toBe(spec);
      });
      it('converts context constant to definition', () => {

        const spec: ContextConstDef<ContextValues, string> = {
          provide: new SingleValueKey<string>('value'),
          value: 'foo',
        };
        const def = ContextValueDef.of(spec);

        expect(def.provide).toBe(spec.provide);
        expect(def.provider(context)).toBe(spec.value);
      });
    });
  });
});
