import { ComponentDef } from './component-def';
import { WesComponent } from './wes-component.decorator';

describe('decorators/wes-component', () => {
  describe('@WesComponent', () => {
    it('assigns component definition', () => {

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: HTMLInputElement
        },
      };

      @WesComponent(def)
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
    it('allows shorthand definition', () => {

      @WesComponent('test-component')
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual({ name: 'test-component' });
    });
  });
});
