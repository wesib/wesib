import { mergeLists } from './lists';

describe('util/lists', () => {
  describe('mergeLists', () => {
    it('returns the only value if another one is missing', () => {

      const list = [1, 2, 3];

      expect(mergeLists(list, undefined)).toBe(list);
      expect(mergeLists(undefined, list)).toBe(list);
    });
    it('merges two arrays', () => {

      const first = [1, 2, 3];
      const second = [4, 5, 6];

      expect(mergeLists(first, second)).toEqual([...first, ...second]);
    });
    it('merges array and value arrays', () => {

      const list = [1, 2, 3];
      const value = 4;

      expect(mergeLists(list, value)).toEqual([...list, value]);
      expect(mergeLists(value, list)).toEqual([value, ...list]);
    });
    it('merges two values', () => {

      const first = 1;
      const second = 2;

      expect(mergeLists(first, second)).toEqual([first, second]);
    });
  });
});
