import { valueProvider } from 'call-thru';
import { ContextValues, SingleContextKey, SingleContextUpKey } from 'context-values';
import { AfterEvent, eventInterest, EventInterest } from 'fun-events';
import { BootstrapContext } from '../../boot';
import { BootstrapValueRegistry } from '../../boot/bootstrap/bootstrap-value-registry.impl';
import { ComponentRegistry } from '../../boot/definition/component-registry.impl';
import { ComponentValueRegistry } from '../../boot/definition/component-value-registry.impl';
import { DefinitionValueRegistry } from '../../boot/definition/definition-value-registry.impl';
import { Class } from '../../common';
import { ComponentDef } from '../../component';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';
import { FeatureNeedsError } from '../feature-needs-error';
import { FeatureKey } from './feature-key.impl';
import { FeatureLoader } from './feature-loader.impl';
import { FeatureRequest } from './feature-request.impl';
import { FeatureRequester } from './feature-requester.impl';
import Mocked = jest.Mocked;

describe('feature', () => {

  let bsRegistry: BootstrapValueRegistry;
  let bsContext: Mocked<BootstrapContext>;

  beforeEach(() => {
    bsRegistry = BootstrapValueRegistry.create();
    bsContext = bsRegistry.values as any;
    bsRegistry.provide({ a: BootstrapContext, is: bsContext });
  });

  let mockComponentRegistry: Mocked<ComponentRegistry>;
  let definitionValueRegistry: DefinitionValueRegistry;
  let definitionValues: ContextValues;
  let componentValueRegistry: ComponentValueRegistry;
  let componentValues: ContextValues;

  beforeEach(() => {
    mockComponentRegistry = {
      define: jest.fn(),
    } as any;
    bsRegistry.provide({ a: ComponentRegistry, is: mockComponentRegistry });

    definitionValueRegistry = bsContext.get(DefinitionValueRegistry);
    definitionValues = definitionValueRegistry.newValues();
    componentValueRegistry = bsContext.get(ComponentValueRegistry);
    componentValues = componentValueRegistry.newValues();
  });

  let Feature: Class;

  beforeEach(() => {
    Feature = FeatureDef.define(class TestFeature {}, {});
  });

  let requester: FeatureRequester;

  beforeEach(() => {
    requester = bsContext.get(FeatureRequester);
  });

  describe('FeatureRequester', () => {
    describe('request', () => {
      it('registers `is` feature clause', () => {

        const request = requester.request(Feature);
        const receive = jest.fn();

        bsContext.get(FeatureKey.of(Feature).seedKey).once(receive);
        expect(receive).toHaveBeenCalledWith([request, 'is', Feature]);

        expect(request.feature).toBe(Feature);
      });
      it('registers feature loader', () => {

        const receive = jest.fn();

        requester.request(Feature);
        bsContext.get(FeatureKey.of(Feature)).once(receive);
        expect(receive).toHaveBeenCalledWith(expect.anything());

        const loader: FeatureLoader = receive.mock.calls[0][0];

        expect(loader.request.feature).toBe(Feature);
      });
      it('registers feature dependencies as `needs` feature clause', () => {
        class Dep1 {
        }

        class Dep2 {
        }

        FeatureDef.define(Feature, { needs: [Dep1, Dep2] });

        const receive1 = jest.fn();
        const receive2 = jest.fn();

        requester.request(Feature);

        bsContext.get(FeatureKey.of(Dep1).seedKey).once(receive1);
        bsContext.get(FeatureKey.of(Dep2).seedKey).once(receive2);

        expect(receive1).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'is', Dep1],
            [expect.any(FeatureRequest), 'needs', Dep1],
        );

        const request: FeatureRequest = receive1.mock.calls[0][1][0];
        const request1: FeatureRequest = receive1.mock.calls[0][0][0];

        expect(request1.feature).toBe(Dep1);
        expect(request.feature).toBe(Feature);
        expect(receive2).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'is', Dep2],
            [request, 'needs', Dep2],
        );

        const request2: FeatureRequest = receive2.mock.calls[0][0][0];

        expect(request2.feature).toBe(Dep2);
      });
      it('removes dependency when no longer needed', () => {
        class Dep {
        }

        class Feature2 {
        }

        FeatureDef.define(Feature, { needs: Dep });
        FeatureDef.define(Feature2, { needs: Dep });

        const request1 = requester.request(Feature);
        const request2 = requester.request(Feature2);
        let depLoader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Dep))(ldr => depLoader = ldr);

        expect(depLoader).toBeDefined();

        request1.unuse();
        expect(depLoader).toBeDefined();

        request2.unuse();
        expect(depLoader).toBeUndefined();
      });
      it('registers provided feature as `has` feature clause', () => {
        class Provided {
        }

        FeatureDef.define(Feature, { has: Provided });

        const receive = jest.fn();

        requester.request(Feature);
        bsContext.get(FeatureKey.of(Provided).seedKey).once(receive);

        expect(receive).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'has', Provided],
            [expect.any(FeatureRequest), 'is', Provided],
        );

        const hasRequest: FeatureRequest = receive.mock.calls[0][0][0];
        const isRequest: FeatureRequest = receive.mock.calls[0][1][0];

        expect(hasRequest.feature).toBe(Feature);
        expect(isRequest.feature).toBe(Provided);
      });
      it('fails to request recursive dependencies', () => {
        class Dep {}

        FeatureDef.define(Dep, { needs: Feature });
        FeatureDef.define(Feature, { needs: Dep });

        expect(() => requester.request(Feature)).toThrow(FeatureNeedsError);
      });
      it('replaces feature provider', () => {

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Feature))(l => loader = l);

        requester.request(Feature);
        expect(loader!.request.feature).toBe(Feature);

        class Provider {}

        FeatureDef.define(Provider, { has: Feature });

        const providerRequest = requester.request(Provider);

        expect(loader!.request.feature).toBe(Provider);

        providerRequest.unuse();
        expect(loader!.request.feature).toBe(Feature);
      });
    });

    describe('FeatureKey', () => {
      it('prefers feature provider', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: Feature });
        requester.request(Provider);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Feature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers feature provider loaded prior to the feature itself', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: Feature });
        requester.request(Provider);
        requester.request(Feature);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Feature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers feature provider loaded after the feature itself', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: Feature });
        requester.request(Feature);
        requester.request(Provider);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Feature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers most recent feature provider', () => {

        class Provider1 {}
        class Provider2 {}

        FeatureDef.define(Provider1, { has: Feature });
        FeatureDef.define(Provider2, { has: Feature });
        requester.request(Provider1);
        requester.request(Provider2);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Feature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider2);
      });
    });
  });

  describe('FeatureLoader', () => {
    describe('setup', () => {
      it('bootstraps values', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });
        const receive = jest.fn();

        bsContext.get(key)(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        FeatureDef.define(Feature, { set: { a: key, is: 'loaded' } });

        const [loader, interest] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');

        interest.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('bootstraps dependency values', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });
        const receive = jest.fn();

        bsContext.get(key)(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        class Dep {}

        FeatureDef.define(Dep, { set: { a: key, is: 'loaded' } });
        FeatureDef.define(Feature, { needs: Dep });

        const [loader, interest] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');

        interest.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('provides definition values', async () => {

        const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
        const receive = jest.fn();

        definitionValues.get(key)(receive);

        FeatureDef.define(Feature, { perDefinition: { a: key, is: 'provided' } });

        const [loader, interest] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('provided');

        interest.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('provides component values', async () => {

        const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
        const receive = jest.fn();

        componentValues.get(key)(receive);

        FeatureDef.define(Feature, { perComponent: { a: key, is: 'provided' } });

        const [loader, interest] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('provided');

        interest.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('does not initialize the feature', async () => {

        const initSpy = jest.fn();

        FeatureDef.define(Feature, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.setup();
        expect(initSpy).not.toHaveBeenCalled();
      });
      it('can be called for second time', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });

        FeatureDef.define(Feature, { set: { a: key, is: 'loaded' } });

        const [loader] = await featureLoader();
        const receive = jest.fn();

        bsContext.get(key)(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        await loader.setup();
        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');
        expect(receive).toHaveBeenCalledTimes(2);
      });
      it('can be called for second time after init', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });

        FeatureDef.define(Feature, { set: { a: key, is: 'loaded' } });

        const [loader] = await featureLoader();
        const receive = jest.fn();

        bsContext.get(key)(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        await loader.init();
        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');
        expect(receive).toHaveBeenCalledTimes(2);
      });

      describe('when called before feature replacement', () => {
        it('bootstraps provider values', async () => {

          const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });
          const receive = jest.fn();

          bsContext.get(key)(receive);

          FeatureDef.define(Feature, { set: { a: key, is: 'loaded' } });

          const [loader, , load] = await featureLoader();

          await loader.setup();
          await replaceFeature(FeatureDef.define(class Replacement {}, {  set: { a: key, is: 'replaced' } }), load);

          expect(receive).toHaveBeenLastCalledWith('replaced');
        });
        it('does not initialize replacement', async () => {

          const [loader, , load] = await featureLoader();

          await loader.setup();

          const initSpy = jest.fn();

          await replaceFeature(FeatureDef.define(class Replacement {}, { init: initSpy }), load);

          expect(initSpy).not.toHaveBeenCalled();
        });
      });
    });

    describe('init', () => {
      it('initializes feature', async () => {

        const initSpy = jest.fn();

        FeatureDef.define(Feature, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.init();
        expect(initSpy).toHaveBeenCalledWith(expect.any(FeatureContext));
      });
      it('initializes dependencies', async () => {

        const initSpy = jest.fn();
        class Dep {}
        FeatureDef.define(Feature, { needs: Dep });
        FeatureDef.define(Dep, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.init();
        expect(initSpy).toHaveBeenCalledWith(expect.any(FeatureContext));
      });
      it('can be called for second time', async () => {

        const initSpy = jest.fn();

        FeatureDef.define(Feature, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.init();
        await loader.init();
        expect(initSpy).toHaveBeenCalledTimes(1);
      });

      describe('when called before feature replacement', () => {
        it('initializes replacement', async () => {

          const [loader, , load] = await featureLoader();

          await loader.init();

          const initSpy = jest.fn();

          await replaceFeature(FeatureDef.define(class Replacement {}, { init: initSpy }), load);

          expect(initSpy).toHaveBeenCalled();
        });
      });
    });

    describe('FeatureContext', () => {
      describe('get', () => {
        it('grants access to bootstrap values', async () => {

          const key = new SingleContextKey<string>(
              'test',
              {
                byDefault: valueProvider('default'),
              },
          );
          const initSpy = jest.fn((ctx: FeatureContext) => {
            expect(ctx.get(key)).toBe('provided');
          });

          FeatureDef.define(
              Feature,
              {
                set: { a: key, is: 'provided' },
                init: initSpy,
              },
          );

          const [loader] = await featureLoader();

          await loader.init();
          expect(initSpy).toHaveBeenCalled();
        });
      });

      describe('perDefinition', () => {
        it('provides definition values', async () => {

          const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
          const receive = jest.fn();

          definitionValues.get(key)(receive);

          FeatureDef.define(
              Feature,
              {
                init(ctx) {
                  ctx.perDefinition({ a: key, is: 'provided' });
                },
              },
          );

          const [loader, interest] = await featureLoader();

          await loader.init();
          expect(receive).toHaveBeenLastCalledWith('provided');

          interest.off();
          await loader.down;
          expect(receive).toHaveBeenLastCalledWith('default');
        });
      });

      describe('perComponent', () => {
        it('provides component values', async () => {

          const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
          const receive = jest.fn();

          componentValues.get(key)(receive);

          FeatureDef.define(
              Feature,
              {
                init(ctx) {
                  ctx.perComponent({ a: key, is: 'provided' });
                },
              },
          );

          const [loader, interest] = await featureLoader();

          await loader.init();
          expect(receive).toHaveBeenLastCalledWith('provided');

          interest.off();
          await loader.down;
          expect(receive).toHaveBeenLastCalledWith('default');
        });
      });

      describe('define', () => {
        it('defines the component', async () => {
          class TestComponent {}
          ComponentDef.define(TestComponent, { name: 'test-component' });

          FeatureDef.define(
              Feature,
              {
                init(ctx) {
                  ctx.define(TestComponent);
                },
              },
          );

          const [loader] = await featureLoader();

          await loader.init();
          expect(mockComponentRegistry.define).toHaveBeenLastCalledWith(TestComponent);
        });
      });
    });

    function featureLoader(
        feature = Feature,
    ): Promise<readonly [FeatureLoader, EventInterest, AfterEvent<[FeatureLoader?]>]> {
      return new Promise(resolve => {

        const interest = eventInterest();

        requester.request(feature);

        const load = bsContext.get(FeatureKey.of(feature));

        interest.needs(
            load(
                loader => resolve([loader!, interest, load])
            ).needs(interest)
        );
      });
    }

    async function replaceFeature(
        replacement: Class,
        load: AfterEvent<[FeatureLoader?]>,
    ): Promise<void> {
      FeatureDef.define(replacement, { has: Feature });
      requester.request(replacement);

      await new Promise<FeatureLoader>(resolve => {
        load(ldr => {
          if (ldr && ldr.request.feature === replacement) {
            resolve(ldr);
          }
        });
      }).then(ldr => ldr.ready);
    }
  });
});
