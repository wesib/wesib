import { ContextValueSpec, SingleContextKey } from 'context-values';
import { Class, noop } from '../common';
import { BootstrapContext } from './bootstrap-context';
import { FeatureDef } from './feature-def';
import Spy = jasmine.Spy;

describe('feature/feature-def', () => {

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
            need: Feature1,
          };
        }
        class B extends A {}

        expect(FeatureDef.of(B)).toEqual(A[FeatureDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [FeatureDef.symbol]: FeatureDef = {
            need: Feature1,
          };
        }
        class B extends A {
          static [FeatureDef.symbol]: FeatureDef = {
            need: Feature2,
          };
        }

        expect<any>(FeatureDef.of(B))
            .toEqual(FeatureDef.merge(A[FeatureDef.symbol], B[FeatureDef.symbol]));
      });
    });
    describe('merge', () => {
      it('merges `need`', () => {

        const first: FeatureDef = { need: Feature1 };
        const second: FeatureDef = { need: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ need: [Feature1, Feature2]});
      });
      it('merges `has`', () => {

        const first: FeatureDef = { has: Feature1 };
        const second: FeatureDef = { has: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ has: [Feature1, Feature2]});
      });
      it('merges `set`', () => {

        const v1: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('1'),
          is: '1',
        };
        const v2: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('2'),
          is: '2',
        };

        const first: FeatureDef = { set: v1 };
        const second: FeatureDef = { set: v2 };

        expect(FeatureDef.merge(first, second)).toEqual({ set: [v1, v2]});
      });
      it('merges `init`', () => {

        const bootstrap1spy: Spy = jasmine.createSpy('first');
        const bootstrap2spy: Spy = jasmine.createSpy('second');
        const merged = FeatureDef.merge(
            { init: bootstrap1spy },
            { init: bootstrap2spy }).init || noop;
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

        const def: FeatureDef = { need: Feature1 };
        const componentType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(componentType)).toEqual(def);
      });
      it('updates component definition', () => {

        const initialDef: FeatureDef = {
          need: Feature1,
        };

        FeatureDef.define(TestFeature, initialDef);

        const def: FeatureDef = {
          need: Feature2,
        };
        const featureType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(featureType)).toEqual(FeatureDef.merge(initialDef, def));
      });
    });
  });
});
