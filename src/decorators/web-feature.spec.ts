import { FeatureDef } from '../feature';
import { noop } from '../util';
import { WebFeature } from './web-feature';

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
