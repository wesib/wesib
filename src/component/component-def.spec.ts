import { AttributeDef, ComponentDef } from './component-def';

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
      it('merges attributes', () => {

        const attr1: AttributeDef = () => {
          throw new Error('!');
        };
        const attr2: AttributeDef = () => {
        };

        expect(ComponentDef.merge({ attributes: { attr1 } }, { attributes: { attr2 } }))
            .toEqual({ attributes: { attr1, attr2 } });
        expect(ComponentDef.merge({ attributes: { attr1 } }, { attributes: { attr1: attr2 } }))
            .toEqual({ attributes: { attr1: attr2 } });
      });
    });
  });
});
