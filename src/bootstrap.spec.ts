import { bootstrapComponents } from './bootstrap';
import { EventEmitter, SingleValueKey } from './common';
import { WesComponent } from './component';
import { ComponentRegistry } from './element/component-registry';
import { ComponentValueRegistry } from './element/component-value-registry';
import { ElementBuilder } from './element/element-builder';
import {
  BootstrapContext,
  BootstrapValues,
  ComponentDefinitionListener,
  ElementDefinitionListener,
  ComponentListener,
  FeatureDef,
} from './feature';
import { BootstrapValueRegistry } from './feature/bootstrap-value-registry';
import { FeatureRegistry } from './feature/feature-registry';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('bootstrap', () => {

  let createBootstrapValueRegistrySpy: Spy;
  let bootstrapValueRegistrySpy: SpyObj<BootstrapValueRegistry>;
  let bootstrapValuesSpy: SpyObj<BootstrapValues>;
  let bootstrapSourcesSpy: Spy;
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
    bootstrapValueRegistrySpy.bindSources.and.returnValue(bootstrapSourcesSpy);

    bootstrapValuesSpy = jasmine.createSpyObj('bootstrapValues', ['get']);
    (bootstrapValueRegistrySpy as any).values = bootstrapValuesSpy;

    componentValueRegistrySpy = jasmine.createSpyObj(
        'valueRegistry',
        [
          'provide',
          'get',
        ]);
    createComponentValueRegistrySpy = spyOn(ComponentValueRegistry, 'create')
        .and.returnValue(componentValueRegistrySpy);

    elementBuilderSpy = jasmine.createSpyObj(
        'elementBuilder',
        [
            'buildElement',
        ]);
    (elementBuilderSpy as any).elements =
        jasmine.createSpyObj<EventEmitter<ComponentListener>>('elements', ['on']);
    createElementBuilderSpy = spyOn(ElementBuilder, 'create').and.returnValue(elementBuilderSpy);

    componentRegistrySpy = jasmine.createSpyObj(
        'componentRegistry',
        [
          'define',
          'complete',
          'whenDefined',
        ]);
    (componentRegistrySpy as any).componentDefinitions =
        jasmine.createSpyObj<EventEmitter<ComponentDefinitionListener>>('componentDefinitions', ['on']);
    (componentRegistrySpy as any).elementDefinitions =
        jasmine.createSpyObj<EventEmitter<ElementDefinitionListener>>('elementDefinitions', ['on']);
    createComponentRegistrySpy = spyOn(ComponentRegistry, 'create').and.returnValue(componentRegistrySpy);
  });

  describe('bootstrapComponents', () => {
    it('constructs bootstrap value registry', () => {
      bootstrapComponents();
      expect(createBootstrapValueRegistrySpy).toHaveBeenCalledWith();
    });
    it('constructs component value registry', () => {
      bootstrapComponents();
      expect(createComponentValueRegistrySpy).toHaveBeenCalledWith(bootstrapSourcesSpy);
    });
    it('constructs element builder', () => {
      bootstrapComponents();
      expect(createElementBuilderSpy).toHaveBeenCalledWith({
        bootstrapContext: jasmine.anything(),
        valueRegistry: componentValueRegistrySpy,
      });
    });
    it('constructs component registry', () => {
      bootstrapComponents();
      expect(createComponentRegistrySpy).toHaveBeenCalledWith({
        builder: elementBuilderSpy,
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
                  configure(ctx) {
                    featureContext = ctx;
                  }
                }));
      });

      it('proxies define() method', () => {

        @WesComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        featureContext.define(TestComponent);
        expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies whenDefined() method', () => {

        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.and.returnValue(promise);

        @WesComponent({ name: 'test-component', extend: { name: 'div', type: HTMLDivElement } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies forComponent() method', () => {

        const key = new SingleValueKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.forComponent(key, provider);

        expect(componentValueRegistrySpy.provide).toHaveBeenCalledWith(key, provider);
      });
      it('proxies onComponentDefinition() method', () => {
        expect(featureContext.onComponentDefinition).toBe(componentRegistrySpy.componentDefinitions.on);
      });
      it('proxies onElementDefinition() method', () => {
        expect(featureContext.onElementDefinition).toBe(componentRegistrySpy.elementDefinitions.on);
      });
      it('proxies onElement() method', () => {
        expect(featureContext.onComponent).toBe(elementBuilderSpy.elements.on);
      });
      it('proxies get() method', () => {
        expect(featureContext.get).toBe(bootstrapValuesSpy.get);
      });
    });
  });
});
