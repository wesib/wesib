import { ComponentDef } from '../component';
import { WebComponent } from './web-component';

describe('decorators/web-component', () => {
  describe('@WebComponent', () => {
    it('assigns component definition', () => {

      const def: ComponentDef = {
        name: 'test-component',
        extend: {
          name: 'input',
          type: HTMLInputElement
        },
      };

      @WebComponent(def)
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual(def);
    });
    it('allows shorthand definition', () => {

      @WebComponent('test-component')
      class TestComponent {}

      expect(ComponentDef.of(TestComponent)).toEqual({ name: 'test-component' });
    });
  });
});
