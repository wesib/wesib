import { ComponentDef } from '../component';
import { noop } from '../util';
import { BootstrapContext } from './bootstrap-context';
import { FeatureDef, FeatureType } from './feature';
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
            requires: Feature1,
          };
        }
        class B extends A {}

        expect(FeatureDef.of(B)).toEqual(A[FeatureDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [FeatureDef.symbol]: FeatureDef = {
            requires: Feature1,
          };
        }
        class B extends A {
          static [FeatureDef.symbol]: FeatureDef = {
            requires: Feature2,
          };
        }

        expect<any>(FeatureDef.of(B))
            .toEqual(FeatureDef.merge(A[FeatureDef.symbol], B[FeatureDef.symbol]));
      });
    });
    describe('merge', () => {
      it('merges requirements', () => {

        const first: FeatureDef = { requires: Feature1 };
        const second: FeatureDef = { requires: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ requires: [Feature1, Feature2]});
      });
      it('merges provides', () => {

        const first: FeatureDef = { provides: Feature1 };
        const second: FeatureDef = { provides: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ provides: [Feature1, Feature2]});
      });
      it('merges configuration function', () => {

        const configure1spy: Spy = jasmine.createSpy('first');
        const configure2spy: Spy = jasmine.createSpy('second');
        const merged = FeatureDef.merge(
            { configure: configure1spy },
            { configure: configure2spy }).configure || noop;
        const context: BootstrapContext = { name: 'bootstrap context' } as any;

        class Feature {}

        merged.call(Feature, context);

        expect(configure1spy).toHaveBeenCalledWith(context);
        expect(configure1spy.calls.first().object).toBe(Feature);
        expect(configure2spy).toHaveBeenCalledWith(context);
        expect(configure2spy.calls.first().object).toBe(Feature);
      });
      it('does not merge empty definitions', () => {
        expect(FeatureDef.merge({}, {})).toEqual({});
      });
    });
  });
  describe('FeatureType', () => {
    describe('define', () => {

      let TestFeature: FeatureType;

      beforeEach(() => {
        TestFeature = class {
        };
      });

      it('assigns feature definition', () => {

        const def: FeatureDef = { requires: [Feature1] };
        const componentType = FeatureType.define(TestFeature, def);

        expect(FeatureDef.of(componentType)).toEqual(def);
      });
      it('updates component definition', () => {

        const initialDef: FeatureDef = {
          requires: Feature1,
        };

        FeatureType.define(TestFeature, initialDef);

        const def: FeatureDef = {
          requires: Feature2,
        };
        const featureType = FeatureType.define(TestFeature, def);

        expect(FeatureDef.of(featureType)).toEqual(FeatureDef.merge(initialDef, def));
      });
    });
  });
});
