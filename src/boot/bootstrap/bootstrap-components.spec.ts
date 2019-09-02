import { noop } from 'call-thru';
import { SingleContextKey, SingleContextUpKey } from 'context-values';
import { afterEventOf, EventInterest } from 'fun-events';
import { Class } from '../../common';
import { Component } from '../../component';
import { FeatureContext, FeatureDef, LoadedFeature } from '../../feature';
import { MethodSpy } from '../../spec/mocks';
import { BootstrapContext } from '../bootstrap-context';
import { ComponentRegistry } from '../definition/component-registry.impl';
import { ComponentValueRegistry } from '../definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../definition/definition-value-registry.impl';
import { ElementBuilder } from '../definition/element-builder.impl';
import { DefaultNamespaceAliaser } from '../globals';
import { bootstrapComponents } from './bootstrap-components';
import { BootstrapValueRegistry } from './bootstrap-value-registry.impl';
import Mock = jest.Mock;

describe('boot', () => {

  let createBootstrapValueRegistrySpy: MethodSpy<typeof BootstrapValueRegistry, 'create'>;

  beforeEach(() => {
    createBootstrapValueRegistrySpy = jest.spyOn(BootstrapValueRegistry, 'create');
  });

  describe('bootstrapComponents', () => {
    it('constructs bootstrap value registry', () => {
      bootstrapComponents();
      expect(createBootstrapValueRegistrySpy).toHaveBeenCalledWith();
    });
    it('provides definition value registry', () => {
      expect(bootstrapComponents().get(DefinitionValueRegistry)).toBeInstanceOf(DefinitionValueRegistry);
    });
    it('provides component value registry', () => {
      bootstrapComponents().get(ComponentValueRegistry);
      expect(bootstrapComponents().get(ComponentValueRegistry)).toBeInstanceOf(ComponentValueRegistry);
    });
    it('provides element builder', () => {
      expect(bootstrapComponents().get(ElementBuilder)).toBeInstanceOf(ElementBuilder);
    });
    it('provides component registry', () => {
      expect(bootstrapComponents().get(ComponentRegistry)).toBeInstanceOf(ComponentRegistry);
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
      it('proxies `whenDefined()` method', async () => {

        const context = bootstrapComponents();
        const componentRegistry = context.get(ComponentRegistry);
        const whenDefinedSpy = jest.spyOn(componentRegistry, 'whenDefined')
            .mockImplementation(() => Promise.resolve<any>('abc'));

        @Component('test-component')
        class TestComponent {}

        expect(await context.whenDefined(TestComponent)).toBe('abc');
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
    });

    describe('FeatureContext', () => {

      class Base {}

      let featureContext: FeatureContext;
      let whenReady: Mock;
      let bootstrapContext: BootstrapContext;

      beforeEach(async () => {
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

        await new Promise(resolve => {
          bootstrapContext.whenReady(resolve);
        });
      });

      it('provides `BootstrapContext` value', () => {
        expect(featureContext.get(BootstrapContext)).toBe(bootstrapContext);
      });
      it('provides `FeatureContext` value', () => {
        expect(featureContext.get(FeatureContext)).toBe(featureContext);
      });
      it('proxies `define()`', () => {

        const componentRegistry = bootstrapContext.get(ComponentRegistry);
        const defineSpy = jest.spyOn(componentRegistry, 'define').mockImplementation(noop);

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        featureContext.define(TestComponent);
        expect(defineSpy).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `whenDefined()`', async () => {

        const componentRegistry = bootstrapContext.get(ComponentRegistry);
        const whenDefinedSpy = jest.spyOn(componentRegistry, 'whenDefined')
            .mockImplementation(() => Promise.resolve<any>('abc'));

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(await featureContext.whenDefined(TestComponent)).toBe('abc');
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `BootstrapContext.whenDefined()`', async () => {

        const componentRegistry = bootstrapContext.get(ComponentRegistry);
        const whenDefinedSpy = jest.spyOn(componentRegistry, 'whenDefined')
            .mockImplementation(() => Promise.resolve<any>('abc'));

        @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
        class TestComponent {}

        expect(await featureContext.whenDefined(TestComponent)).toBe('abc');
        expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
      });
      it('proxies `perDefinition()`', () => {

        const definitionValueRegistry = bootstrapContext.get(DefinitionValueRegistry);
        const spy = jest.spyOn(definitionValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.perDefinition({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies `perComponent()`', () => {

        const componentValueRegistry = bootstrapContext.get(ComponentValueRegistry);
        const spy = jest.spyOn(componentValueRegistry, 'provide');

        const key = new SingleContextKey<string>('test-value-key');
        const provider = () => 'test-value';

        featureContext.perComponent({ a: key, by: provider });

        expect(spy).toHaveBeenCalledWith({ a: key, by: provider });
      });
      it('proxies `onDefinition`', () => {
        expect(featureContext.onDefinition).toBe(bootstrapContext.get(ElementBuilder).definitions.on);
      });
      it('proxies `onComponent`', () => {
        expect(featureContext.onComponent).toBe(bootstrapContext.get(ElementBuilder).components.on);
      });

      describe('whenReady', () => {
        it('invokes callback once bootstrap is complete', () => {
          expect(whenReady).toHaveBeenCalledWith();
        });
        it('invokes callback immediately when bootstrap is complete already', () => {

          const callback = jest.fn();

          featureContext.whenReady(callback);
          expect(callback).toHaveBeenCalledWith();
        });
      });

      describe('BootstrapContext', () => {
        it('proxies `whenDefined()`', async () => {

          const componentRegistry = bootstrapContext.get(ComponentRegistry);
          const whenDefinedSpy = jest.spyOn(componentRegistry, 'whenDefined')
              .mockImplementation(() => Promise.resolve<any>('abc'));

          @Component({ name: 'test-component', extend: { name: 'div', type: Base } })
          class TestComponent {}

          expect(await bootstrapContext.whenDefined(TestComponent)).toBe('abc');
          expect(whenDefinedSpy).toHaveBeenCalledWith(TestComponent);
        });

        describe('whenReady', () => {
          it('invokes callback when bootstrap is complete', () => {

            const callback = jest.fn();

            bootstrapContext.whenReady(callback);
            expect(callback).toHaveBeenCalledWith();
          });
        });

        describe('load', () => {

          let feature: Class;
          let receiver: Mock<void, [LoadedFeature]>;
          let featureInterest: EventInterest;

          beforeEach(() => {
            feature = class Feature {};
            receiver = jest.fn();
          });

          it('loads the feature', async () => {
            await loadFeature();
            expect(receiver).toHaveBeenCalledWith({ feature, ready: false });
            expect(receiver).toHaveBeenLastCalledWith({ feature, ready: true });
            expect(receiver).toHaveBeenCalledTimes(2);
          });
          it('does not reload already loaded feature', async () => {
            await loadFeature();
            receiver.mockClear();

            const receiver2 = jest.fn();

            await loadFeature(receiver2);
            expect(receiver).not.toHaveBeenCalled();
            expect(receiver2).toHaveBeenCalledWith({ feature, ready: true });
            expect(receiver2).toHaveBeenCalledTimes(1);
          });
          it('unloads the feature once interest is lost', async () => {

            const key = new SingleContextUpKey<string | undefined>('test');

            FeatureDef.define(feature, { set: { a: key, is: 'value' } });
            await loadFeature();

            let value: string | undefined;

            bootstrapContext.get(key, { or: afterEventOf<[string?]>() })(v => value = v);
            expect(value).toBe('value');

            featureInterest.off();
            await Promise.resolve();
            expect(value).toBeUndefined();
          });
          it('readies the feature only when it is loaded', async () => {

            const readySpy = jest.fn();

            FeatureDef.define(
                feature,
                {
                  init(ctx) {
                    ctx.whenReady(readySpy);
                    expect(readySpy).not.toHaveBeenCalled();
                  },
                },
            );

            await loadFeature();
            expect(readySpy).toHaveBeenCalledTimes(1);
          });
          xit('informs on feature replacement', async () => {
            await loadFeature();
            receiver.mockClear();

            class Replacement {}
            FeatureDef.define(Replacement, { has: feature });
            await new Promise(resolve => {
              bootstrapContext.load(Replacement)(loaded => {
                if (loaded.ready) {
                  resolve();
                }
              });
            });

            expect(receiver).toHaveBeenCalledWith({ feature: Replacement, ready: false });
            expect(receiver).toHaveBeenLastCalledWith({ feature: Replacement, ready: true });
            expect(receiver).toHaveBeenCalledTimes(2);
          });

          function loadFeature(receive: Mock<void, [LoadedFeature]> = receiver) {
            return new Promise(resolve => {
              receive.mockImplementation(loaded => {
                if (loaded.ready) {
                  resolve();
                }
              });
              featureInterest = bootstrapContext.load(feature)(receive);
            });
          }
        });
      });
    });
  });
});
