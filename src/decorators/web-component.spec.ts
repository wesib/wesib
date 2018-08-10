import { ComponentDesc, componentDesc, ComponentType } from '../component-type';
import { WebComponent } from './web-component';

describe('decorators/web-component', () => {
  describe('@WebComponent', () => {
    it('appends component descriptor', () => {

      const desc: ComponentDesc = { name: 'test-component '};

      @WebComponent(desc)
      class TestComponent {
      }

      const componentType = TestComponent as ComponentType;

      expect(componentType[componentDesc]).toEqual(desc);
    });
  });
});
