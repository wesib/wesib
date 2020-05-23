import { mergeFunctions } from './functions';
import Mock = jest.Mock;

describe('common', () => {
  describe('mergeFunctions', () => {

    let firstSpy: Mock;
    let secondSpy: Mock;
    let mergeSpy: Mock;

    beforeEach(() => {
      firstSpy = jest.fn().mockReturnValue(1);
      secondSpy = jest.fn().mockReturnValue(2);
      mergeSpy = jest.fn().mockReturnValue(3);
    });

    it('merges function results', () => {

      const merged: (...args: any[]) => any = mergeFunctions(firstSpy, secondSpy, mergeSpy);
      const self = { name: 'this' };
      const args = ['foo', 'bar'];

      expect(merged.apply(self, args)).toBe(3);

      expect(firstSpy).toHaveBeenCalledTimes(1);
      expect(firstSpy).toHaveBeenCalledWith(...args);
      expect(firstSpy.mock.instances[0]).toBe(self);

      expect(secondSpy).toHaveBeenCalledTimes(1);
      expect(secondSpy).toHaveBeenCalledWith(...args);
      expect(secondSpy.mock.instances[0]).toBe(self);

      expect(mergeSpy).toHaveBeenCalledTimes(1);
      expect(mergeSpy).toHaveBeenCalledWith(1, 2);
    });
    it('returns the second function result by default', () => {

      const merged: (...args: any[]) => any = mergeFunctions(firstSpy, secondSpy);
      const self = { name: 'this' };
      const args = ['foo', 'bar'];

      expect(merged.apply(self, args)).toBe(2);

      expect(firstSpy).toHaveBeenCalledTimes(1);
      expect(firstSpy).toHaveBeenCalledWith(...args);
      expect(firstSpy.mock.instances[0]).toBe(self);

      expect(secondSpy).toHaveBeenCalledTimes(1);
      expect(secondSpy).toHaveBeenCalledWith(...args);
      expect(secondSpy.mock.instances[0]).toBe(self);

      expect(mergeSpy).not.toHaveBeenCalled();
    });
    it('returns the function if another one is absent', () => {
      expect(mergeFunctions(firstSpy, undefined)).toBe(firstSpy);
      expect(mergeFunctions(undefined, secondSpy)).toBe(secondSpy);
    });
  });
});
