import { componentDesc, ComponentDesc } from './component-desc';
import { ComponentType, describeComponent, descriptorOf } from './component-type';

describe('component/component-type', () => {
  describe('descriptorOf', () => {
    it('returns component descriptor', () => {

      const desc: ComponentDesc = {
        name: 'test-component',
      };

      class TestComponent {
        static [componentDesc] = desc;
      }

      expect(descriptorOf(TestComponent)).toEqual(desc);
    });
    it('fails when there is no component descriptor', () => {

      class TestComponent {
      }

      expect(() => descriptorOf(TestComponent)).toThrow(jasmine.any(TypeError));
    });
  });

  describe('describeComponent', () => {

    let TestComponent: ComponentType;

    beforeEach(() => {
      TestComponent = class {
      };
    });

    it('adds component descriptor', () => {

      const desc: ComponentDesc = { name: 'test-component' };
      const componentType = describeComponent(TestComponent, desc);

      expect(descriptorOf(componentType)).toEqual(desc);
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
      const componentType = describeComponent(TestComponent, desc);

      expect(descriptorOf(componentType)).toEqual({ ...initialDesc, ...desc });
    });
  });
});
