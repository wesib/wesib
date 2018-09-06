import { WesComponent } from '../../component';
import { FeatureDef } from '../../feature';
import { AttributesDef } from './attributes-def';
import './attributes-def.ns';
import { AttributesSupport } from './attributes-support.feature';
import Spy = jasmine.Spy;

describe('features/attributes/attributes-def', () => {
  describe('AttributesDef', () => {
    describe('of', () => {
      it('extracts attributes definition', () => {

        class TestComponent {
          static [AttributesDef.symbol]: AttributesDef = {
            attr: () => {},
          };
        }

        expect(AttributesDef.of(TestComponent)).toBe(TestComponent[AttributesDef.symbol]);
      });
      it('builds empty attributes definition if it is absent', () => {

        class TestComponent {}

        expect(AttributesDef.of(TestComponent)).toEqual({});
      });
      it('requests inherited definition', () => {

        class A {
          static [AttributesDef.symbol]: AttributesDef = {
            attr: () => {},
          };
        }
        class B extends A {}

        expect(AttributesDef.of(B)).toEqual(A[AttributesDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [AttributesDef.symbol]: AttributesDef = {
            attr1: () => {},
          };
        }
        class B extends A {
          static [AttributesDef.symbol]: AttributesDef = {
            attr2: () => {},
          };
        }

        expect<any>(AttributesDef.of(B))
            .toEqual(AttributesDef.merge(A[AttributesDef.symbol], B[AttributesDef.symbol]));
      });
    });

    describe('merge', () => {

      let attr1: Spy;
      let attr2: Spy;

      beforeEach(() => {
        attr1 = jasmine.createSpy('attr1');
        attr2 = jasmine.createSpy('attr2');
      });

      it('extends attributes', () => {
        expect(AttributesDef.merge({ attr1 }, { attr2 }))
            .toEqual({ attr1, attr2 });

      });
      it('merges attributes', () => {

        const def = AttributesDef.merge({ attr1 }, { attr1: attr2 });
        const attr = def.attr1;
        const self = { name: 'object' };
        const oldValue = 'old value';
        const newValue = 'new value';

        attr.call(self, oldValue, newValue);

        expect(attr1).toHaveBeenCalledWith(oldValue, newValue);
        expect(attr1.calls.first().object).toBe(self);
        expect(attr2).toHaveBeenCalledWith(oldValue, newValue);
        expect(attr2.calls.first().object).toBe(self);
      });
    });

    describe('define', () => {
      it('enables attributes support', () => {

        @WesComponent({ name: 'test-component' })
        class TestComponent {
        }

        AttributesDef.define(TestComponent);

        expect(FeatureDef.of(TestComponent).requires).toContain(AttributesSupport);
      });
    });
  });
});
