import { SingleContextKey } from '@proc7ts/context-values';
import { asis, Class, noop } from '@proc7ts/primitives';
import { Component, ComponentDef, ComponentDef__symbol } from '../../component';
import { CustomElements, DefinitionContext } from '../../component/definition';
import { FeatureContext, FeatureDef } from '../../feature';
import { BootstrapContext } from '../bootstrap-context';
import { DefaultNamespaceAliaser } from '../globals';
import { BootstrapContextRegistry, ComponentContextRegistry, DefinitionContextRegistry, ElementBuilder } from '../impl';
import { DefinitionContext__symbol } from '../impl/definition-context.symbol.impl';
import { bootstrapComponents } from './bootstrap-components';
import Mock = jest.Mock;
import SpyInstance = jest.SpyInstance;

describe('boot', () => {

  let createBootstrapContextRegistrySpy: SpyInstance<BootstrapContextRegistry, []>;

  beforeEach(() => {
    createBootstrapContextRegistrySpy = jest.spyOn(BootstrapContextRegistry, 'create');
  });

  describe('bootstrapComponents', () => {
    it('constructs bootstrap value registry', () => {
      bootstrapComponents();
      expect(createBootstrapContextRegistrySpy).toHaveBeenCalledWith();
    });
    it('provides definition value registry', () => {
      expect(bootstrapComponents().get(DefinitionContextRegistry)).toBeInstanceOf(DefinitionContextRegistry);
    });
    it('provides component value registry', () => {
      bootstrapComponents().get(ComponentContextRegistry);
      expect(bootstrapComponents().get(ComponentContextRegistry)).toBeInstanceOf(ComponentContextRegistry);
    });
    it('provides element builder', () => {
      expect(bootstrapComponents().get(ElementBuilder)).toBeDefined();
    });
    it('constructs default namespace aliaser', () => {
      bootstrapComponents();

      const bootstrapValues = createBootstrapContextRegistrySpy.mock.results[0].value.values;

      expect(bootstrapValues.get(DefaultNamespaceAliaser)).toBeInstanceOf(Function);
    });

    describe('BootstrapContext', () => {
      it('is constructed', () => {
        expect(bootstrapComponents()).toBeInstanceOf(BootstrapContext);
      });
      it('proxies `whenDefined()` method', async () => {

        const bsContext = bootstrapComponents();
        const customElements = bsContext.get(CustomElements);
        const whenDefinedSpy = jest.spyOn(customElements, 'whenDefined')
            .mockImplementation(() => Promise.resolve());

        @Component('test-component')
        class TestComponent {}

        class Element {}
        const defContext = { elementType: Element, componentType: TestComponent };

        (TestComponent as any)[DefinitionContext__symbol] = defContext;

        expect(await bsContext.whenDefined(TestComponent)).toBe(defContext);
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
    });

    describe('FeatureContext', () => {

      class Base {}

      let featureContext: FeatureContext;
      let whenReady: Mock;
      let bsContext: BootstrapContext;

      beforeEach(async () => {
        whenReady = jest.fn();
        createBootstrapContextRegistrySpy.mockRestore();

        class TestFeature {}

        bsContext = bootstrapComponents(
            FeatureDef.define(
                TestFeature,
                {
                  init(ctx) {
                    featureContext = ctx;
                    featureContext.whenReady(whenReady);
                    // eslint-disable-next-line jest/no-standalone-expect
                    expect(whenReady).not.toHaveBeenCalled();
                  },
                },
            ),
        );

        await bsContext.whenReady();
      });

      it('provides `BootstrapContext` value', () => {
        expect(featureContext.get(BootstrapContext)).toBe(bsContext);
      });
      it('provides `FeatureContext` value', () => {
        expect(featureContext.get(FeatureContext)).toBe(featureContext);
      });
      it('proxies `define()`', async () => {

        let defineSpy!: SpyInstance;

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        bsContext = bootstrapComponents(
            FeatureDef.define(
                class TestFeature {},
                {
                  init(ctx) {

                    const customElements = ctx.get(CustomElements);

                    defineSpy = jest.spyOn(customElements, 'define').mockImplementation(noop);
                    ctx.define(TestComponent);
                  },
                },
            ),
        );

        await bsContext.whenReady();

        expect(defineSpy).toHaveBeenCalledWith(TestComponent, expect.any(Function));
      });
      it('proxies `whenDefined()`', async () => {

        const customElements = bsContext.get(CustomElements);
        const whenDefinedSpy = jest.spyOn(customElements, 'whenDefined')
            .mockImplementation(() => Promise.resolve());

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}
        class Element {}

        const defContext = { elementType: Element, componentType: TestComponent };
        (TestComponent as any)[DefinitionContext__symbol] = defContext;

        expect(await featureContext.whenDefined(TestComponent)).toBe(defContext);
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `perDefinition()`', () => {

        const definitionContextRegistry = bsContext.get(DefinitionContextRegistry);
        const spy = jest.spyOn(definitionContextRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = (): string => 'test-value';

        featureContext.perDefinition({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies `perComponent()`', () => {

        const componentContextRegistry = bsContext.get(ComponentContextRegistry);
        const spy = jest.spyOn(componentContextRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = (): string => 'test-value';

        featureContext.perComponent({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });

      describe('whenReady', () => {
        it('invokes callback once bootstrap is complete', () => {
          expect(whenReady).toHaveBeenCalledWith(featureContext);
        });
        it('invokes callback immediately when bootstrap is complete already', () => {

          const callback = jest.fn();

          featureContext.whenReady(callback);
          expect(callback).toHaveBeenCalledWith(featureContext);
        });
      });

      describe('BootstrapContext', () => {
        describe('whenDefined', () => {

          let TestComponent: Class;

          beforeEach(() => {
            TestComponent = class {

              static [ComponentDef__symbol]: ComponentDef = {
                name: 'test-component',
              };

            };
          });

          let whenDefinedSpy: SpyInstance;

          beforeEach(() => {

            const customElements = bsContext.get(CustomElements);

            whenDefinedSpy = jest.spyOn(customElements, 'whenDefined')
                .mockImplementation(() => Promise.resolve());
          });

          it('awaits for component definition', async () => {

            class Element {}

            (TestComponent as any)[DefinitionContext__symbol] = { elementType: Element, componentType: TestComponent };

            await bsContext.whenDefined(TestComponent);

            expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
          });
          it('caches component definition request', async () => {

            class Element {}

            (TestComponent as any)[DefinitionContext__symbol] = { elementType: Element, componentType: TestComponent };

            const whenDefined = bsContext.whenDefined(TestComponent);

            const defined1 = await whenDefined;

            expect(whenDefined).toBe(bsContext.whenDefined(TestComponent));

            let defined2!: DefinitionContext;

            whenDefined.to(ctx => defined2 = ctx);

            expect(defined2).toBe(defined1);
            expect(whenDefinedSpy).toHaveBeenCalledTimes(1);
          });
          it('fails if component definition is absent', async () => {
            expect(await Promise.resolve(bsContext.whenDefined(TestComponent)).catch(asis))
                .toBeInstanceOf(TypeError);
            expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
          });
          it('fails if component registry fails', async () => {

            const error = new Error();

            whenDefinedSpy.mockImplementation(() => Promise.reject(error));

            expect(await Promise.resolve(bsContext.whenDefined(TestComponent)).catch(asis))
                .toBe(error);
            expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
          });
        });

        describe('whenReady', () => {
          it('invokes callback when bootstrap is complete', () => {

            const callback = jest.fn();

            bsContext.whenReady(callback);
            expect(callback).toHaveBeenCalledWith(bsContext);
          });
        });
      });
    });
  });
});
