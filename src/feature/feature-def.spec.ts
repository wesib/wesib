import { noop } from 'call-thru';
import { ContextValueSpec, SingleContextKey } from 'context-values';
import { BootstrapContext } from '../boot';
import { Class } from '../common';
import { FeatureContext } from './feature-context';
import { FeatureDef, FeatureDef__symbol } from './feature-def';

describe('feature', () => {

  class Feature1 {}
  class Feature2 {}

  describe('FeatureDef', () => {
    describe('of', () => {
      it('extracts feature definition', () => {

        class TestFeature {
          static [FeatureDef__symbol]: FeatureDef = { name: 'feature definition' } as any;
        }

        expect(FeatureDef.of(TestFeature)).toBe(TestFeature[FeatureDef__symbol]);
      });
      it('builds empty feature definition if it is absent', () => {

        class TestFeature {}

        expect(FeatureDef.of(TestFeature)).toEqual({});
      });
      it('requests inherited definition', () => {

        class A {
          static [FeatureDef__symbol]: FeatureDef = {
            needs: Feature1,
          };
        }
        class B extends A {}

        expect(FeatureDef.of(B)).toEqual(A[FeatureDef__symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [FeatureDef__symbol]: FeatureDef = {
            needs: Feature1,
          };
        }
        class B extends A {
          static [FeatureDef__symbol]: FeatureDef = {
            needs: Feature2,
          };
        }

        expect(FeatureDef.of(B))
            .toEqual(FeatureDef.merge(A[FeatureDef__symbol], B[FeatureDef__symbol]));
      });
    });
    describe('merge', () => {
      it('merges `needs`', () => {

        const first: FeatureDef = { needs: Feature1 };
        const second: FeatureDef = { needs: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ needs: [Feature1, Feature2]});
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
      it('merges `setup`', () => {

        const mockSetup1 = jest.fn();
        const mockSetup2 = jest.fn();
        const merged = FeatureDef.merge(
            { setup: mockSetup1 },
            { setup: mockSetup2 }).setup || noop;
        const context: FeatureContext = { name: 'feature context' } as any;

        class Feature {}

        merged.call(Feature, context);

        expect(mockSetup1).toHaveBeenCalledWith(context);
        expect(mockSetup1.mock.instances[0]).toBe(Feature);
        expect(mockSetup2).toHaveBeenCalledWith(context);
        expect(mockSetup2.mock.instances[0]).toBe(Feature);
      });
      it('merges `init`', () => {

        const mockInit1 = jest.fn();
        const mockInit2 = jest.fn();
        const merged = FeatureDef.merge(
            { init: mockInit1  },
            { init: mockInit2 }).init || noop;
        const context: FeatureContext = { name: 'feature context' } as any;

        class Feature {}

        merged.call(Feature, context);

        expect(mockInit1 ).toHaveBeenCalledWith(context);
        expect(mockInit1 .mock.instances[0]).toBe(Feature);
        expect(mockInit2).toHaveBeenCalledWith(context);
        expect(mockInit2.mock.instances[0]).toBe(Feature);
      });
      it('merges `perDefinition`', () => {

        const v1: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('1'),
          is: '1',
        };
        const v2: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('2'),
          is: '2',
        };

        const first: FeatureDef = { perDefinition: v1 };
        const second: FeatureDef = { perDefinition: v2 };

        expect(FeatureDef.merge(first, second)).toEqual({ perDefinition: [v1, v2]});
      });
      it('merges `perComponent`', () => {

        const v1: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('1'),
          is: '1',
        };
        const v2: ContextValueSpec<BootstrapContext, string> = {
          a: new SingleContextKey<string>('2'),
          is: '2',
        };

        const first: FeatureDef = { perComponent: v1 };
        const second: FeatureDef = { perComponent: v2 };

        expect(FeatureDef.merge(first, second)).toEqual({ perComponent: [v1, v2]});
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

        const def: FeatureDef = { needs: Feature1 };
        const componentType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(componentType)).toEqual(def);
      });
      it('updates component definition', () => {

        const initialDef: FeatureDef = {
          needs: Feature1,
        };

        FeatureDef.define(TestFeature, initialDef);

        const def: FeatureDef = {
          needs: Feature2,
        };
        const featureType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(featureType)).toEqual(FeatureDef.merge(initialDef, def));
      });
    });
  });
});
