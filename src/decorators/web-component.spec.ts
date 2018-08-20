import { ComponentDef, ComponentType } from '../component';
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
      class TestComponent {
      }

      const componentType = TestComponent as ComponentType;

      expect(componentType[ComponentDef.symbol]).toEqual(def);
    });
  });
});
