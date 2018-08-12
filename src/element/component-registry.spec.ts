import { componentOf } from '../component';
import { WebComponent } from '../decorators';
import { TestComponentRegistry } from '../spec/test-component-registry';
import { ComponentRegistry } from './component-registry';

describe('element/component-registry', () => {
  describe('ComponentRegistry', () => {

    let registry: TestComponentRegistry;

    beforeEach(async () => {
      registry = await new TestComponentRegistry().create();
    });
    afterEach(() => registry.dispose());

    describe('component registration', () => {

      @WebComponent({
        name: 'test-component',
      })
      class TestComponent {
      }

      let element: HTMLElement;

      beforeEach(async () => {
        element = await registry.addElement(TestComponent);
      });

      it('registers custom element', async () => {
        expect(element).toBeDefined();
      });
      it('registered element has component reference', () => {
        expect(componentOf(element) instanceof TestComponent).toBeTruthy();
      });
    });
  });
});
