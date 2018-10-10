import { Class, ContextValueSpec, noop, SingleValueKey } from '../common';
import { BootstrapContext } from './bootstrap-context';
import { FeatureDef } from './feature';
import Spy = jasmine.Spy;

describe('feature/feature', () => {

  class Feature1 {}
  class Feature2 {}

  describe('FeatureDef', () => {
    describe('of', () => {
      it('extracts feature definition', () => {

        class TestFeature {
          static [FeatureDef.symbol]: FeatureDef = { name: 'feature definition' } as any;
        }

        expect(FeatureDef.of(TestFeature)).toBe(TestFeature[FeatureDef.symbol]);
      });
      it('builds empty feature definition if it is absent', () => {

        class TestFeature {}

        expect(FeatureDef.of(TestFeature)).toEqual({});
      });
      it('requests inherited definition', () => {

        class A {
          static [FeatureDef.symbol]: FeatureDef = {
            require: Feature1,
          };
        }
        class B extends A {}

        expect(FeatureDef.of(B)).toEqual(A[FeatureDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [FeatureDef.symbol]: FeatureDef = {
            require: Feature1,
          };
        }
        class B extends A {
          static [FeatureDef.symbol]: FeatureDef = {
            require: Feature2,
          };
        }

        expect<any>(FeatureDef.of(B))
            .toEqual(FeatureDef.merge(A[FeatureDef.symbol], B[FeatureDef.symbol]));
      });
    });
    describe('merge', () => {
      it('merges `require`', () => {

        const first: FeatureDef = { require: Feature1 };
        const second: FeatureDef = { require: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ require: [Feature1, Feature2]});
      });
      it('merges `provide`', () => {

        const first: FeatureDef = { provide: Feature1 };
        const second: FeatureDef = { provide: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ provide: [Feature1, Feature2]});
      });
      it('merges `prebootstrap`', () => {

        const v1: ContextValueSpec<BootstrapContext, string> = {
          provide: new SingleValueKey<string>('1'),
          value: '1',
        };
        const v2: ContextValueSpec<BootstrapContext, string> = {
          provide: new SingleValueKey<string>('2'),
          value: '2',
        };

        const first: FeatureDef = { prebootstrap: v1 };
        const second: FeatureDef = { prebootstrap: v2 };

        expect(FeatureDef.merge(first, second)).toEqual({ prebootstrap: [v1, v2]});
      });
      it('merges `bootstrap`', () => {

        const bootstrap1spy: Spy = jasmine.createSpy('first');
        const bootstrap2spy: Spy = jasmine.createSpy('second');
        const merged = FeatureDef.merge(
            { bootstrap: bootstrap1spy },
            { bootstrap: bootstrap2spy }).bootstrap || noop;
        const context: BootstrapContext = { name: 'bootstrap context' } as any;

        class Feature {}

        merged.call(Feature, context);

        expect(bootstrap1spy).toHaveBeenCalledWith(context);
        expect(bootstrap1spy.calls.first().object).toBe(Feature);
        expect(bootstrap2spy).toHaveBeenCalledWith(context);
        expect(bootstrap2spy.calls.first().object).toBe(Feature);
      });
      it('does not merge empty definitions', () => {
        expect(FeatureDef.merge({}, {})).toEqual({});
      });
    });
    describe('define', () => {

      let TestFeature: Class;

      beforeEach(() => {
        TestFeature = class {
        };
      });

      it('assigns feature definition', () => {

        const def: FeatureDef = { require: [Feature1] };
        const componentType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(componentType)).toEqual(def);
      });
      it('updates component definition', () => {

        const initialDef: FeatureDef = {
          require: Feature1,
        };

        FeatureDef.define(TestFeature, initialDef);

        const def: FeatureDef = {
          require: Feature2,
        };
        const featureType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(featureType)).toEqual(FeatureDef.merge(initialDef, def));
      });
    });
  });
});
