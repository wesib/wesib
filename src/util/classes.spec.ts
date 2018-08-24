import { superClass } from './classes';

describe('util/classes', () => {
  describe('superClass', () => {
    it('finds object super class', () => {

      class TestClass {}

      expect(superClass(TestClass)).toBe(Object);
    });
    it('does not find Objects super class', () => {
      expect(superClass(Object)).toBeUndefined();
    });
    it('finds super class', () => {

      class A {}
      class B extends A {}
      class C extends B {}

      expect(superClass(C)).toBe(B);
    });
    it('finds super class satisfying the given criteria', () => {

      class A {}
      class B extends A {}
      class C extends B {}

      expect(superClass(C, type => type.name === 'A')).toBe(A);
    });
  });
});
