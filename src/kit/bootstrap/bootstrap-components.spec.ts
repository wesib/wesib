import { SingleContextKey } from 'context-values';
import { Component } from '../../component';
import { FeatureDef } from '../../feature';
import { FeatureRegistry } from '../../feature/feature-registry';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentRegistry } from '../definition/component-registry';
import { ComponentValueRegistry } from '../definition/component-value-registry';
import { DefinitionValueRegistry } from '../definition/definition-value-registry';
import { ElementBuilder } from '../definition/element-builder';
import { bootstrapComponents } from './bootstrap-components';
import { BootstrapValueRegistry } from './bootstrap-value-registry';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('kit/bootstrap/bootstrap-components', () => {

  let createBootstrapValueRegistrySpy: Mock;
  let bootstrapValueRegistrySpy: Mocked<BootstrapValueRegistry>;
  let bootstrapContextSpy: Mocked<BootstrapContext>;
  let bootstrapSourcesSpy: Mock;
  let createDefinitionValueRegistrySpy: Mock;
  let definitionValueRegistrySpy: Mocked<DefinitionValueRegistry>;
  let createComponentValueRegistrySpy: Mock;
  let componentValueRegistrySpy: Mocked<ComponentValueRegistry>;
  let createElementBuilderSpy: Mock;
  let elementBuilderSpy: Mocked<ElementBuilder>;
  let createComponentRegistrySpy: Mock;
  let componentRegistrySpy: Mocked<ComponentRegistry>;

  beforeEach(() => {

    bootstrapValueRegistrySpy = {
      provide: jest.fn(),
      newValues: jest.fn(),
      bindSources: jest.fn(),
    } as any;
    createBootstrapValueRegistrySpy = jest.spyOn(BootstrapValueRegistry, 'create')
        .mockReturnValue(bootstrapValueRegistrySpy);

    bootstrapSourcesSpy = jest.fn();
    (bootstrapValueRegistrySpy as any).valueSources = bootstrapSourcesSpy;

    bootstrapContextSpy = {
      get: jest.fn(),
    } as any;
    (bootstrapValueRegistrySpy as any).values = bootstrapContextSpy;

    componentValueRegistrySpy = {
      provide: jest.fn(),
    } as any;
    createComponentValueRegistrySpy = jest.spyOn(ComponentValueRegistry, 'create')
        .mockReturnValue(componentValueRegistrySpy);

    definitionValueRegistrySpy = {
      provide: jest.fn(),
    } as any;
    createDefinitionValueRegistrySpy = jest.spyOn(DefinitionValueRegistry, 'create')
        .mockReturnValue(definitionValueRegistrySpy);

    elementBuilderSpy = {
      buildElement: jest.fn(),
      components: {
        on: jest.fn(),
      },
      definitions: {
        on: jest.fn(),
      },
    } as any;
    createElementBuilderSpy = jest.spyOn(ElementBuilder, 'create')
        .mockReturnValue(elementBuilderSpy);

    componentRegistrySpy = {
      define: jest.fn(),
      complete: jest.fn(),
      whenDefined: jest.fn(),
    } as any;
    createComponentRegistrySpy = jest.spyOn(ComponentRegistry, 'create')
        .mockReturnValue(componentRegistrySpy);
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
        bootstrapContext: expect.anything(),
        elementBuilder: elementBuilderSpy,
      });
    });

    describe('FeatureRegistry', () => {

      let featureRegistrySpy: Mocked<Pick<FeatureRegistry, 'add' | 'bootstrap'>>;
      let createFeatureRegistrySpy: Mock;

      beforeEach(() => {
        featureRegistrySpy = {
          add: jest.fn(),
          bootstrap: jest.fn(),
        };
        createFeatureRegistrySpy = jest.spyOn(FeatureRegistry, 'create')
            .mockReturnValue(featureRegistrySpy);
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

      class Base {
      }

      let featureContext: BootstrapContext;

      beforeEach(() => {
        featureContext = undefined!;

        class TestFeature {}

        bootstrapComponents(
            FeatureDef.define(
                TestFeature,
                {
                  init(ctx) {
                    featureContext = ctx;
                  }
                }));
      });

      it('proxies define() method', () => {

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        featureContext.define(TestComponent);
        expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies whenDefined() method', () => {

        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.mockReturnValue(promise);

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies forDefinitions() method', () => {

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.forDefinitions({ a: key, by: provider });

        expect(definitionValueRegistrySpy.provide).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies forComponents() method', () => {

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.forComponents({ a: key, by: provider });

        expect(componentValueRegistrySpy.provide).toHaveBeenCalledWith({ a: key, by: provider });
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
