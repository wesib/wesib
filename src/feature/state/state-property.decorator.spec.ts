import { StatePath } from '@proc7ts/fun-events';
import { bootstrapComponents } from '../../boot/bootstrap';
import { ComponentContext } from '../../component';
import { ComponentState } from './component-state';
import { statePropertyPathTo } from './state-property-path';
import { StateProperty, StatePropertyDef } from './state-property.decorator';
import Mock = jest.Mock;

describe('feature/state', () => {
  describe('@StateProperty', () => {

    let element: Element;

    beforeEach(() => {
      element = document.createElement('test-component');
    });

    let onUpdate: Mock<void, [StatePath, any, any]>;

    beforeEach(() => {
      onUpdate = jest.fn();
    });

    it('updates component state', async () => {

      const { component } = await bootstrap();

      component.property = 'other';
      expect(onUpdate).toHaveBeenCalledWith(statePropertyPathTo('property'), 'other', 'init');
    });
    it('does not update component state when value did not change', async () => {

      const { component } = await bootstrap();

      component.property = 'init';
      expect(onUpdate).not.toHaveBeenCalled();
    });
    it('updates component state with custom path', async () => {

      const { component } = await bootstrap({ updateState: 'custom' });

      component.property = 'other';
      expect(onUpdate).toHaveBeenCalledWith(['custom'], 'other', 'init');
    });
    it('does not updates component state with custom path when value did not change', async () => {

      const { component } = await bootstrap({ updateState: 'custom' });

      component.property = 'init';
      expect(onUpdate).not.toHaveBeenCalled();
    });
    it('does not update component state when `updateState` is `false`', async () => {

      const { component } = await bootstrap({ updateState: false });

      component.property = 'other';
      expect(onUpdate).not.toHaveBeenCalled();
    });
    it('invokes custom state updater', async () => {

      const mockUpdate = jest.fn();

      const { component } = await bootstrap({ updateState: mockUpdate });

      component.property = 'other';
      expect(mockUpdate).toHaveBeenCalledWith(component, statePropertyPathTo('property'), 'other', 'init');
      expect(onUpdate).not.toHaveBeenCalled();
    });

    async function bootstrap(def?: StatePropertyDef): Promise<ComponentContext<{ property: string }>> {
      class TestComponent {

        @StateProperty(def)
        property = 'init';

      }

      const bsContext = await bootstrapComponents(TestComponent).whenReady();
      const factory = await bsContext.whenDefined(TestComponent);
      const { context } = factory.mountTo(element);

      context.get(ComponentState).onUpdate(onUpdate);

      return context;
    }
  });
});
