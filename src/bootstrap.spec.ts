import { bootstrapComponents } from './bootstrap';
import { EventEmitter, SingleValueKey } from './common';
import { ComponentListener, DefinitionListener, Component } from './component';
import { ComponentRegistry } from './component/definition/component-registry';
import { ComponentValueRegistry } from './component/definition/component-value-registry';
import { DefinitionValueRegistry } from './component/definition/definition-value-registry';
import { ElementBuilder } from './component/definition/element-builder';
import { BootstrapContext, FeatureDef } from './feature';
import { BootstrapValueRegistry } from './feature/bootstrap-value-registry';
import { FeatureRegistry } from './feature/feature-registry';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('bootstrap', () => {

  let createBootstrapValueRegistrySpy: Spy;
  let bootstrapValueRegistrySpy: SpyObj<BootstrapValueRegistry>;
  let bootstrapContextSpy: SpyObj<BootstrapContext>;
  let bootstrapSourcesSpy: Spy;
  let createDefinitionValueRegistrySpy: Spy;
  let definitionValueRegistrySpy: SpyObj<DefinitionValueRegistry>;
  let createComponentValueRegistrySpy: Spy;
  let componentValueRegistrySpy: SpyObj<ComponentValueRegistry>;
  let createElementBuilderSpy: Spy;
  let elementBuilderSpy: SpyObj<ElementBuilder>;
  let createComponentRegistrySpy: Spy;
  let componentRegistrySpy: SpyObj<ComponentRegistry>;

  beforeEach(() => {

    bootstrapValueRegistrySpy = jasmine.createSpyObj(
        'bootstrapValueRegistry',
        [
          'provide',
          'get',
          'newValues',
          'bindSources',
        ]);
    createBootstrapValueRegistrySpy = spyOn(BootstrapValueRegistry, 'create')
        .and.returnValue(bootstrapValueRegistrySpy);

    bootstrapSourcesSpy = jasmine.createSpy('bootstrapSources');
    (bootstrapValueRegistrySpy as any).valueSources = bootstrapSourcesSpy;

    bootstrapContextSpy = jasmine.createSpyObj('bootstrapContext', ['get']);
    (bootstrapValueRegistrySpy as any).values = bootstrapContextSpy;

    componentValueRegistrySpy = jasmine.createSpyObj(
        'componentValueRegistry',
        [
          'provide',
          'get',
        ]);
    createComponentValueRegistrySpy = spyOn(ComponentValueRegistry, 'create')
        .and.returnValue(componentValueRegistrySpy);

    definitionValueRegistrySpy = jasmine.createSpyObj(
        'valueRegistry',
        [
          'provide',
          'get',
        ]);
    createDefinitionValueRegistrySpy = spyOn(DefinitionValueRegistry, 'create')
        .and.returnValue(definitionValueRegistrySpy);

    elementBuilderSpy = jasmine.createSpyObj(
        'elementBuilder',
        [
            'buildElement',
        ]);
    (elementBuilderSpy as any).components =
        jasmine.createSpyObj<EventEmitter<ComponentListener>>('elements', ['on']);
    (elementBuilderSpy as any).definitions =
        jasmine.createSpyObj<EventEmitter<DefinitionListener>>('componentDefinitions', ['on']);
    createElementBuilderSpy = spyOn(ElementBuilder, 'create').and.returnValue(elementBuilderSpy);

    componentRegistrySpy = jasmine.createSpyObj(
        'componentRegistry',
        [
          'define',
          'complete',
          'whenDefined',
        ]);
    createComponentRegistrySpy = spyOn(ComponentRegistry, 'create').and.returnValue(componentRegistrySpy);
  });

  describe('bootstrapComponents', () => {
    it('constructs bootstrap value registry', () => {
      bootstrapComponents();
      expect(createBootstrapValueRegistrySpy).toHaveBeenCalledWith();
    });
    it('constructs definition value registry', () => {
      bootstrapComponents();
      expect(createDefinitionValueRegistrySpy).toHaveBeenCalledWith(bootstrapSourcesSpy);
    });
    it('constructs component value registry', () => {
      bootstrapComponents();
      expect(createComponentValueRegistrySpy).toHaveBeenCalledWith();
    });
    it('constructs element builder', () => {
      bootstrapComponents();
      expect(createElementBuilderSpy).toHaveBeenCalledWith({
        definitionValueRegistry: definitionValueRegistrySpy,
        componentValueRegistry: componentValueRegistrySpy,
      });
    });
    it('constructs component registry', () => {
      bootstrapComponents();
      expect(createComponentRegistrySpy).toHaveBeenCalledWith({
        bootstrapContext: jasmine.anything(),
        elementBuilder: elementBuilderSpy,
      });
    });

    describe('FeatureRegistry', () => {

      let featureRegistrySpy: SpyObj<FeatureRegistry>;
      let createFeatureRegistrySpy: Spy;

      beforeEach(() => {
        featureRegistrySpy = jasmine.createSpyObj<FeatureRegistry>('featureRegistry', ['add', 'bootstrap']);
        createFeatureRegistrySpy = spyOn(FeatureRegistry, 'create').and.returnValue(featureRegistrySpy);
      });

      it('creates feature registry', () => {
        bootstrapComponents();

        expect(createFeatureRegistrySpy).toHaveBeenCalledWith({ valueRegistry: bootstrapValueRegistrySpy });
      });
      it('receives feature', () => {

        class TestFeature {}

        bootstrapComponents(TestFeature);

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
            FeatureDef.define(
                TestFeature,
                {
                  bootstrap(ctx) {
                    featureContext = ctx;
                  }
                }));
      });

      it('proxies define() method', () => {

        @Component({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        featureContext.define(TestComponent);
        expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies whenDefined() method', () => {

        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.and.returnValue(promise);

        @Component({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies forDefinitions() method', () => {

        const provide = new SingleValueKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.forDefinitions({ provide, provider });

        expect(definitionValueRegistrySpy.provide).toHaveBeenCalledWith({ provide, provider });
      });
      it('proxies forComponents() method', () => {

        const provide = new SingleValueKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.forComponents({ provide, provider });

        expect(componentValueRegistrySpy.provide).toHaveBeenCalledWith({ provide, provider });
      });
      it('proxies onDefinition() method', () => {
        expect(featureContext.onDefinition).toBe(elementBuilderSpy.definitions.on);
      });
      it('proxies onComponent() method', () => {
        expect(featureContext.onComponent).toBe(elementBuilderSpy.components.on);
      });
      it('proxies get() method', () => {
        expect(featureContext.get).toBe(bootstrapContextSpy.get);
      });
    });
  });
});
