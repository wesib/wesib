import { Listeners } from './listeners';

describe('util/listeners', () => {
  describe('Listeners', () => {

    let listeners: Listeners<Function>;

    beforeEach(() => {
      listeners = new Listeners();
    });

    it('registers listener', () => {

      const listener = () => {};

      listeners.register(listener);

      expect(listeners).toContain(listener);
    });
    it('unregisters listener on handle disposal', () => {

      const listener = () => {};
      const handle = listeners.register(listener);

      handle.dispose();

      expect(listeners).not.toContain(listener);
    });
  });
});
