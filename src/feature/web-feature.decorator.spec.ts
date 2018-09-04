import { noop } from '../common';
import { FeatureDef } from './feature';
import { WebFeature } from './web-feature.decorator';

describe('decorators/web-feature', () => {
  describe('@WebFeature', () => {
    it('assigns feature definition', () => {

      const def: FeatureDef = {
        configure: noop,
      };

      @WebFeature(def)
      class TestFeature {}

      expect(FeatureDef.of(TestFeature)).toEqual(def);
    });
  });
});
