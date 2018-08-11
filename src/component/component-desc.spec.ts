import { mergeComponentDescs } from './component-desc';

describe('component/component-desc', () => {
  describe('mergeComponentDescs', () => {
    it('merges name', () => {
      expect(mergeComponentDescs({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
      expect(mergeComponentDescs({ name: 'name1' }, {})).toEqual({ name: 'name1' });
      expect(mergeComponentDescs({}, { name: 'name2' })).toEqual({ name: 'name2' });
    });
    it('merges type', () => {
      expect(mergeComponentDescs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          { extend: { name: 'input', type: HTMLInputElement } }))
          .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
      expect(mergeComponentDescs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          {}))
          .toEqual({ extend: { name: 'div', type: HTMLDivElement } });
      expect(mergeComponentDescs<HTMLElement>(
          { extend: { name: 'div', type: HTMLDivElement } },
          { extend: { name: 'input', type: HTMLInputElement } }))
          .toEqual({ extend: { name: 'input', type: HTMLInputElement } });
    });
  });
});
