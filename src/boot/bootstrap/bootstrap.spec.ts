import { SingleContextUpKey } from 'context-values';
import { eventSupply, EventSupply } from 'fun-events';
import { Class } from '../../common';
import { Feature } from '../../feature';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapComponents } from './bootstrap-components';
import Mock = jest.Mock;

describe('boot', () => {

  let bsContext: BootstrapContext;

  beforeEach(async () => {
    bsContext = bootstrapComponents();
    await new Promise(resolve => bsContext.whenReady(resolve));
  });

  describe('context values', () => {

    let key: SingleContextUpKey<string>;
    let receiver: Mock<void, [string]>;

    beforeEach(() => {
      key = new SingleContextUpKey<string>('test-key', { byDefault: () => 'default' });
      receiver = jest.fn();
    });

    it('sets up bootstrap context values', async () => {
      bsContext.get(key)(receiver);

      @Feature({
        set: { a: key, is: 'provided' },
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
