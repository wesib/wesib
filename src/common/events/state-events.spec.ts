import { StateValueKey } from './state-events';

describe('events/state-events', () => {
  describe('StateValueKey', () => {
    describe('normalize', () => {
      it('normalizes non-compound state value key', () => {
        expect(StateValueKey.normalize('key')).toEqual(['key']);
        expect(StateValueKey.normalize(0)).toEqual([0]);

        const key = Symbol('key');

        expect(StateValueKey.normalize(key)).toEqual([key]);
      });
      it('does not alter normalized value keys', () => {

        const key1 = ['key'];
        const key2 = ['key', 2];

        expect(StateValueKey.normalize(key1)).toBe(key1);
        expect(StateValueKey.normalize(key2)).toBe(key2);
      });
    });
  });
});
