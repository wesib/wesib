import { Partial } from '../node_modules/rollup-plugin-typescript2/dist/partial';
import { addComponentDesc, ComponentDesc, componentDesc, ComponentType, mergeComponentDescs } from './component-type';

describe('component-type', () => {
  describe('mergeComponentDescs', () => {
    it('merges name', () => {
      expect(mergeComponentDescs({ name: 'name1' }, { name: 'name2' })).toEqual({ name: 'name2' });
      expect(mergeComponentDescs({ name: 'name1' }, {})).toEqual({ name: 'name1' });
      expect(mergeComponentDescs({}, { name: 'name2' })).toEqual({ name: 'name2' });
    });
  });
  describe('addComponentDesc', () => {

    let TestComponent: ComponentType;

    beforeEach(() => {
      TestComponent = class {
      };
    });

    it('adds component descriptor', () => {

      const desc: ComponentDesc = { name: 'test-component' };
      const componentType = addComponentDesc(TestComponent, desc);

      expect(componentType[componentDesc]).toEqual(desc);
    });
    it('updates component descriptor', () => {

      const initialDesc = {
        name: 'test',
      };
      (TestComponent as any)[componentDesc] = initialDesc;

      const desc: Partial<ComponentDesc> = {
        properties: {
          test: {
            value: 'some',
          },
        },
      };
      const componentType = addComponentDesc(TestComponent, desc);

      expect(componentType[componentDesc]).toEqual({ ...initialDesc, ...desc });
    });
  });
});
