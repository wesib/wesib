import { StateTracker, StateUpdater } from '../../common';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { Feature } from '../../feature';
import { TestBootstrap } from '../../spec/test-bootstrap';
import { StateSupport } from './state-support.feature';

describe('features/state', () => {
  describe('State usage', () => {

    let bootstrap: TestBootstrap;
    let testComponent: ComponentClass;
    let context: ComponentContext;
    let updateState: StateUpdater;
    let stateTracker: StateTracker;

    beforeEach(() => {
      context = undefined!;
      updateState = undefined!;
      stateTracker = undefined!;

      @Component('test-component')
      @Feature({ need: StateSupport })
      class TestComponent {
        constructor(ctx: ComponentContext) {
          context = ctx;
          updateState = ctx.get(StateUpdater);
          stateTracker = ctx.get(StateTracker);
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

    it('provides state update', () => {
      expect(updateState).toEqual(jasmine.any(Function));
    });
    it('provides state tracker', () => {
      expect(stateTracker).toEqual(jasmine.any(Object));
    });
    it('notifies on state update', () => {

      const listenerSpy = jasmine.createSpy('stateListener');
      const interest = stateTracker.onUpdate(listenerSpy);

      updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.calls.reset();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
    it('notifies on state update with `updateState()` method' , () => {

      const listenerSpy = jasmine.createSpy('stateListener');
      const interest = stateTracker.onUpdate(listenerSpy);

      context.updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.calls.reset();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});
