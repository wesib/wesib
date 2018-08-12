import { mergeComponentDefs } from './component-def';

describe('component/component-def', () => {
  describe('mergeComponentDefs', () => {
    it('merges name', () => {
      expect(mergeComponentDefs({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
      expect(mergeComponentDefs({ name: 'name1' }, {})).toEqual({ name: 'name1' });
      expect(mergeComponentDefs({}, { name: 'name2' })).toEqual({ name: 'name2' });
    });
    it('merges type', () => {
      expect(mergeComponentDefs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          { extend: { name: 'input', type: HTMLInputElement } }))
          .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
      expect(mergeComponentDefs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          {}))
          .toEqual({ extend: { name: 'div', type: HTMLDivElement } });
      expect(mergeComponentDefs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          { extend: { name: 'input', type: HTMLInputElement } }))
          .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
    });
  });
});
