import { Class } from '@proc7ts/primitives';
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
      it('merges with super-inherited definition', () => {

        class A {

          static [FeatureDef__symbol]: FeatureDef = {
            needs: Feature1,
          };

        }

        class B extends A {}

        class C extends B {

          static [FeatureDef__symbol]: FeatureDef = {
            needs: Feature2,
          };

        }

        expect(FeatureDef.of(C))
            .toEqual(FeatureDef.merge(A[FeatureDef__symbol], C[FeatureDef__symbol]));
      });
    });

    describe('merge', () => {
      it('merges `needs`', () => {

        const first: FeatureDef = { needs: Feature1 };
        const second: FeatureDef = { needs: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ needs: [Feature1, Feature2] });
      });
      it('merges `has`', () => {

        const first: FeatureDef = { has: Feature1 };
        const second: FeatureDef = { has: Feature2 };

        expect(FeatureDef.merge(first, second)).toEqual({ has: [Feature1, Feature2] });
      });
      it('merges `setup`', async () => {

        const mockSetup1 = jest.fn();
        const def1: FeatureDef = { setup: mockSetup1 };
        const mockSetup2 = jest.fn();
        const def2: FeatureDef = { setup: mockSetup2 };
        const merged = FeatureDef.merge(def1, def2);
        const context: FeatureContext = { name: 'feature context' } as any;

        await merged.setup?.(context);

        expect(mockSetup1).toHaveBeenCalledWith(context);
        expect(mockSetup1.mock.instances[0]).toBe(def1);
        expect(mockSetup2).toHaveBeenCalledWith(context);
        expect(mockSetup2.mock.instances[0]).toBe(def2);
      });
      it('merges `init`', async () => {

        const mockInit1 = jest.fn();
        const def1: FeatureDef = { init: mockInit1 };
        const mockInit2 = jest.fn();
        const def2: FeatureDef = { init: mockInit2 };
        const merged = FeatureDef.merge(def1, def2);
        const context: FeatureContext = { name: 'feature context' } as any;

        await merged.init?.(context);

        expect(mockInit1).toHaveBeenCalledWith(context);
        expect(mockInit1.mock.instances[0]).toBe(def1);
        expect(mockInit2).toHaveBeenCalledWith(context);
        expect(mockInit2.mock.instances[0]).toBe(def2);
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
        const featureType = FeatureDef.define(TestFeature, def);

        expect(FeatureDef.of(featureType)).toEqual(def);
      });
      it('updates feature definition', () => {

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
