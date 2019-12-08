import { SingleContextUpKey } from 'context-values';
import { eventSupply, EventSupply } from 'fun-events';
import { Class } from '../../common';
import { Component, ComponentContext } from '../../component';
import { CustomElements } from '../../component/definition';
import { Feature } from '../../feature';
import { MockElement } from '../../spec/test-element';
import { BootstrapContext } from '../bootstrap-context';
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

      const supply = await loadFeature(TestFeature);

      expect(receiver).toHaveBeenLastCalledWith('provided');

      supply.off();
      await Promise.resolve();
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

      const supply = await loadFeature(TestFeature);

      expect(receiver).toHaveBeenLastCalledWith('provided');

      supply.off();
      await Promise.resolve();
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

      const supply = await loadFeature(TestFeature);
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent);

      expect(receiver).toHaveBeenCalledWith('provided');

      supply.off();
      await Promise.resolve();
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

      const supply = await loadFeature(TestFeature);
      await loadFeature(TestComponent);
      await bsContext.whenDefined(TestComponent).then(({ elementType }) => new elementType());

      expect(receiver).toHaveBeenCalledWith('provided');

      supply.off();
      await Promise.resolve();
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

      const supply = await loadFeature(TestFeature);

      supply.off();
      await Promise.resolve();

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

      const supply = await loadFeature(TestFeature);
      await loadFeature(SubTypeComponent);
      await bsContext.whenDefined(SubTypeComponent);

      expect(receiver).toHaveBeenCalledWith('provided');

      supply.off();
      await Promise.resolve();
      expect(receiver).toHaveBeenCalledWith('default');

      await loadFeature(TestFeature);
      expect(receiver).toHaveBeenCalledWith('provided');
    });
  });

  function loadFeature(
      feature: Class,
  ): Promise<EventSupply> {
    return new Promise(resolve => {

      const supply = eventSupply();

      bsContext.load(feature)({
        supply,
        receive(_ctx, { ready }) {
          if (ready) {
            resolve(supply);
          }
        },
      });
    });
  }
});
