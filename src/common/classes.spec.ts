import { superClassOf } from './classes';

describe('util/classes', () => {
  describe('superClassOf', () => {
    it('finds object super class', () => {

      class TestClass {}

      expect(superClassOf(TestClass)).toBe(Object);
    });
    it('does not find Objects super class', () => {
      expect(superClassOf(Object)).toBeUndefined();
    });
    it('finds super class', () => {

      class A {}
      class B extends A {}
      class C extends B {}

      expect(superClassOf(C)).toBe(B);
    });
    it('finds super class satisfying the given criteria', () => {

      class A {}
      class B extends A {}
      class C extends B {}

      expect(superClassOf(C, type => type.name === 'A')).toBe(A);
    });
  });
});
