import { BootstrapContext } from './bootstrap-context';
import { FeatureDef, FeatureType } from './feature';
import { FeatureRegistry } from './feature-registry';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('feature/feature-registry', () => {
  describe('FeatureRegistry', () => {

    let feature1: FeatureType;
    let configure1spy: Spy;
    let feature2: FeatureType;
    let configure2spy: Spy;
    let registry: FeatureRegistry;
    let contextSpy: SpyObj<BootstrapContext>;
    let addSpy: Spy;

    beforeEach(() => {
      configure1spy = jasmine.createSpy('configure1');
      feature1 = FeatureDef.define(class Feature1 {}, {
        configure: configure1spy,
      });
      configure2spy = jasmine.createSpy('configure2');
      feature2 = FeatureDef.define(class Feature2 {}, {
        configure: configure2spy,
      });
    });
    beforeEach(() => {
      registry = FeatureRegistry.create();
      contextSpy = jasmine.createSpyObj('bootstrapContext', ['define']);
      addSpy = spyOn(registry, 'add').and.callThrough();
    });

    it('applies feature', () => {

      class Feature {}
      const configureSpy = jasmine.createSpy('configure');

      registry.add(FeatureDef.define(FeatureDef.define(Feature, { configure: configureSpy })));
      registry.configure(contextSpy);

      expect(configureSpy).toHaveBeenCalledWith(contextSpy);
    });
    it('applies required features', () => {

      class Feature {}

      registry.add(FeatureDef.define(FeatureDef.define(Feature, {
        requires: [feature1, feature2],
      })));

      expect(addSpy).toHaveBeenCalledWith(feature1);
      expect(addSpy).toHaveBeenCalledWith(feature2);
    });
    it('applies provided features', () => {

      class Feature {}

      registry.add(FeatureDef.define(FeatureDef.define(Feature, {
        provides: [feature1, feature2],
      })));

      expect(addSpy).toHaveBeenCalledWith(feature1, Feature);
      expect(addSpy).toHaveBeenCalledWith(feature2, Feature);

      registry.configure(contextSpy);
    });
    it('prefers feature with dedicated provider', () => {
      registry.add(feature1);
      registry.add(feature1, feature2);
      registry.configure(contextSpy);

      expect(configure1spy).not.toHaveBeenCalled();
    });
    it('prefers feature with dedicated provider when added in reverse order', () => {
      registry.add(feature1, feature2);
      registry.add(feature1);
      registry.configure(contextSpy);

      expect(configure1spy).not.toHaveBeenCalled();
    });
    it('fails when feature provided by different providers', () => {

      class Feature {}

      registry.add(Feature, feature1);
      expect(() => registry.add(Feature, feature2)).toThrowError();
    });
    it('does not fails when feature provided by the same provider', () => {
      registry.add(feature1, feature2);
      registry.add(feature1, feature2);
      registry.configure(contextSpy);

      expect(configure1spy).not.toHaveBeenCalled();
    });
  });
});
