import { NamespaceAliaser, QualifiedName } from '@frontmeans/namespace-aliaser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxBuildAsset, CxPeerBuilder } from '@proc7ts/context-builder';
import { CxEntry, CxGlobals, cxSingle } from '@proc7ts/context-values';
import { asis, Class, noop } from '@proc7ts/primitives';
import { Mock } from 'jest-mock';
import { BootstrapContext } from './boot';
import { bootstrapComponents } from './bootstrap-components';
import { Component, ComponentContext, ComponentDef, ComponentDef__symbol } from './component';
import { ComponentClass, CustomElements, DefinitionContext } from './component/definition';
import { FeatureContext, FeatureDef } from './feature';
import { ElementBuilder } from './impl';
import { PerComponentCxPeer } from './impl/component-context';
import { PerDefinitionCxPeer } from './impl/definition-context';
import {
  ComponentDefinitionClass,
  DefinitionContext__symbol,
} from './impl/definition-context.symbol';

describe('boot', () => {
  describe('bootstrapComponents', () => {
    it('provides per-definition context registry', () => {
      expect(bootstrapComponents().get(PerDefinitionCxPeer)).toBeInstanceOf(CxPeerBuilder);
    });
    it('provides per-component context registry', () => {
      expect(bootstrapComponents().get(PerComponentCxPeer)).toBeInstanceOf(CxPeerBuilder);
    });
    it('provides element builder', () => {
      expect(bootstrapComponents().get(ElementBuilder)).toBeDefined();
    });
    it('provides itself as `CxGlobals`', () => {
      const bsContext = bootstrapComponents();

      expect(bsContext.get(CxGlobals)).toBe(bsContext);
    });
    it('provides namespace aliaser', () => {
      expect(bootstrapComponents().get(NamespaceAliaser)).toBeInstanceOf(Function);
    });

    describe('BootstrapContext', () => {
      it('is constructed', () => {
        expect(bootstrapComponents()).toBeDefined();
      });
      it('proxies `whenDefined()` method', async () => {
        const bsContext = bootstrapComponents();
        const customElements = bsContext.get(CustomElements);
        const whenDefinedSpy = jest
          .spyOn(customElements, 'whenDefined')
          .mockImplementation(() => Promise.resolve()) as Mock<CustomElements['whenDefined']>;

        @Component('test-component')
        class TestComponent {}

        class Element {}

        const defContext = { elementType: Element, componentType: TestComponent } as Partial<
          DefinitionContext<TestComponent>
        > as DefinitionContext<TestComponent>;

        (TestComponent as ComponentDefinitionClass<TestComponent>)[DefinitionContext__symbol] =
          defContext;

        expect(await bsContext.whenDefined(TestComponent)).toBe(defContext);
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
    });

    describe('FeatureContext', () => {
      class Base {}

      let featureContext: FeatureContext;
      let whenReady: Mock<(context: FeatureContext) => void>;
      let bsContext: BootstrapContext;

      beforeEach(async () => {
        whenReady = jest.fn();

        class TestFeature {}

        bsContext = bootstrapComponents(
          FeatureDef.define(TestFeature, {
            init(ctx) {
              featureContext = ctx;
              featureContext.whenReady(whenReady);
              // eslint-disable-next-line jest/no-standalone-expect
              expect(whenReady).not.toHaveBeenCalled();
            },
          }),
        );

        await bsContext.whenReady;
      });

      it('provides `BootstrapContext` value', () => {
        expect(featureContext.get(BootstrapContext)).toBe(bsContext);
      });
      it('provides `FeatureContext` value', () => {
        expect(featureContext.get(FeatureContext)).toBe(featureContext);
      });
      it('proxies `define()`', async () => {
        let defineSpy!: Mock<
          (componentTypeOrName: ComponentClass | QualifiedName, elementType: Class) => void
        >;

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        bsContext = bootstrapComponents(
          FeatureDef.define(class TestFeature {}, {
            init(ctx) {
              const customElements = ctx.get(CustomElements);

              defineSpy = jest
                .spyOn(customElements, 'define')
                .mockImplementation(noop) as typeof defineSpy;
              ctx.define(TestComponent);
            },
          }),
        );

        await bsContext.whenReady;

        expect(defineSpy).toHaveBeenCalledWith(
          TestComponent,
          expect.any(Function) as unknown as Class,
        );
      });
      it('proxies `whenDefined()`', async () => {
        const customElements = bsContext.get(CustomElements);
        const whenDefinedSpy = jest
          .spyOn(customElements, 'whenDefined')
          .mockImplementation(() => Promise.resolve()) as Mock<CustomElements['whenDefined']>;

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        class Element {}

        const defContext = { elementType: Element, componentType: TestComponent };

        (TestComponent as any)[DefinitionContext__symbol] = defContext;

        expect(await featureContext.whenDefined(TestComponent)).toBe(defContext);
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `perDefinition()`', () => {
        const perDefinitionPeer = bsContext.get(PerDefinitionCxPeer);
        const spy = jest.spyOn(perDefinitionPeer, 'provide') as Mock<
          CxPeerBuilder<DefinitionContext>['provide']
        >;

        const entry: CxEntry<string> = { perContext: cxSingle() };
        const provider = (): string => 'test-value';
        const asset = cxBuildAsset(entry, provider);

        featureContext.perDefinition(asset);

        expect(spy).toHaveBeenCalledWith(asset);
      });
      it('proxies `perComponent()`', () => {
        const perComponentPeer = bsContext.get(PerComponentCxPeer);
        const spy = jest.spyOn(perComponentPeer, 'provide') as Mock<
          CxPeerBuilder<ComponentContext>['provide']
        >;

        const entry: CxEntry<string> = { perContext: cxSingle() };
        const provider = (): string => 'test-value';
        const asset = cxBuildAsset(entry, provider);

        featureContext.perComponent(asset);

        expect(spy).toHaveBeenCalledWith(asset);
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

          let whenDefinedSpy: Mock<
            (componentTypeOrName: ComponentClass | QualifiedName) => Promise<void>
          >;

          beforeEach(() => {
            const customElements = bsContext.get(CustomElements);

            whenDefinedSpy = jest
              .spyOn(customElements, 'whenDefined')
              .mockImplementation(() => Promise.resolve()) as Mock<CustomElements['whenDefined']>;
          });

          it('awaits for component definition', async () => {
            class Element {}

            (TestComponent as any)[DefinitionContext__symbol] = {
              elementType: Element,
              componentType: TestComponent,
            };

            await bsContext.whenDefined(TestComponent);

            expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
          });
          it('caches component definition request', async () => {
            class Element {}

            (TestComponent as any)[DefinitionContext__symbol] = {
              elementType: Element,
              componentType: TestComponent,
            };

            const whenDefined = bsContext.whenDefined(TestComponent);

            const defined1 = await whenDefined;

            void expect(whenDefined).toBe(bsContext.whenDefined(TestComponent));

            let defined2!: DefinitionContext;

            whenDefined(ctx => (defined2 = ctx));

            expect(defined2).toBe(defined1);
            expect(whenDefinedSpy).toHaveBeenCalledTimes(1);
          });
          it('fails if component definition is absent', async () => {
            expect(
              await Promise.resolve(bsContext.whenDefined(TestComponent)).catch(asis),
            ).toBeInstanceOf(TypeError);
            expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
          });
          it('fails if component registry fails', async () => {
            const error = new Error();

            whenDefinedSpy.mockImplementation(() => Promise.reject(error));

            expect(await Promise.resolve(bsContext.whenDefined(TestComponent)).catch(asis)).toBe(
              error,
            );
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
