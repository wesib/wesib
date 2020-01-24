import { ComponentDef, ComponentDef__symbol } from './component-def';
import { Component } from './component.decorator';

describe('component', () => {
  describe('@Component', () => {
    it('assigns component definition', () => {

      class BaseElement {
      }

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: BaseElement,
        },
      };

      @Component(def)
      class TestComponent {
      }

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
  });

  describe('ComponentDecorator', () => {
    it('serves as component definition itself', () => {

      class BaseElement {}

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: BaseElement,
        },
      };

      @Component(
          Component({ [ComponentDef__symbol]: () => def }),
      )
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
  });
});
