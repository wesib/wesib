import { ComponentContext, ComponentType, ComponentValueKey } from '../../component';
import { WebComponent, WebFeature } from '../../decorators';
import { EventProducer } from '../../events';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { StateSupport } from './state-support.feature';

describe('features/state', () => {
  describe('State usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let refreshState: () => void;
    let stateUpdates: EventProducer<(this: void) => void>;

    beforeEach(() => {
      refreshState = undefined!;
      stateUpdates = undefined!;

      @WebComponent('test-component')
      @WebFeature({ requires: StateSupport })
      class TestComponent {
        constructor(ctx: ComponentContext) {
          refreshState = ctx.get(ComponentValueKey.stateRefresh);
          stateUpdates = ctx.get(StateSupport.stateUpdates);
        }
      }

      testComponent = TestComponent;
    });

    beforeEach(async () => {
      bootstrap = await new TestBootstrap().create(testComponent);
    });
    afterEach(() => bootstrap.dispose());

    beforeEach(async () => {
      await bootstrap.addElement(testComponent);
    });

    it('provides state refresh', () => {
      expect(refreshState).toEqual(jasmine.any(Function));
    });
    it('provides state updates', () => {
      expect(stateUpdates).toEqual(jasmine.any(Function));
    });
    it('notifies on state refresh', () => {

      const listenerSpy = jasmine.createSpy('stateListener');
      const interest = stateUpdates(listenerSpy);

      refreshState();

      expect(listenerSpy).toHaveBeenCalledWith();

      interest.off();
      listenerSpy.calls.reset();
      refreshState();

      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});
