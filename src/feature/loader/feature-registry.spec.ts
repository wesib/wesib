import { asis } from 'call-thru';
import { SingleContextKey } from 'context-values';
import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ComponentValueRegistry } from '../../boot/definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../../boot/definition/definition-value-registry.impl';
import { Class } from '../../common';
import { MethodSpy } from '../../spec/mocks';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';
import { FeatureRegistry } from './feature-registry.impl';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('feature', () => {
  describe('FeatureRegistry', () => {

    let feature1: Class;
    let init1spy: Mock;
    let feature2: Class;
    let init2spy: Mock;

    beforeEach(() => {
      init1spy = jest.fn();
      feature1 = FeatureDef.define(class Feature1 {}, {
        init: init1spy,
      });

      init2spy = jest.fn();
      feature2 = FeatureDef.define(class Feature2 {}, {
        init: init2spy,
      });
    });

    let bootstrapRegistry: BootstrapValueRegistry;
    let mockComponentRegistry: Mocked<ComponentRegistry>;
    let mockDefinitionValueRegistry: Mocked<DefinitionValueRegistry>;
    let mockComponentValueRegistry: Mocked<ComponentValueRegistry>;
    let registry: FeatureRegistry;
    let mockBootstrapContext: Mocked<BootstrapContext>;
    let addSpy: MethodSpy<FeatureRegistry, 'add'>;

    beforeEach(() => {
      bootstrapRegistry = BootstrapValueRegistry.create();

      mockBootstrapContext = {
        get: bootstrapRegistry.values.get,
      } as any;
      bootstrapRegistry.provide({ a: BootstrapContext, is: mockBootstrapContext });

      mockComponentRegistry = {
        define: jest.fn(),
      } as any;
      bootstrapRegistry.provide({ a: ComponentRegistry, is: mockComponentRegistry });

      mockDefinitionValueRegistry = {
        provide: jest.fn(),
      } as any;
      bootstrapRegistry.provide({ a: DefinitionValueRegistry, is: mockDefinitionValueRegistry });

      mockComponentValueRegistry = {
        provide: jest.fn(),
      } as any;
      bootstrapRegistry.provide({ a: ComponentValueRegistry, is: mockComponentValueRegistry });
      registry = FeatureRegistry.create(mockBootstrapContext);

      addSpy = jest.spyOn(registry, 'add');
    });

    it('applies feature', () => {

      class Feature {}
      const mockInit = jest.fn();

      registry.add(FeatureDef.define(FeatureDef.define(Feature, { init: mockInit })));
      registry.bootstrap();

      expect(mockInit).toHaveBeenCalledWith(expect.any(FeatureContext));
    });
    it('applies required features', () => {

      class Feature {}

      registry.add(FeatureDef.define(FeatureDef.define(Feature, {
        needs: [feature1, feature2],
      })));

      expect(addSpy).toHaveBeenCalledWith(feature1);
      expect(addSpy).toHaveBeenCalledWith(feature2);
    });
    it('applies provided features', () => {

      class Feature {}

      registry.add(FeatureDef.define(FeatureDef.define(Feature, {
        has: [feature1, feature2],
      })));

      expect(addSpy).toHaveBeenCalledWith(feature1, Feature);
      expect(addSpy).toHaveBeenCalledWith(feature2, Feature);

      registry.bootstrap();
    });
    it('prefers feature with dedicated provider', () => {
      registry.add(feature1);
      registry.add(feature1, feature2);
      registry.bootstrap();

      expect(init1spy).not.toHaveBeenCalled();
    });
    it('prefers feature with dedicated provider when added in reverse order', () => {
      registry.add(feature1, feature2);
      registry.add(feature1);
      registry.bootstrap();

      expect(init1spy).not.toHaveBeenCalled();
    });
    it('fails when feature provided by different providers', async () => {

      class Feature {}

      registry.add(Feature, feature1);
      registry.add(Feature, feature2);

      const error: Error = await registry.bootstrap().catch(asis);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/multiple providers/);
    });
    it('does not fail when feature provided by the same provider', () => {
      registry.add(feature1, feature2);
      registry.add(feature1, feature2);
      registry.bootstrap();

      expect(init1spy).not.toHaveBeenCalled();
    });
    it('selects super-provider', () => {

      class Feature {}

      registry.add(feature1);
      registry.add(feature2, feature1);
      registry.add(Feature, feature2);
      registry.bootstrap();

      expect(init1spy).toHaveBeenCalledWith(expect.any(FeatureContext));
      expect(init2spy).not.toHaveBeenCalled();
    });
    it('allows to depend on both provider and super-provider', () => {

      class Feature {}

      registry.add(feature1);
      registry.add(feature2, feature1);
      registry.add(Feature, feature1);
      registry.add(Feature, feature2);
      registry.bootstrap();

      expect(init1spy).toHaveBeenCalledWith(expect.any(FeatureContext));
      expect(init2spy).not.toHaveBeenCalled();
    });
    it('fails on circular dependency', async () => {
      registry.add(feature1, feature2);
      registry.add(feature2, feature1);

      const error: Error = await registry.bootstrap().catch(asis);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/Circular dependency/);
    });
    it('fails on deep circular dependency', async () => {

      class Feature {}

      registry.add(Feature, feature1);
      registry.add(feature1, feature2);
      registry.add(feature2, Feature);

      const error: Error = await registry.bootstrap().catch(asis);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toMatch(/Circular dependency/);
    });
    it('provides bootstrap values', () => {

      const provideSpy = jest.spyOn(bootstrapRegistry, 'provide');
      const key = new SingleContextKey('test-key');
      const provider = jest.fn();
      class Feature {}

      FeatureDef.define(Feature, { set: { a: key, by: provider } });

      registry.add(Feature);
      registry.bootstrap();

      expect(provideSpy).toHaveBeenCalledWith({ a: key, by: provider });
    });
    it('provides definition values', () => {

      const key = new SingleContextKey('test-key');
      const provider = jest.fn();
      class Feature {}

      FeatureDef.define(Feature, { perDefinition: { a: key, by: provider } });

      registry.add(Feature);
      registry.bootstrap();

      expect(mockDefinitionValueRegistry.provide).toHaveBeenCalledWith({ a: key, by: provider });
    });
    it('provides component values', () => {

      const key = new SingleContextKey('test-key');
      const provider = jest.fn();
      class Feature {}

      FeatureDef.define(Feature, { perComponent: { a: key, by: provider } });

      registry.add(Feature);
      registry.bootstrap();

      expect(mockComponentValueRegistry.provide).toHaveBeenCalledWith({ a: key, by: provider });
    });
  });
});
