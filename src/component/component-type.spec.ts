import { ComponentDesc } from './component-desc';
import { addComponentDesc, componentDesc, ComponentType } from './component-type';

describe('component/component-type', () => {
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
