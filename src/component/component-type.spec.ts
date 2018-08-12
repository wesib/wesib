import { componentDef, ComponentDef } from './component-def';
import { ComponentType, defineComponent, definitionOf } from './component-type';

describe('component/component-type', () => {
  describe('definitionOf', () => {
    it('returns component definition', () => {

      const def: ComponentDef = {
        name: 'test-component',
      };

      class TestComponent {
        static [componentDef] = def;
      }

      expect(definitionOf(TestComponent)).toEqual(def);
    });
    it('fails when there is no component definition', () => {

      class TestComponent {
      }

      expect(() => definitionOf(TestComponent)).toThrow(jasmine.any(TypeError));
    });
  });

  describe('defineComponent', () => {

    let TestComponent: ComponentType;

    beforeEach(() => {
      TestComponent = class {
      };
    });

    it('assigns component definition', () => {

      const def: ComponentDef = { name: 'test-component' };
      const componentType = defineComponent(TestComponent, def);

      expect(definitionOf(componentType)).toEqual(def);
    });
    it('updates component definition', () => {

      const initialDef = {
        name: 'test',
      };
      (TestComponent as any)[componentDef] = initialDef;

      const def: Partial<ComponentDef> = {
        properties: {
          test: {
            value: 'some',
          },
        },
      };
      const componentType = defineComponent(TestComponent, def);

      expect(definitionOf(componentType)).toEqual({ ...initialDef, ...def });
    });
  });
});
