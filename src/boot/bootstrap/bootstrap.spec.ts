import { SingleContextUpKey } from 'context-values';
import { afterSupplied, afterThe } from 'fun-events';
import { Class } from '../../common';
import { Component, ComponentContext } from '../../component';
import { CustomElements } from '../../component/definition';
import { Feature, FeatureDef, FeatureRef, FeatureStatus } from '../../feature';
import { MockElement } from '../../spec/test-element';
import { BootstrapContext } from '../bootstrap-context';
import { BootstrapSetup } from '../bootstrap-setup';
import { bootstrapComponents } from './bootstrap-components';
import Mock = jest.Mock;

describe('boot', () => {

  let bsContext: BootstrapContext;

  beforeEach(async () => {

    const customElements: CustomElements = {

      define(): void {
      },

      whenDefined(): Promise<void> {
        return Promise.resolve();
      },

    };

    @Feature({
      setup(setup) {
        setup.provide({ a: CustomElements, is: customElements });
      },
    })
    class TestBootstrapFeature {}

    bsContext = bootstrapComponents(TestBootstrapFeature);
    await new Promise(resolve => bsContext.whenReady(resolve));
  });

  let key: SingleContextUpKey<string>;
  let receiver: Mock<void, [string]>;

  beforeEach(() => {
    key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
    receiver = jest.fn();
  });

  describe('context values', () => {
    it('sets up bootstrap context values', async () => {
      bsContext.get(key)(receiver);

      @Feature({
        setup(setup) {
          setup.provide({ a: key, is: 'provided' });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);

      expect(receiver).toHaveBeenLastCalledWith('provided');

      await featureRef.dismiss();
      expect(receiver).toHaveBeenLastCalledWith('default');
    });
    it('provides bootstrap context values', async () => {
      bsContext.get(key)(receiver);

      @Feature({
        init(ctx) {
          ctx.provide({ a: key, is: 'provided' });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);

      expect(receiver).toHaveBeenLastCalledWith('provided');

      await featureRef.dismiss();
      expect(receiver).toHaveBeenLastCalledWith('default');
    });
    it('does not set up bootstrap context values when feature unloaded already', async () => {
      bsContext.get(key)(receiver);

      let bsSetup!: BootstrapSetup;

      @Feature({
        setup(setup) {
          bsSetup = setup;
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);

      await featureRef.dismiss();
      bsSetup.provide({ a: key, is: 'provided' });
      expect(receiver).toHaveBeenLastCalledWith('default');
    });
  });

  describe('component definition setup', () => {
    it('sets up definition context value', async () => {

      @Component({
        name: 'test-component',
        define(context) {
          context.get(key)(receiver);
        },
      })
      class TestComponent {}

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            defSetup.perDefinition({ a: key, is: 'provided' });
          });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent);

      expect(receiver).toHaveBeenCalledWith('provided');

      featureRef.dismiss();
      await featureRef.down;
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });
    it('sets up definition context value when component is defined already', async () => {

      @Component({
        name: 'test-component',
        define(context) {
          context.get(key)(receiver);
        },
      })
      class TestComponent {}

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            defSetup.perDefinition({ a: key, is: 'provided' });
          });
        },
      })
      class TestFeature {}

      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent);

      const featureRef = await loadFeature(TestFeature);

      expect(receiver).toHaveBeenCalledWith('provided');

      featureRef.dismiss();
      await featureRef.down;
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });
    it('sets up component context value', async () => {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      class TestComponent {
        constructor(context: ComponentContext) {
          context.get(key)(receiver);
        }
      }

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            defSetup.perComponent({ a: key, is: 'provided' });
          });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent).then(({ elementType }) => new elementType());

      expect(receiver).toHaveBeenCalledWith('provided');

      await featureRef.dismiss();
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });
    it('is notified on component readiness', async () => {

      const whenReady = jest.fn();

      @Component('test-component')
      class TestComponent {}

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            expect(defSetup.componentType).toBe(TestComponent);
            defSetup.whenReady(whenReady);
          });
        },
      })
      class TestFeature {}

      await loadFeature(TestFeature);
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent);

      expect(whenReady).toHaveBeenCalled();
    });
    it('is not notified on component readiness after feature unloaded', async () => {

      const whenReady = jest.fn();

      @Component('test-component')
      class TestComponent {}

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            defSetup.whenReady(whenReady);
          });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);

      await featureRef.dismiss();
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent);

      expect(whenReady).not.toHaveBeenCalled();
    });
    it('sets up component subtype', async () => {

      @Component('test-component')
      class TestComponent {}

      @Component({
        name: 'sub-type-component',
        define(context) {
          context.get(key)(receiver);
        },
      })
      class SubTypeComponent extends TestComponent {}

      @Feature({
        setup(setup) {
          setup.setupDefinition(TestComponent)(defSetup => {
            defSetup.perDefinition({ a: key, is: 'provided' });
          });
        },
      })
      class TestFeature {}

      const featureRef = await loadFeature(TestFeature);
      await loadFeature(SubTypeComponent);
      await bsContext.whenDefined(SubTypeComponent);

      expect(receiver).toHaveBeenCalledWith('provided');

      await featureRef.dismiss();
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });
  });

  describe('feature load', () => {

    let testFeature: Class;
    let statusReceiver: Mock<void, [FeatureStatus]>;

    beforeEach(() => {
      testFeature = class TestFeature {};
      statusReceiver = jest.fn();
    });

    it('configures feature', async () => {

      let setupFeature!: Class;
      let loadedFeature!: Class;

      await loadFeature(FeatureDef.define(
          testFeature,
          {
            setup(setup) {
              setupFeature = setup.feature;
            },
            init(context) {
              loadedFeature = context.feature;
            },
          },
      ));

      expect(setupFeature).toBe(testFeature);
      expect(loadedFeature).toBe(testFeature);
    });
    it('loads the feature', async () => {
      await loadFeatureStatus();
      expect(statusReceiver).toHaveBeenCalledWith({ feature: testFeature, ready: false });
      expect(statusReceiver).toHaveBeenLastCalledWith({ feature: testFeature, ready: true });
      expect(statusReceiver).toHaveBeenCalledTimes(2);
    });
    it('does not reload already loaded feature', async () => {
      await loadFeatureStatus();
      statusReceiver.mockClear();

      const receiver2 = jest.fn();

      await loadFeatureStatus(receiver2);
      expect(statusReceiver).not.toHaveBeenCalled();
      expect(receiver2).toHaveBeenCalledWith({ feature: testFeature, ready: true });
      expect(receiver2).toHaveBeenCalledTimes(1);
    });
    it('readies the feature only when it is loaded', async () => {

      const readySpy = jest.fn();

      FeatureDef.define(
          testFeature,
          {
            init(ctx) {
              ctx.whenReady(readySpy);
              expect(readySpy).not.toHaveBeenCalled();
            },
          },
      );

      await loadFeatureStatus();
      expect(readySpy).toHaveBeenCalledTimes(1);
    });
    it('replaces the loaded feature', async () => {

      const initSpy = jest.fn();

      await loadFeatureStatus();
      statusReceiver.mockClear();

      class Replacement {}
      FeatureDef.define(Replacement, { init: initSpy, has: testFeature });
      await new Promise(resolve => {
        bsContext.load(Replacement).read(({ ready }) => {
          if (ready) {
            resolve();
          }
        });
      });

      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(statusReceiver).toHaveBeenLastCalledWith({ feature: Replacement, ready: true });
    });
    it('informs on feature replacement load', async () => {
      await loadFeatureStatus();
      statusReceiver.mockClear();

      class Replacement {}
      FeatureDef.define(Replacement, { has: testFeature });
      await new Promise(resolve => {
        bsContext.load(Replacement).read(({ ready }) => {
          if (ready) {
            resolve();
          }
        });
      });

      expect(statusReceiver).toHaveBeenCalledWith({ feature: Replacement, ready: false });
      expect(statusReceiver).toHaveBeenLastCalledWith({ feature: Replacement, ready: true });
      expect(statusReceiver).toHaveBeenCalledTimes(2);
    });

    describe('FeatureRef', () => {
      describe('[AfterEvent__symbol]', () => {
        it('is an alias of `read`', async () => {

          const featureRef = await loadFeatureStatus();

          expect(afterSupplied(featureRef)).toBe(featureRef.read);
        });
      });
      describe('off', () => {
        it('unloads the feature', async () => {
          FeatureDef.define(
              testFeature,
              {
                setup(setup) {
                  setup.provide({ a: key, is: 'provided' });
                },
              },
          );
          const featureRef = await loadFeatureStatus();

          let value: string | undefined;

          bsContext.get(key, { or: afterThe<[string?]>() })(v => value = v);
          expect(value).toBe('provided');

          await featureRef.dismiss('reason');
          expect(value).toBeUndefined();
        });
      });
    });

    function loadFeatureStatus(receive: Mock<void, [FeatureStatus]> = statusReceiver): Promise<FeatureRef> {
      return new Promise<FeatureRef>(resolve => {

        const featureRef = bsContext.load(testFeature);

        featureRef.read(receive.mockImplementation(loaded => {
          if (loaded.ready) {
            resolve(featureRef);
          }
        }));
      });
    }
  });

  function loadFeature(feature: Class): Promise<FeatureRef> {
    return new Promise<FeatureRef>(resolve => {

      const ref = bsContext.load(feature);

      ref.read(({ ready }) => {
        if (ready) {
          resolve(ref);
        }
      });
    });
  }
});
