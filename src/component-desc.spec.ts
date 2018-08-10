import { mergeComponentDescs } from './component-desc';

describe('component-desc', () => {
  describe('mergeComponentDescs', () => {
    it('merges name', () => {
      expect(mergeComponentDescs({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
      expect(mergeComponentDescs({ name: 'name1' }, {})).toEqual({ name: 'name1' });
      expect(mergeComponentDescs({}, { name: 'name2' })).toEqual({ name: 'name2' });
    });
    it('merges type', () => {
      expect(mergeComponentDescs({ elementType: HTMLElement }, { elementType: HTMLInputElement }))
          .toEqual({ elementType: HTMLInputElement });
      expect(mergeComponentDescs({ elementType: HTMLElement }, {}))
          .toEqual({ elementType: HTMLElement });
      expect(mergeComponentDescs({}, { elementType: HTMLInputElement }))
          .toEqual({ elementType: HTMLInputElement });
    });
  });
});
