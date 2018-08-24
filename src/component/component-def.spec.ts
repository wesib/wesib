import { AttributeDef, ComponentDef } from './component-def';
import Spy = jasmine.Spy;

describe('component/component-def', () => {
  describe('ComponentDef', () => {
    describe('merge', () => {
      it('merges name', () => {
        expect(ComponentDef.merge({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
        expect(ComponentDef.merge({ name: 'name1' }, {})).toEqual({ name: 'name1' });
        expect(ComponentDef.merge({}, { name: 'name2' })).toEqual({ name: 'name2' });
      });
      it('merges element extension', () => {
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            { extend: { name: 'input', type: HTMLInputElement } }))
            .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            {}))
            .toEqual({ extend: { name: 'div', type: HTMLDivElement } });
        expect(ComponentDef.merge<HTMLElement>(
            { extend: { name: 'div', type: HTMLDivElement } },
            { extend: { name: 'input', type: HTMLInputElement } }))
            .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
      });
      it('merges properties', () => {
        expect(ComponentDef.merge(
            { properties: { prop1: { value: 'value1' } } },
            { properties: { prop2: { value: 'value2' } } }))
            .toEqual({
              properties: {
                prop1: { value: 'value1' },
                prop2: { value: 'value2' },
              }
            });
        expect(ComponentDef.merge(
            { properties: { prop1: { value: 'value1' } } },
            { properties: { prop1: { value: 'value2' } } }))
            .toEqual({ properties: { prop1: { value: 'value2' } } });
      });
      describe('attributes', () => {

        let attr1: Spy;
        let attr2: Spy;

        beforeEach(() => {
          attr1 = jasmine.createSpy('attr1');
          attr2 = jasmine.createSpy('attr2');
        });

        it('are extended', () => {
          expect(ComponentDef.merge({ attributes: { attr1 } }, { attributes: { attr2 } }))
              .toEqual({ attributes: { attr1, attr2 } });

        });
        it('are merged', () => {

          const def = ComponentDef.merge({ attributes: { attr1 } }, { attributes: { attr1: attr2 } });
          const attr = def.attributes!.attr1!;
          const self = { name: 'object' };
          const oldValue = 'old value';
          const newValue = 'new value';

          attr.call(self, oldValue, newValue);

          expect(attr1).toHaveBeenCalledWith(oldValue, newValue);
          expect(attr1.calls.first().object).toBe(self);
          expect(attr2).toHaveBeenCalledWith(oldValue, newValue);
          expect(attr2.calls.first().object).toBe(self);
        });
        it('are copied from first definition when absent in second one', () => {
          expect(ComponentDef.merge({ attributes: { attr1 } }, {}))
              .toEqual({ attributes: { attr1 } });
        });
        it('are copied from second definition when absent in first one', () => {
          expect(ComponentDef.merge({}, { attributes: { attr2 } }))
              .toEqual({ attributes: { attr2 } });
        });
        it('are not copied when absent in both definitions', () => {
          expect(ComponentDef.merge({}, {})).toEqual({});
        });
      });
    });
  });
});
