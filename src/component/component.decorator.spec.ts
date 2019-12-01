import { ComponentDef } from './component-def';
import { Component } from './component.decorator';

describe('component', () => {
  describe('@Component', () => {
    it('assigns component definition', () => {

      class BaseElement {}

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: BaseElement,
        },
      };

      @Component(def)
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
    it('allows shorthand definition', () => {

      @Component('test-component')
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual({ name: 'test-component' });
    });
  });
});
