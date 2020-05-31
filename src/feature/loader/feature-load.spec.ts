import { ContextValues, SingleContextKey } from '@proc7ts/context-values';
import { SingleContextUpKey } from '@proc7ts/context-values/updatable';
import { AfterEvent, EventEmitter, eventSupply, EventSupply } from '@proc7ts/fun-events';
import { Class, valueProvider } from '@proc7ts/primitives';
import { BootstrapContext } from '../../boot';
import { BootstrapContextRegistry, ComponentContextRegistry, DefinitionContextRegistry } from '../../boot/impl';
import { ComponentDef } from '../../component';
import { CustomElements } from '../../component/definition';
import { FeatureContext } from '../feature-context';
import { FeatureDef } from '../feature-def';
import { FeatureNeedsError } from '../feature-needs-error';
import { FeatureKey, FeatureLoader } from './feature-loader.impl';
import { FeatureRequest } from './feature-request.impl';
import { FeatureRequester } from './feature-requester.impl';
import Mocked = jest.Mocked;

describe('feature load', () => {

  let bsRegistry: BootstrapContextRegistry;
  let bsContext: Mocked<BootstrapContext>;
  let makeReady: EventEmitter<[BootstrapContext]>;

  beforeEach(() => {
    bsRegistry = BootstrapContextRegistry.create();
    makeReady = new EventEmitter();
    bsContext = {
      get: bsRegistry.values.get,
      load: jest.fn(),
      whenReady: makeReady.on().F,
    } as any;
    bsRegistry.provide({ a: BootstrapContext, is: bsContext });
  });

  let mockCustomElements: Mocked<CustomElements>;
  let definitionContextRegistry: DefinitionContextRegistry;
  let definitionValues: ContextValues;
  let componentContextRegistry: ComponentContextRegistry;
  let componentValues: ContextValues;

  beforeEach(() => {
    mockCustomElements = {
      define: jest.fn(),
    } as any;
    bsRegistry.provide({ a: CustomElements, is: mockCustomElements });

    definitionContextRegistry = bsContext.get(DefinitionContextRegistry);
    definitionValues = definitionContextRegistry.newValues();
    componentContextRegistry = bsContext.get(ComponentContextRegistry);
    componentValues = componentContextRegistry.newValues();
  });

  let TestFeature: Class;

  beforeEach(() => {
    TestFeature = FeatureDef.define(class TestFeatureImpl {}, {});
  });

  let requester: FeatureRequester;

  beforeEach(() => {
    requester = bsContext.get(FeatureRequester);
  });

  describe('FeatureRequester', () => {
    describe('request', () => {
      it('registers `is` feature clause', () => {

        const request = requester.request(TestFeature);
        const receive = jest.fn();

        bsContext.get(FeatureKey.of(TestFeature).seedKey).once(receive);
        expect(receive).toHaveBeenCalledWith([request, 'is', TestFeature]);

        expect(request.feature).toBe(TestFeature);
      });
      it('registers feature loader', () => {

        const receive = jest.fn();

        requester.request(TestFeature);
        bsContext.get(FeatureKey.of(TestFeature)).once(receive);
        expect(receive).toHaveBeenCalledWith(expect.anything());

        const loader: FeatureLoader = receive.mock.calls[0][0];

        expect(loader.request.feature).toBe(TestFeature);
      });
      it('registers feature dependencies as `needs` feature clause', () => {
        class Dep1 {}
        class Dep2 {}

        FeatureDef.define(TestFeature, { needs: [Dep1, Dep2] });

        const receive1 = jest.fn();
        const receive2 = jest.fn();

        requester.request(TestFeature);

        bsContext.get(FeatureKey.of(Dep1).seedKey).once(receive1);
        bsContext.get(FeatureKey.of(Dep2).seedKey).once(receive2);

        expect(receive1).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'is', Dep1],
            [expect.any(FeatureRequest), 'needs', Dep1],
        );

        const request: FeatureRequest = receive1.mock.calls[0][1][0];
        const request1: FeatureRequest = receive1.mock.calls[0][0][0];

        expect(request1.feature).toBe(Dep1);
        expect(request.feature).toBe(TestFeature);
        expect(receive2).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'is', Dep2],
            [request, 'needs', Dep2],
        );

        const request2: FeatureRequest = receive2.mock.calls[0][0][0];

        expect(request2.feature).toBe(Dep2);
      });
      it('removes dependency when no longer needed', () => {
        class Dep {}
        class Feature2 {}

        FeatureDef.define(TestFeature, { needs: Dep });
        FeatureDef.define(Feature2, { needs: Dep });

        const request1 = requester.request(TestFeature);
        const request2 = requester.request(Feature2);
        let depLoader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(Dep)).to(ldr => depLoader = ldr);

        expect(depLoader).toBeDefined();

        request1.unuse();
        expect(depLoader).toBeDefined();

        request2.unuse();
        expect(depLoader).toBeUndefined();
      });
      it('registers provided feature as `has` feature clause', () => {
        class Provided {}

        FeatureDef.define(TestFeature, { has: Provided });

        const receive = jest.fn();

        requester.request(TestFeature);
        bsContext.get(FeatureKey.of(Provided).seedKey).once(receive);

        expect(receive).toHaveBeenCalledWith(
            [expect.any(FeatureRequest), 'has', Provided],
            [expect.any(FeatureRequest), 'is', Provided],
        );

        const hasRequest: FeatureRequest = receive.mock.calls[0][0][0];
        const isRequest: FeatureRequest = receive.mock.calls[0][1][0];

        expect(hasRequest.feature).toBe(TestFeature);
        expect(isRequest.feature).toBe(Provided);
      });
      it('fails to request recursive dependencies', () => {
        class Dep {}

        FeatureDef.define(Dep, { needs: TestFeature });
        FeatureDef.define(TestFeature, { needs: Dep });

        expect(() => requester.request(TestFeature)).toThrow(FeatureNeedsError);
      });
      it('replaces feature provider', () => {

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(TestFeature)).to(l => loader = l);

        requester.request(TestFeature);
        expect(loader!.request.feature).toBe(TestFeature);

        class Provider {}

        FeatureDef.define(Provider, { has: TestFeature });

        const providerRequest = requester.request(Provider);

        expect(loader!.request.feature).toBe(Provider);

        providerRequest.unuse();
        expect(loader!.request.feature).toBe(TestFeature);
      });
    });

    describe('FeatureKey', () => {
      it('prefers feature provider', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: TestFeature });
        requester.request(Provider);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(TestFeature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers feature provider loaded prior to the feature itself', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: TestFeature });
        requester.request(Provider);
        requester.request(TestFeature);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(TestFeature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers feature provider loaded after the feature itself', () => {

        class Provider {}

        FeatureDef.define(Provider, { has: TestFeature });
        requester.request(TestFeature);
        requester.request(Provider);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(TestFeature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider);
      });
      it('prefers most recent feature provider', () => {

        class Provider1 {}
        class Provider2 {}

        FeatureDef.define(Provider1, { has: TestFeature });
        FeatureDef.define(Provider2, { has: TestFeature });
        requester.request(Provider1);
        requester.request(Provider2);

        let loader: FeatureLoader | undefined;

        bsContext.get(FeatureKey.of(TestFeature)).once(ldr => loader = ldr);

        expect(loader!.request.feature).toBe(Provider2);
      });

      describe('upKey', () => {
        it('is the key itself', () => {

          const key = FeatureKey.of(TestFeature);

          expect(key.upKey).toBe(key);
        });
      });
    });
  });

  describe('FeatureLoader', () => {
    describe('setup', () => {
      it('bootstraps values', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });
        const receive = jest.fn();

        bsContext.get(key).to(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        FeatureDef.define(
            TestFeature,
            {
              setup(setup) {
                setup.provide({ a: key, is: 'loaded' });
              },
            },
        );

        const [loader, supply] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');

        supply.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('bootstraps dependency values', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });
        const receive = jest.fn();

        bsContext.get(key).to(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        class Dep {}

        FeatureDef.define(
            Dep,
            {
              setup(setup) {
                setup.provide({ a: key, is: 'loaded' });
              },
            },
        );
        FeatureDef.define(TestFeature, { needs: Dep });

        const [loader, supply] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');

        supply.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('provides definition values', async () => {

        const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
        const receive = jest.fn();

        definitionValues.get(key).to(receive);

        FeatureDef.define(
            TestFeature,
            {
              setup(setup) {
                setup.perDefinition({ a: key, is: 'provided' });
              },
            },
        );

        const [loader, supply] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('provided');

        supply.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('provides component values', async () => {

        const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
        const receive = jest.fn();

        componentValues.get(key).to(receive);

        FeatureDef.define(
            TestFeature,
            {
              setup(setup) {
                setup.perComponent({ a: key, is: 'provided' });
              },
            },
        );

        const [loader, supply] = await featureLoader();

        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('provided');

        supply.off();
        await loader.down;
        expect(receive).toHaveBeenLastCalledWith('default');
      });
      it('does not initialize the feature', async () => {

        const initSpy = jest.fn();

        FeatureDef.define(TestFeature, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.setup();
        expect(initSpy).not.toHaveBeenCalled();
      });
      it('can be called for second time', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });

        FeatureDef.define(
            TestFeature,
            {
              setup(setup) {
                setup.provide({ a: key, is: 'loaded' });
              },
            },
        );

        const [loader] = await featureLoader();
        const receive = jest.fn();

        bsContext.get(key).to(receive);
        expect(receive).toHaveBeenLastCalledWith('default');

        await loader.setup();
        await loader.setup();
        expect(receive).toHaveBeenLastCalledWith('loaded');
        expect(receive).toHaveBeenCalledTimes(2);
      });
      it('can be called for second time after init', async () => {

        const key = new SingleContextUpKey<string>('test', { byDefault: valueProvider('default') });

        FeatureDef.define(
            TestFeature,
            {
              setup(setup) {
                setup.provide({ a: key, is: 'loaded' });
              },
            },
        );

        const [loader] = await featureLoader();
        const receive = jest.fn();

        bsContext.get(key).to(receive);
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

          bsContext.get(key).to(receive);

          FeatureDef.define(
              TestFeature,
              {
                setup(setup) {
                  setup.provide({ a: key, is: 'loaded' });
                },
              },
          );

          const [loader, , load] = await featureLoader();

          await loader.setup();
          await replaceFeature(
              FeatureDef.define(
                  class Replacement {},
                  {
                    setup(setup) {
                      setup.provide({ a: key, is: 'replaced' });
                    },
                  },
              ),
              load,
          );

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

        FeatureDef.define(TestFeature, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.init();
        expect(initSpy).toHaveBeenCalledWith(expect.any(FeatureContext));
      });
      it('initializes dependencies', async () => {

        const initSpy = jest.fn();
        class Dep {}
        FeatureDef.define(TestFeature, { needs: Dep });
        FeatureDef.define(Dep, { init: initSpy });

        const [loader] = await featureLoader();

        await loader.init();
        expect(initSpy).toHaveBeenCalledWith(expect.any(FeatureContext));
      });
      it('can be called for second time', async () => {

        const initSpy = jest.fn();

        FeatureDef.define(TestFeature, { init: initSpy });

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

          expect(initSpy).toHaveBeenCalledTimes(1);
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
              TestFeature,
              {
                setup(setup) {
                  setup.provide({ a: key, is: 'provided' });
                },
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

          definitionValues.get(key).to(receive);

          FeatureDef.define(
              TestFeature,
              {
                init(ctx) {
                  ctx.perDefinition({ a: key, is: 'provided' });
                },
              },
          );

          const [loader, supply] = await featureLoader();

          await loader.init();
          expect(receive).toHaveBeenLastCalledWith('provided');

          supply.off();
          await loader.down;
          expect(receive).toHaveBeenLastCalledWith('default');
        });
      });

      describe('perComponent', () => {
        it('provides component values', async () => {

          const key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
          const receive = jest.fn();

          componentValues.get(key).to(receive);

          FeatureDef.define(
              TestFeature,
              {
                init(ctx) {
                  ctx.perComponent({ a: key, is: 'provided' });
                },
              },
          );

          const [loader, supply] = await featureLoader();

          await loader.init();
          expect(receive).toHaveBeenLastCalledWith('provided');

          supply.off();
          await loader.down;
          expect(receive).toHaveBeenLastCalledWith('default');
        });
      });

      describe('define', () => {
        it('defines the component', async () => {
          class TestComponent {}
          ComponentDef.define(TestComponent, { name: 'test-component' });

          FeatureDef.define(
              TestFeature,
              {
                init(ctx) {
                  ctx.define(TestComponent);
                },
              },
          );

          const [loader] = await featureLoader();

          await loader.init();
          makeReady.send(bsContext);
          expect(mockCustomElements.define).toHaveBeenLastCalledWith(TestComponent, expect.any(Function));
        });
      });

      describe('load', () => {
        it('delegates to bootstrap context', async () => {

          class Dynamic {}
          const loaded = { name: 'loaded feature' } as any;

          bsContext.load.mockImplementation(() => loaded);

          FeatureDef.define(
              TestFeature,
              {
                init(ctx) {
                  expect(ctx.load(Dynamic)).toBe(loaded);
                },
              },
          );

          const [loader] = await featureLoader();

          await loader.init();

          expect(bsContext.load).toHaveBeenCalledWith(Dynamic);
        });
      });
    });

    function featureLoader(
        feature = TestFeature,
    ): Promise<readonly [FeatureLoader, EventSupply, AfterEvent<[FeatureLoader?]>]> {
      return new Promise(resolve => {

        const supply = eventSupply();

        requester.request(feature);

        const load = bsContext.get(FeatureKey.of(feature));

        load.tillOff(supply).to(
            loader => resolve([loader!, supply, load]),
        ).cuts(supply);
      });
    }

    async function replaceFeature(
        replacement: Class,
        load: AfterEvent<[FeatureLoader?]>,
    ): Promise<void> {
      FeatureDef.define(replacement, { has: TestFeature });
      requester.request(replacement);

      await new Promise<FeatureLoader>(resolve => {
        load.to(ldr => {
          if (ldr && ldr.request.feature === replacement) {
            resolve(ldr);
          }
        });
      }).then(ldr => ldr.stage);
    }
  });
});
