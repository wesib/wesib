import { noop } from '../util';
import { EventInterest } from './event-producer';

describe('events/event-producer', () => {
  describe('EventInterest', () => {
    describe('none', () => {
      it('is no-op', () => {
        expect(EventInterest.none.off).toBe(noop);
      });
    });
  });
});
