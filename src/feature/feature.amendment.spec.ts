import { describe, expect, it, jest } from '@jest/globals';
import { FeatureContext } from './feature-context';
import { FeatureDef } from './feature-def';
import { AeFeatureTarget, Feature } from './feature.amendment';

describe('feature', () => {
  describe('@Feature', () => {
    it('assigns feature definition', async () => {

      const init = jest.fn<(context: FeatureContext) => void>();
      const def: FeatureDef = { init };

      @Feature(def)
      class TestFeature {}

      const context: FeatureContext = { name: 'feature context' } as unknown as FeatureContext;

      await FeatureDef.of(TestFeature).init?.(context);

      expect(init).toHaveBeenCalledWith(context);
      expect(init.mock.instances[0]).toBe(def);
    });
    it('accepts an amendment as parameter', async () => {

      const init = jest.fn<(context: FeatureContext) => void>();
      const def: FeatureDef = { init };

      @Feature(({ amend }) => {
        amend()().amend(amend({ featureDef: def }));
      })
      class TestFeature {}

      const context: FeatureContext = { name: 'feature context' } as unknown as FeatureContext;

      await FeatureDef.of(TestFeature).init?.(context);

      expect(init).toHaveBeenCalledWith(context);
      expect(init.mock.instances[0]).toBe(def);
    });
    it('can be used for auto-amendment', async () => {

      const init = jest.fn<(context: FeatureContext) => void>();
      const def: FeatureDef = { init };

      class TestFeature {

        static autoAmend(target: AeFeatureTarget): void {
          Feature(def).applyAmendment(target);
        }

      }

      const context: FeatureContext = { name: 'feature context' } as unknown as FeatureContext;

      await FeatureDef.of(TestFeature).init?.(context);

      expect(init).toHaveBeenCalledWith(context);
      expect(init.mock.instances[0]).toBe(def);
    });
  });
});
