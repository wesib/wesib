import { mergeFunctions, noop } from './functions';
import Spy = jasmine.Spy;

describe('util/functions', () => {
  describe('noop', () => {
    it('returns nothing', () => {
      expect(noop()).toBeUndefined();
    });
  });

  describe('mergeFunctions', () => {

    let firstSpy: Spy;
    let secondSpy: Spy;
    let mergeSpy: Spy;

    beforeEach(() => {
      firstSpy = jasmine.createSpy('first').and.returnValue(1);
      secondSpy = jasmine.createSpy('second').and.returnValue(2);
      mergeSpy = jasmine.createSpy('merge').and.returnValue(3);
    });

    it('merges function results', () => {

      const merged: Function = mergeFunctions(firstSpy, secondSpy, mergeSpy);
      const self = { name: 'this' };
      const args = ['foo', 'bar'];

      expect(merged.apply(self, args)).toBe(3);

      expect(firstSpy).toHaveBeenCalledTimes(1);
      expect(firstSpy).toHaveBeenCalledWith(...args);
      expect(firstSpy.calls.first().object).toBe(self);

      expect(secondSpy).toHaveBeenCalledTimes(1);
      expect(secondSpy).toHaveBeenCalledWith(...args);
      expect(secondSpy.calls.first().object).toBe(self);

      expect(mergeSpy).toHaveBeenCalledTimes(1);
      expect(mergeSpy).toHaveBeenCalledWith(1, 2);
    });
    it('returns the second function result by default', () => {

      const merged: Function = mergeFunctions(firstSpy, secondSpy);
      const self = { name: 'this' };
      const args = ['foo', 'bar'];

      expect(merged.apply(self, args)).toBe(2);

      expect(firstSpy).toHaveBeenCalledTimes(1);
      expect(firstSpy).toHaveBeenCalledWith(...args);
      expect(firstSpy.calls.first().object).toBe(self);

      expect(secondSpy).toHaveBeenCalledTimes(1);
      expect(secondSpy).toHaveBeenCalledWith(...args);
      expect(secondSpy.calls.first().object).toBe(self);

      expect(mergeSpy).not.toHaveBeenCalled();
    });
    it('returns the function if another one is absent', () => {
      expect(mergeFunctions(firstSpy, undefined)).toBe(firstSpy);
      expect(mergeFunctions(undefined, secondSpy)).toBe(secondSpy);
    });
  });
});
