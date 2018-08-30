import { ComponentContext, ComponentType, ComponentValueKey } from '../../component';
import { WebComponent, WebFeature } from '../../decorators';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { StateSupport } from './state-support.feature';
import { StateTracker } from './state-tracker';

describe('features/state', () => {
  describe('State usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentType;
    let refreshState: () => void;
    let stateTracker: StateTracker;

    beforeEach(() => {
      refreshState = undefined!;
      stateTracker = undefined!;

      @WebComponent('test-component')
      @WebFeature({ requires: StateSupport })
      class TestComponent {
        constructor(ctx: ComponentContext) {
          refreshState = ctx.get(ComponentValueKey.stateRefresh);
          stateTracker = ctx.get(StateTracker.key);
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
      expect(stateTracker).toEqual(jasmine.any(Object));
    });
    it('notifies on state refresh', () => {

      const listenerSpy = jasmine.createSpy('stateListener');
      const interest = stateTracker.onStateUpdate(listenerSpy);

      refreshState();

      expect(listenerSpy).toHaveBeenCalledWith();

      interest.off();
      listenerSpy.calls.reset();
      refreshState();

      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});
