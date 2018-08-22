import { bootstrapComponents, BootstrapConfig } from './bootstrap';
import { ComponentValueKey } from './component';
import { WebComponent } from './decorators';
import { ComponentRegistry } from './element/component-registry';
import { ElementBuilder } from './element/element-builder';
import { ProviderRegistry } from './element/provider-registry';
import { BootstrapContext, FeatureType } from './feature';
import { FeatureRegistry } from './feature/feature-registry';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('bootstrap', () => {

  let config: BootstrapConfig;
  let createProviderRegistrySpy: Spy;
  let providerRegistrySpy: SpyObj<ProviderRegistry>;
  let createElementBuilderSpy: Spy;
  let elementBuilderSpy: SpyObj<ElementBuilder>;
  let createComponentRegistrySpy: Spy;
  let componentRegistrySpy: SpyObj<ComponentRegistry>;

  beforeEach(() => {
    config = { window: 'components window' as any };

    providerRegistrySpy = jasmine.createSpyObj(
        'providerRegistry',
        [
          'provide',
          'get',
        ]);
    createProviderRegistrySpy = spyOn(ProviderRegistry, 'create').and.returnValue(providerRegistrySpy);

    elementBuilderSpy = jasmine.createSpyObj(
        'elementBuilder',
        [
            'buildElement',
            'onElement',
        ]);
    createElementBuilderSpy = spyOn(ElementBuilder, 'create').and.returnValue(elementBuilderSpy);

    componentRegistrySpy = jasmine.createSpyObj(
        'componentRegistry',
        [
          'define',
          'complete',
          'whenDefined',
          'onComponentDefinition',
          'onElementDefinition',
        ]);
    createComponentRegistrySpy = spyOn(ComponentRegistry, 'create').and.returnValue(componentRegistrySpy);
  });

  describe('bootstrapComponents', () => {
    it('constructs provider registry', () => {
      bootstrapComponents(config);
      expect(createProviderRegistrySpy).toHaveBeenCalledWith();
    });
    it('constructs element builder', () => {
      bootstrapComponents(config);
      expect(createElementBuilderSpy).toHaveBeenCalledWith({
        window: config.window,
        providerRegistry: providerRegistrySpy,
      });
    });
    it('constructs component registry', () => {
      bootstrapComponents(config);
      expect(createComponentRegistrySpy).toHaveBeenCalledWith({
        builder: elementBuilderSpy,
      });
    });
    it('applies default config', () => {
      bootstrapComponents();
      expect(createElementBuilderSpy).toHaveBeenCalledWith({
        window: undefined,
        providerRegistry: providerRegistrySpy,
      });
    });

    describe('FeatureRegistry', () => {

      let featureRegistrySpy: SpyObj<FeatureRegistry>;
      let createFeatureRegistrySpy: Spy;

      beforeEach(() => {
        featureRegistrySpy = jasmine.createSpyObj<FeatureRegistry>('featureRegistry', ['add', 'configure']);
        createFeatureRegistrySpy = spyOn(FeatureRegistry, 'create').and.returnValue(featureRegistrySpy);
      });

      it('creates feature registry', () => {
        bootstrapComponents();

        expect(createFeatureRegistrySpy).toHaveBeenCalledWith();
      });
      it('receives feature', () => {

        class TestFeature {}

        bootstrapComponents(config, TestFeature);

        expect(featureRegistrySpy.add).toHaveBeenCalledWith(TestFeature);
      });
      it('receives feature and applies default config', () => {

        class TestFeature {}

        bootstrapComponents(TestFeature);

        expect(featureRegistrySpy.add).toHaveBeenCalledWith(TestFeature);
      });
    });

    describe('BootstrapContext', () => {

      let featureContext: BootstrapContext;

      beforeEach(() => {

        class TestFeature {}

        bootstrapComponents(
            config,
            FeatureType.define(
                TestFeature,
                {
                  configure(ctx) {
                    featureContext = ctx;
                  }
                }));
      });

      it('proxies define() method', () => {
        componentRegistrySpy.define.and.returnValue(HTMLDivElement);

        @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        expect(featureContext.define(TestComponent)).toBe(HTMLDivElement);
        expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies whenDefined() method', () => {

        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.and.returnValue(promise);

        @WebComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies provide() method', () => {

        const key = new ComponentValueKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.provide(key, provider);

        expect(providerRegistrySpy.provide).toHaveBeenCalledWith(key, provider);
      });
      it('proxies onComponentDefinition() method', () => {

        const listener = () => {};

        featureContext.onComponentDefinition(listener);
        expect(componentRegistrySpy.onComponentDefinition).toHaveBeenCalledWith(listener);
      });
      it('proxies onElementDefinition() method', () => {

        const listener = () => {};

        featureContext.onElementDefinition(listener);
        expect(componentRegistrySpy.onElementDefinition).toHaveBeenCalledWith(listener);
      });
      it('proxies onElement() method', () => {

        const listener = () => {};

        featureContext.onElement(listener);
        expect(elementBuilderSpy.onElement).toHaveBeenCalledWith(listener);
      });
    });
  });
});
