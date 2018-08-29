import { WebComponent } from '../../decorators';
import { FeatureDef } from '../../feature';
import { DomPropertiesDef } from './dom-properties-def';
import { DomPropertiesSupport } from './dom-properties-support';
import './dom-properties-def.ns';

describe('features/dom-properties/dom-properties-def', () => {
  describe('DomPropertiesDef', () => {
    describe('of', () => {
      it('extracts properties definition', () => {

        class TestComponent {
          static [DomPropertiesDef.symbol]: DomPropertiesDef = {
            prop: { value: 1 },
          };
        }

        expect(DomPropertiesDef.of(TestComponent)).toBe(TestComponent[DomPropertiesDef.symbol]);
      });
      it('builds empty properties definition if it is absent', () => {

        class TestComponent {}

        expect(DomPropertiesDef.of(TestComponent)).toEqual({});
      });
      it('requests inherited definition', () => {

        class A {
          static [DomPropertiesDef.symbol]: DomPropertiesDef = {
            prop: { value: 1 },
          };
        }
        class B extends A {}

        expect(DomPropertiesDef.of(B)).toEqual(A[DomPropertiesDef.symbol]);
      });
      it('merges with inherited definition', () => {

        class A {
          static [DomPropertiesDef.symbol]: DomPropertiesDef = {
            prop1: { value: 1 },
          };
        }
        class B extends A {
          static [DomPropertiesDef.symbol]: DomPropertiesDef = {
            prop2: { value: 2 },
          };
        }

        expect<any>(DomPropertiesDef.of(B))
            .toEqual(DomPropertiesDef.merge(A[DomPropertiesDef.symbol], B[DomPropertiesDef.symbol]));
      });
    });

    describe('merge', () => {

      let prop1: PropertyDescriptor;
      let prop2: PropertyDescriptor;

      beforeEach(() => {
        prop1 = { value: 1 };
        prop2 = { value: 2 };
      });

      it('extends property definitions', () => {
        expect(DomPropertiesDef.merge({ prop1 }, { prop2 }))
            .toEqual({ prop1, prop2 });

      });
      it('overrides property definitions', () => {

        const def = DomPropertiesDef.merge({ prop1 }, { prop1: prop2 });

        expect(def).toEqual({ prop1: prop2 });
      });
    });

    describe('define', () => {
      it('enables DOM properties support', () => {

        @WebComponent({ name: 'test-component' })
        class TestComponent {
        }

        DomPropertiesDef.define(TestComponent);

        expect(FeatureDef.of(TestComponent).requires).toContain(DomPropertiesSupport);
      });
    });
  });
});
