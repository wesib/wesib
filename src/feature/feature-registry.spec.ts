import { Class, SingleValueKey } from '../common';
import { BootstrapContext } from './bootstrap-context';
import { BootstrapValueRegistry } from './bootstrap-value-registry';
import { FeatureDef } from './feature';
import { FeatureRegistry } from './feature-registry';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('feature/feature-registry', () => {
  describe('FeatureRegistry', () => {

    let feature1: Class;
    let configure1spy: Spy;
    let feature2: Class;
    let configure2spy: Spy;
    let valueRegistrySpy: SpyObj<BootstrapValueRegistry>;
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
      valueRegistrySpy = jasmine.createSpyObj('valueRegistry', ['provide']);
      registry = FeatureRegistry.create({ valueRegistry: valueRegistrySpy });
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
      registry.add(Feature, feature2);

      expect(() => registry.configure(contextSpy)).toThrow(jasmine.stringMatching(/multiple providers/));
    });
    it('does not fail when feature provided by the same provider', () => {
      registry.add(feature1, feature2);
      registry.add(feature1, feature2);
      registry.configure(contextSpy);

      expect(configure1spy).not.toHaveBeenCalled();
    });
    it('selects super-provider', () => {

      class Feature {}

      registry.add(feature1);
      registry.add(feature2, feature1);
      registry.add(Feature, feature2);
      registry.configure(contextSpy);

      expect(configure1spy).toHaveBeenCalledWith(contextSpy);
      expect(configure2spy).not.toHaveBeenCalled();
    });
    it('allows to depend on both provider and super-provider', () => {

      class Feature {}

      registry.add(feature1);
      registry.add(feature2, feature1);
      registry.add(Feature, feature1);
      registry.add(Feature, feature2);
      registry.configure(contextSpy);

      expect(configure1spy).toHaveBeenCalledWith(contextSpy);
      expect(configure2spy).not.toHaveBeenCalled();
    });
    it('fails on circular dependency', () => {
      registry.add(feature1, feature2);
      registry.add(feature2, feature1);

      expect(() => registry.configure(contextSpy)).toThrow(jasmine.stringMatching(/Circular dependency/));
    });
    it('fails on deep circular dependency', () => {

      class Feature {}

      registry.add(Feature, feature1);
      registry.add(feature1, feature2);
      registry.add(feature2, Feature);

      expect(() => registry.configure(contextSpy)).toThrow(jasmine.stringMatching(/Circular dependency/));
    });
    it('bootstraps value providers', () => {

      const key = new SingleValueKey('test-key');
      const provider = jasmine.createSpy('testValueProvider');
      class Feature {}

      FeatureDef.define(Feature, { bootstraps: { key, provider } });

      registry.add(Feature);
      registry.configure(contextSpy);

      expect(valueRegistrySpy.provide).toHaveBeenCalledWith(key, provider);
    });
  });
});
