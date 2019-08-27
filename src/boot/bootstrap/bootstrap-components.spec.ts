import { SingleContextKey } from 'context-values';
import { Component } from '../../component';
import { FeatureContext, FeatureDef } from '../../feature';
import { FeatureRegistry } from '../../feature/loader';
import { MethodSpy, ObjectMock } from '../../spec/mocks';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentRegistry } from '../definition/component-registry.impl';
import { ComponentValueRegistry } from '../definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../definition/definition-value-registry.impl';
import { ElementBuilder } from '../definition/element-builder.impl';
import { DefaultNamespaceAliaser } from '../globals';
import { bootstrapComponents } from './bootstrap-components';
import { BootstrapValueRegistry } from './bootstrap-value-registry.impl';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('boot', () => {

  let createBootstrapValueRegistrySpy: MethodSpy<typeof BootstrapValueRegistry, 'create'>;
  let createDefinitionValueRegistrySpy: MethodSpy<typeof DefinitionValueRegistry, 'create'>;
  let createComponentValueRegistrySpy: MethodSpy<typeof ComponentValueRegistry, 'create'>;
  let createElementBuilderSpy: MethodSpy<typeof ElementBuilder, 'create'>;
  let mockElementBuilder: Mocked<ElementBuilder>;
  let createComponentRegistrySpy: MethodSpy<typeof ComponentRegistry, 'create'>;
  let mockComponentRegistry: Mocked<ComponentRegistry>;

  beforeEach(() => {
    createBootstrapValueRegistrySpy = jest.spyOn(BootstrapValueRegistry, 'create');
    createDefinitionValueRegistrySpy = jest.spyOn(DefinitionValueRegistry, 'create');
    createComponentValueRegistrySpy = jest.spyOn(ComponentValueRegistry, 'create');

    mockElementBuilder = {
      buildElement: jest.fn(),
      components: {
        on: jest.fn(),
      },
      definitions: {
        on: jest.fn(),
      },
    } as any;
    createElementBuilderSpy = jest.spyOn(ElementBuilder, 'create')
        .mockReturnValue(mockElementBuilder as any);

    mockComponentRegistry = {
      define: jest.fn(),
      complete: jest.fn(),
      whenDefined: jest.fn(),
    } as any;
    createComponentRegistrySpy = jest.spyOn(ComponentRegistry, 'create')
        .mockReturnValue(mockComponentRegistry);
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
        elementBuilder: mockElementBuilder,
      });
    });
    it('constructs default namespace aliaser', () => {
      bootstrapComponents();

      const bootstrapValues = createBootstrapValueRegistrySpy.mock.results[0].value.values;

      expect(bootstrapValues.get(DefaultNamespaceAliaser)).toBeInstanceOf(Function);
    });

    describe('BootstrapContext', () => {
      it('is constructed', () => {
        expect(bootstrapComponents()).toBeInstanceOf(BootstrapContext);
      });
      it('proxies whenDefined() method', () => {

        const context = bootstrapComponents();
        const promise = Promise.resolve<any>('abc');

        mockComponentRegistry.whenDefined.mockReturnValue(promise);

        @Component('test-component')
        class TestComponent {}

        expect(context.whenDefined(TestComponent)).toBe(promise);
        expect(mockComponentRegistry.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
    });

    describe('FeatureRegistry', () => {

      let featureRegistrySpy: ObjectMock<FeatureRegistry, 'add' | 'bootstrap'>;
      let createFeatureRegistrySpy: MethodSpy<typeof FeatureRegistry, 'create'>;

      beforeEach(() => {
        featureRegistrySpy = {
          add: jest.fn(),
          bootstrap: jest.fn(),
        };
        createFeatureRegistrySpy = jest.spyOn(FeatureRegistry, 'create')
            .mockReturnValue(featureRegistrySpy as any);
      });

      it('creates feature registry', () => {

        const bootstrapContext = bootstrapComponents();

        expect(createFeatureRegistrySpy).toHaveBeenCalledWith(
            expect.objectContaining({
              bootstrapContext: bootstrapContext,
              componentRegistry: mockComponentRegistry,
              valueRegistry: createBootstrapValueRegistrySpy.mock.results[0].value,
              definitionValueRegistry: createDefinitionValueRegistrySpy.mock.results[0].value,
              componentValueRegistry: createComponentValueRegistrySpy.mock.results[0].value,
            }),
        );
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

    describe('FeatureContext', () => {

      class Base {
      }

      let featureContext: FeatureContext;
      let whenReady: Mock;
      let bootstrapContext: BootstrapContext;

      beforeEach(() => {
        whenReady = jest.fn();
        createBootstrapValueRegistrySpy.mockRestore();

        class TestFeature {}

        bootstrapContext = bootstrapComponents(
            FeatureDef.define(
                TestFeature,
                {
                  init(ctx) {
                    featureContext = ctx;
                    featureContext.whenReady(whenReady);
                    expect(whenReady).not.toHaveBeenCalled();
                  }
                }));
      });

      it('provides `BootstrapContext` value', () => {
        expect(featureContext.get(BootstrapContext)).toBe(bootstrapContext);
      });
      it('provides `FeatureContext` value', () => {
        expect(featureContext.get(FeatureContext)).toBe(featureContext);
      });
      it('proxies `define()`', () => {

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        featureContext.define(TestComponent);
        expect(mockComponentRegistry.define).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `whenDefined()`', () => {

        const promise = Promise.resolve<any>('abc');

        mockComponentRegistry.whenDefined.mockReturnValue(promise);

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(mockComponentRegistry.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `BootstrapContext.whenDefined()`', () => {

        const promise = Promise.resolve<any>('abc');

        mockComponentRegistry.whenDefined.mockReturnValue(promise);

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(featureContext.whenDefined(TestComponent)).toBe(promise);
        expect(mockComponentRegistry.whenDefined).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `perDefinition()`', () => {

        const definitionValueRegistry = createDefinitionValueRegistrySpy.mock.results[0].value;
        const spy = jest.spyOn(definitionValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.perDefinition({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies `perComponent()`', () => {

        const componentValueRegistry = createComponentValueRegistrySpy.mock.results[0].value;
        const spy = jest.spyOn(componentValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.perComponent({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies `onDefinition`', () => {
        expect(featureContext.onDefinition).toBe(mockElementBuilder.definitions.on);
      });
      it('proxies `onComponent`', () => {
        expect(featureContext.onComponent).toBe(mockElementBuilder.components.on);
      });

      describe('whenReady', () => {
        it('invokes callback once bootstrap is complete', () => {
          expect(whenReady).toHaveBeenCalledWith();
          expect(whenReady.mock.instances[0]).toBe(featureContext);
        });
        it('invokes callback immediately when bootstrap is complete already', () => {

          const callback = jest.fn();

          featureContext.whenReady(callback);
          expect(callback).toHaveBeenCalledWith();
          expect(callback.mock.instances[0]).toBe(featureContext);
        });
      });

      describe('BootstrapContext', () => {
        it('proxies `whenDefined()`', () => {

          const promise = Promise.resolve<any>('abc');

          mockComponentRegistry.whenDefined.mockReturnValue(promise);

          @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
          class TestComponent {}

          expect(bootstrapContext.whenDefined(TestComponent)).toBe(promise);
          expect(mockComponentRegistry.whenDefined).toHaveBeenCalledWith(TestComponent);
        });

        describe('whenReady', () => {
          it('invokes callback when bootstrap is complete', () => {

            const callback = jest.fn();

            bootstrapContext.whenReady(callback);
            expect(callback).toHaveBeenCalledWith();
            expect(callback.mock.instances[0]).toBe(bootstrapContext);
          });
        });
      });
    });
  });
});
