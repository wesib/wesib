import { StateTracker, StateUpdater } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { Feature } from '../../feature';
import { testElement } from '../../spec/test-element';
import { StateSupport } from './state-support.feature';

describe('features/state', () => {
  describe('State usage', () => {

    let testComponent: ComponentClass;
    let context: ComponentContext;
    let updateState: StateUpdater;
    let stateTracker: StateTracker;

    beforeEach(() => {
      context = undefined!;
      updateState = undefined!;
      stateTracker = undefined!;

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
        },
      })
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

    beforeEach(() => {
      const _element = new (testElement(testComponent))();
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
