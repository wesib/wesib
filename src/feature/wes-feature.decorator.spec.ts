import { noop } from '../common';
import { FeatureDef } from './feature';
import { WesFeature } from './wes-feature.decorator';

describe('decorators/wes-feature', () => {
  describe('@WesFeature', () => {
    it('assigns feature definition', () => {

      const def: FeatureDef = {
        configure: noop,
      };

      @WesFeature(def)
      class TestFeature {}

      expect(FeatureDef.of(TestFeature)).toEqual(def);
    });
  });
});
