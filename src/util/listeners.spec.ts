import { Listeners } from './listeners';

describe('util/listeners', () => {
  describe('Listeners', () => {

    let listeners: Listeners<Function>;

    beforeEach(() => {
      listeners = new Listeners();
    });

    it('registers listener', () => {

      const listener = () => {};

      listeners.add(listener);

      expect(listeners.all).toContain(listener);
    });
    it('unregisters listener on handle disposal', () => {

      const listener = () => {};
      const handle = listeners.add(listener);

      handle.dispose();

      expect(listeners.all).not.toContain(listener);
    });
  });
});
