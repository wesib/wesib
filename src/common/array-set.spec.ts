import { ArraySet } from './array-set';

describe('common/array-set', () => {
  describe('ArraySet', () => {
    describe('empty value', () => {

      let set: ArraySet<number>;

      beforeEach(() => {
        set = new ArraySet();
      });

      it('has no items', () => {
        expect(set.size).toBe(0);
        expect(set.value).toBeUndefined();
        expect([...set]).toEqual([]);
      });
      it('adds value', () => {
        set.add(3);
        expect(set.value).toBe(3);
      });
      it('adds array', () => {
        set.add(3, 4);
        expect(set.value).toEqual([3, 4]);
      });
    });
    describe('single value', () => {

      let set: ArraySet<number>;

      beforeEach(() => {
        set = new ArraySet(1);
      });

      it('contains item', () => {
        expect(set.size).toBe(1);
        expect(set.value).toBe(1);
        expect([...set]).toEqual([1]);
      });
      it('does not duplicate item', () => {
        expect(set.add(1).value).toBe(1);
      });
      it('extends to array', () => {
        set.add(2);
        expect(set.value).toEqual([1, 2]);
      });
    });
    describe('array value', () => {

      let value: number[];
      let set: ArraySet<number>;

      beforeEach(() => {
        value = [1, 2];
        set = new ArraySet(value);
      });

      it('contains items', () => {
        expect(set.size).toBe(value.length);
        expect(set.value).toEqual(value);
        expect([...set]).toEqual(value);
      });
      it('does not duplicate items', () => {
        expect(set.add(1, 2).value).toEqual(value);
      });
      it('extends array', () => {
        set.add(3, 4, 5);
        expect(set.value).toEqual([...value, 3, 4, 5]);
      });
    });
    describe('merge', () => {

      let value: number[];
      let set: ArraySet<number>;

      beforeEach(() => {
        value = [1, 2];
        set = new ArraySet([1, 2]);
      });
      it('does not merge undefined', () => {
        expect(set.merge(undefined).value).toEqual(value);
      });
      it('merges single value', () => {
        expect(set.merge(3).value).toEqual([...value, 3]);
      });
      it('merges multiple value', () => {
        expect(set.merge([1, 3, 5]).value).toEqual([...value, 3, 5]);
      });
    });
  });
});
