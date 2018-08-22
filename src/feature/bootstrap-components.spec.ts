import { ComponentValueKey } from '../component';
import { WebComponent } from '../decorators';
import { ComponentRegistry } from '../element/component-registry';
import { ElementBuilder } from '../element/element-builder';
import { ProviderRegistry } from '../element/provider-registry';
import { bootstrapComponents, BootstrapConfig } from './bootstrap-components';
import { BootstrapContext } from './bootstrap-context';
import { FeatureType } from './feature';
import { FeatureSet } from './feature-set';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('feature/bootstrap-components', () => {

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

    describe('FeatureSet', () => {

      let featureSetSpy: SpyObj<FeatureSet>;
      let createFeatureSetSpy: Spy;

      beforeEach(() => {
        featureSetSpy = jasmine.createSpyObj<FeatureSet>('featureSet', ['add', 'configure']);
        createFeatureSetSpy = spyOn(FeatureSet, 'create').and.returnValue(featureSetSpy);
      });

      it('creates feature set', () => {
        bootstrapComponents();

        expect(createFeatureSetSpy).toHaveBeenCalledWith();
      });
      it('receives feature', () => {

        class TestFeature {}

        bootstrapComponents(config, TestFeature);

        expect(featureSetSpy.add).toHaveBeenCalledWith(TestFeature);
      });
      it('receives feature and applies default config', () => {

        class TestFeature {}

        bootstrapComponents(TestFeature);

        expect(featureSetSpy.add).toHaveBeenCalledWith(TestFeature);
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
