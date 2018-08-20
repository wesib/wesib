import { ComponentDef } from './component-def';
import { ComponentType } from './component-type';

describe('component/component-type', () => {
  describe('ComponentDef', () => {
    describe('of', () => {
      it('returns component definition', () => {

        class TestComponent {
          static [ComponentDef.symbol] = {
            name: 'test-component',
          };
        }

        expect(ComponentDef.of(TestComponent)).toEqual(TestComponent[ComponentDef.symbol]);
      });
      it('fails when there is no component definition', () => {

        class TestComponent {
        }

        expect(() => ComponentDef.of(TestComponent)).toThrow(jasmine.any(TypeError));
      });
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
      const componentType = ComponentType.define(TestComponent, def);

      expect(ComponentDef.of(componentType)).toEqual(def);
    });
    it('updates component definition', () => {

      const initialDef = {
        name: 'test',
      };

      ComponentType.define(TestComponent, initialDef);

      const def: Partial<ComponentDef> = {
        properties: {
          test: {
            value: 'some',
          },
        },
      };
      const componentType = ComponentType.define(TestComponent, def);

      expect(ComponentDef.of(componentType)).toEqual({ ...initialDef, ...def });
    });
  });
});
