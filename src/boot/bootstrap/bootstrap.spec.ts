import { SingleContextUpKey } from '@proc7ts/context-values/updatable';
import { afterSupplied, afterThe } from '@proc7ts/fun-events';
import { Class, noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { CustomElements, DefinitionContext } from '../../component/definition';
import { Feature, FeatureContext, FeatureDef, FeatureRef, FeatureStatus } from '../../feature';
import { MockElement } from '../../testing';
import { BootstrapContext } from '../bootstrap-context';
import { BootstrapSetup } from '../bootstrap-setup';
import { bootstrapComponents } from './bootstrap-components';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('boot', () => {

  let bsContext: BootstrapContext;
  let mockCustomElements: Mocked<CustomElements>;

  beforeEach(async () => {
    mockCustomElements = {
      define: jest.fn(),
      whenDefined: jest.fn(_componentType => Promise.resolve()),
    };

    @Feature({
      setup(setup) {
        setup.provide({ a: CustomElements, is: mockCustomElements });
      },
    })
    class TestBootstrapFeature {}

    bsContext = await bootstrapComponents(TestBootstrapFeature).whenReady;
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

      featureRef.supply.off();
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

      featureRef.supply.off();
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

      featureRef.supply.off();
      bsSetup.provide({ a: key, is: 'provided' });
      expect(receiver).toHaveBeenLastCalledWith('default');
    });
  });

  describe('component used as feature', () => {
    it('applies feature options', async () => {
      bsContext.get(key)(receiver);

      @Component({
        name: 'test-component',
        feature: {
          setup(setup) {
            setup.provide({ a: key, is: 'component feature value' });
          },
        },
      })
      class TestComponent {}

      await loadFeature(TestComponent);

      expect(receiver).toHaveBeenLastCalledWith('component feature value');
    });
    it('applies feature options when used as dependency', async () => {
      bsContext.get(key)(receiver);

      @Component({
        name: 'test-component',
        feature: {
          setup(setup) {
            setup.provide({ a: key, is: 'component feature value' });
          },
        },
      })
      class TestComponent {}

      @Feature({ needs: TestComponent })
      class TestFeature {}

      await loadFeature(TestFeature);

      expect(receiver).toHaveBeenLastCalledWith('component feature value');
    });
    it('registers the component', async () => {
      @Component('test-component')
      class TestComponent {}

      await loadFeature(TestComponent);
      expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent, expect.any(Function));
    });
    it('notifies on component definition', async () => {

      const onDefinition = jest.fn();

      @Component({
        name: 'test-component',
        feature: {
          setup(setup) {
            setup.onDefinition(onDefinition);
          },
        },
      })
      class TestComponent {}

      await loadFeature(TestComponent);
      expect(onDefinition).toHaveBeenCalledWith(expect.objectContaining({ componentType: TestComponent }));
    });
    it('registers the component when used as dependency', async () => {
      @Component('test-component')
      class TestComponent {}

      @Feature({ needs: TestComponent })
      class TestFeature {}

      await loadFeature(TestFeature);
      expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent, expect.any(Function));
    });
    it('does not register the base component', async () => {

      @Component('base-component')
      class BaseComponent {}

      @Component('test-component')
      class TestComponent extends BaseComponent {}

      await loadFeature(TestComponent);
      expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent, expect.any(Function));
      expect(mockCustomElements.define).not.toHaveBeenCalledWith(BaseComponent, expect.anything());
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

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      featureRef.supply.off();
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

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      featureRef.supply.off();
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

      const element = await bsContext.whenDefined(TestComponent).then(({ elementType }) => new elementType());

      await ComponentSlot.of(element).whenReady;
      expect(receiver).toHaveBeenCalledWith('provided');

      featureRef.supply.off();
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
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

      featureRef.supply.off();
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });

    describe('whenReady', () => {
      it('is notified on component definition readiness', async () => {

        const whenReady = jest.fn();

        @Component('test-component')
        class TestComponent {
        }

        @Feature({
          setup(setup) {
            setup.setupDefinition(TestComponent)(defSetup => {
              expect(defSetup.componentType).toBe(TestComponent);
              defSetup.whenReady(whenReady);
            });
          },
        })
        class TestFeature {
        }

        await loadFeature(TestFeature);
        await loadFeature(TestComponent);
        await bsContext.whenDefined(TestComponent);

        expect(whenReady).toHaveBeenCalled();
      });
      it('is not notified on component definition readiness after feature unloaded', async () => {

        const whenReady = jest.fn();

        @Component('test-component')
        class TestComponent {
        }

        @Feature({
          setup(setup) {
            setup.setupDefinition(TestComponent)(defSetup => {
              defSetup.whenReady(whenReady);
            });
          },
        })
        class TestFeature {
        }

        const featureRef = await loadFeature(TestFeature);

        featureRef.supply.off();
        await loadFeature(TestComponent);
        await bsContext.whenDefined(TestComponent);

        expect(whenReady).not.toHaveBeenCalled();
      });
    });

    describe('whenComponent', () => {

      let element1: Element;
      let element2: Element;
      let element3: Element;

      beforeEach(() => {
        element1 = document.body.appendChild(document.createElement('test-element-1'));
        element2 = document.body.appendChild(document.createElement('test-element-2'));
        element3 = document.body.appendChild(document.createElement('test-element-2'));
        element3.setAttribute('id', '3');
      });
      afterEach(() => {
        element1.remove();
        element2.remove();
        element3.remove();
      });

      let whenComponent11: Mock<void, [ComponentContext]>;
      let whenComponent12: Mock<void, [ComponentContext]>;
      let whenComponent21: Mock<void, [ComponentContext]>;
      let defContext1: DefinitionContext;
      let defContext2: DefinitionContext;
      let context1: ComponentContext;
      let context2: ComponentContext;

      beforeEach(async () => {
        whenComponent11 = jest.fn();
        whenComponent12 = jest.fn();
        whenComponent21 = jest.fn();

        @Component('test-element-1')
        class TestComponent1 {}

        @Component('test-element-2')
        class TestComponent2 {}

        @Feature({
          needs: [TestComponent1, TestComponent2],
          setup(setup) {
            setup.setupDefinition(TestComponent1)(defSetup => {
              defSetup.whenComponent(whenComponent11);
              defSetup.whenComponent(whenComponent12);
            });
            setup.setupDefinition(TestComponent2)(defSetup => {
              defSetup.whenComponent(whenComponent21);
            });
          },
        })
        class TestFeature {}

        await loadFeature(TestFeature);

        [defContext1, defContext2] = await Promise.all([
          bsContext.whenDefined(TestComponent1),
          bsContext.whenDefined(TestComponent2),
        ]);
        context1 = defContext1.mountTo(element1);
        context2 = defContext2.mountTo(element2);
      });

      it('notifies on component instantiation', () => {
        expect(whenComponent11).toHaveBeenCalledWith(context1);
        expect(whenComponent12).toHaveBeenCalledWith(context1);
        expect(whenComponent21).toHaveBeenCalledWith(context2);
        expect(whenComponent11).toHaveBeenCalledTimes(1);
        expect(whenComponent12).toHaveBeenCalledTimes(1);
        expect(whenComponent21).toHaveBeenCalledTimes(1);
      });
      it('notifies new receiver immediately on already instantiated component', () => {

        const whenComponent13 = jest.fn();

        context1.get(DefinitionContext).whenComponent(whenComponent13);
        expect(whenComponent13).toHaveBeenCalledWith(context1);
        expect(whenComponent13).toHaveBeenCalledTimes(1);
      });
      it('notifies on recurrent component mount', () => {
        context2.get(DefinitionContext).whenComponent({
          receive(eventContext) {
            eventContext.onRecurrent(noop);
            defContext2.mountTo(element3);
          },
        });
        expect(whenComponent21).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('FeatureContext', () => {

    let featureRef: FeatureRef;
    let context: FeatureContext;

    beforeEach(async () => {
      @Feature({
        init(ctx) {
          context = ctx;
        },
      })
      class TestFeature {
      }

      featureRef = bsContext.load(TestFeature);

      await featureRef.whenReady;
    });

    describe('load', () => {

      let key: SingleContextUpKey<string>;

      beforeEach(() => {
        key = new SingleContextUpKey('test', { byDefault: () => 'default' });
      });

      it('loads another feature', async () => {

        @Feature({
          setup(setup) {
            setup.provide({ a: key, is: 'loaded' });
          },
        })
        class OtherFeature {
        }

        await context.load(OtherFeature).whenReady;

        expect(await bsContext.get(key)).toBe('loaded');
      });
      it('unloads another feature when unloaded', async () => {

        @Feature({
          setup(setup) {
            setup.provide({ a: key, is: 'loaded' });
          },
        })
        class OtherFeature {
        }

        const otherRef = context.load(OtherFeature);

        await otherRef.whenReady;
        featureRef.supply.off();

        expect(otherRef.supply.isOff).toBe(true);
        expect(await bsContext.get(key)).toBe('default');
      });
      it('unloads another feature when user supply cut off', async () => {

        @Feature({
          setup(setup) {
            setup.provide({ a: key, is: 'loaded' });
          },
        })
        class OtherFeature {
        }

        const user = new Supply();
        const otherRef = context.load(OtherFeature, user);

        await otherRef.whenReady;
        user.supply.off();

        expect(otherRef.supply.isOff).toBe(true);
        expect(await bsContext.get(key)).toBe('default');
      });
    });

    describe('define', () => {
      it('defines components', async () => {

        @Component('test-component-1')
        class TestComponent1 {
        }
        @Component('test-component-2')
        class TestComponent2 {
        }
        @Feature({
          init(context) {
            context.define(TestComponent1);
            context.define(TestComponent2);
          },
        })
        class TestComponentsFeature {
        }

        await bsContext.load(TestComponentsFeature).whenReady;
        expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent1, expect.any(Function));
        expect(mockCustomElements.define).toHaveBeenCalledWith(TestComponent2, expect.any(Function));
      });
      it('does not allow to define components after initialization', () => {

        @Component('test-component')
        class TestComponent {
        }

        expect(() => context.define(TestComponent)).toThrow(TypeError);
      });
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
      await new Promise<void>(resolve => {
        bsContext.load(Replacement).read(({ ready }) => ready && resolve());
      });

      expect(initSpy).toHaveBeenCalledTimes(1);
      expect(statusReceiver).toHaveBeenLastCalledWith({ feature: Replacement, ready: true });
    });
    it('informs on feature replacement load', async () => {
      await loadFeatureStatus();
      statusReceiver.mockClear();

      class Replacement {}
      FeatureDef.define(Replacement, { has: testFeature });
      await new Promise<void>(resolve => {
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
      describe('supply.off', () => {
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

          featureRef.supply.off();
          expect(value).toBeUndefined();
        });
      });
    });

    function loadFeatureStatus(receive: Mock<void, [FeatureStatus]> = statusReceiver): Promise<FeatureRef> {
      return new Promise<FeatureRef>(resolve => {

        const featureRef = bsContext.load(testFeature);

        featureRef.read(receive.mockImplementation(({ ready }) => ready && resolve(featureRef)));
      });
    }
  });

  function loadFeature(feature: Class): Promise<FeatureRef> {
    return new Promise<FeatureRef>(resolve => {

      const ref = bsContext.load(feature);

      ref.read(({ ready }) => ready && resolve(ref));
    });
  }
});
