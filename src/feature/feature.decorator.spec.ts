import { noop } from '../common';
import { FeatureDef } from './feature-def';
import { Feature } from './feature.decorator';

describe('decorators/feature', () => {
  describe('@Feature', () => {
    it('assigns feature definition', () => {

      const def: FeatureDef = {
        bootstrap: noop,
      };

      @Feature(def)
      class TestFeature {}

      expect(FeatureDef.of(TestFeature)).toEqual(def);
    });
  });
});
