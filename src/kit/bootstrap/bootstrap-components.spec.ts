import { SingleContextKey } from 'context-values';
import { Component } from '../../component';
import { FeatureDef } from '../../feature';
import { FeatureRegistry } from '../../feature/feature-registry';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentKit } from '../component-kit';
import { ComponentRegistry } from '../definition/component-registry';
import { ComponentValueRegistry } from '../definition/component-value-registry';
import { DefinitionValueRegistry } from '../definition/definition-value-registry';
import { ElementBuilder } from '../definition/element-builder';
import { bootstrapComponents } from './bootstrap-components';
import { BootstrapValueRegistry } from './bootstrap-value-registry';
import Mock = jest.Mock;
import Mocked = jest.Mocked;
import SpyInstance = jest.SpyInstance;

describe('kit/bootstrap/bootstrap-components', () => {

  let createBootstrapValueRegistrySpy: SpyInstance<() => BootstrapValueRegistry>;
  let createDefinitionValueRegistrySpy: SpyInstance<() => DefinitionValueRegistry>;
  let createComponentValueRegistrySpy: SpyInstance<() => ComponentValueRegistry>;
  let createElementBuilderSpy: Mock;
  let elementBuilderSpy: Mocked<ElementBuilder>;
  let createComponentRegistrySpy: Mock;
  let componentRegistrySpy: Mocked<ComponentRegistry>;

  beforeEach(() => {
    createBootstrapValueRegistrySpy = jest.spyOn(BootstrapValueRegistry, 'create');
    createComponentValueRegistrySpy = jest.spyOn(ComponentValueRegistry, 'create');
    createDefinitionValueRegistrySpy = jest.spyOn(DefinitionValueRegistry, 'create');

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

      const bootstrapValues = createBootstrapValueRegistrySpy.mock.results[0].value.values;

      expect(createDefinitionValueRegistrySpy).toHaveBeenCalledWith(bootstrapValues);
    });
    it('constructs component value registry', () => {
      bootstrapComponents();
      expect(createComponentValueRegistrySpy).toHaveBeenCalledWith();
    });
    it('constructs element builder', () => {
      bootstrapComponents();

      const definitionValueRegistry = createDefinitionValueRegistrySpy.mock.results[0].value;
      const componentValueRegistry = createComponentValueRegistrySpy.mock.results[0].value;

      expect(createElementBuilderSpy).toHaveBeenCalledWith({
        definitionValueRegistry,
        componentValueRegistry,
      });
    });
    it('constructs component registry', () => {
      bootstrapComponents();
      expect(createComponentRegistrySpy).toHaveBeenCalledWith({
        bootstrapContext: expect.anything(),
        elementBuilder: elementBuilderSpy,
      });
    });

    describe('ComponentKit', () => {
      it('is constructed', () => {
        expect(bootstrapComponents()).toBeInstanceOf(ComponentKit);
      });
      it('proxies whenDefined() method', () => {

        const kit = bootstrapComponents();
        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.mockReturnValue(promise);

        @Component('test-component')
        class TestComponent {}

        expect(kit.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
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

        expect(createFeatureRegistrySpy).toHaveBeenCalledWith({
          valueRegistry: createBootstrapValueRegistrySpy.mock.results[0].value
        });
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

      let bootstrapContext: BootstrapContext;
      let kit: ComponentKit;

      beforeEach(() => {
        createBootstrapValueRegistrySpy.mockRestore();
        bootstrapContext = undefined!;

        class TestFeature {}

        kit = bootstrapComponents(
            FeatureDef.define(
                TestFeature,
                {
                  init(ctx) {
                    bootstrapContext = ctx;
                  }
                }));
      });

      it('proxies define() method', () => {

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        bootstrapContext.define(TestComponent);
        expect(componentRegistrySpy.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies whenDefined() method', () => {

        const promise = Promise.resolve<any>('abc');

        componentRegistrySpy.whenDefined.mockReturnValue(promise);

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(bootstrapContext.whenDefined(TestComponent)).toBe(promise);
        expect(componentRegistrySpy.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies forDefinitions() method', () => {

        const definitionValueRegistry = createDefinitionValueRegistrySpy.mock.results[0].value;
        const spy = jest.spyOn(definitionValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        bootstrapContext.forDefinitions({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies forComponents() method', () => {

        const componentValueRegistry = createComponentValueRegistrySpy.mock.results[0].value;
        const spy = jest.spyOn(componentValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        bootstrapContext.forComponents({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies onDefinition() method', () => {
        expect(bootstrapContext.onDefinition).toBe(elementBuilderSpy.definitions.on);
      });
      it('proxies onComponent() method', () => {
        expect(bootstrapContext.onComponent).toBe(elementBuilderSpy.components.on);
      });
      it('proxies get() method', () => {

        const spy = jest.spyOn(bootstrapContext, 'get');
        const someKey = new SingleContextKey<string>('some');
        const opts = { or: 'default' };

        bootstrapContext.get(someKey, opts);

        expect(spy).toHaveBeenCalledWith(someKey, { or: 'default' });
      });
    });
  });
});
