import { StateTracker, StateUpdater } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { StateSupport } from './state-support.feature';

describe('feature/state', () => {
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
          type: MockElement,
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
      expect(updateState).toBeInstanceOf(Function);
    });
    it('provides state tracker', () => {
      expect(stateTracker).toBeInstanceOf(Object);
    });
    it('notifies on state update', () => {

      const listenerSpy = jest.fn();
      const interest = stateTracker.onUpdate(listenerSpy);

      updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.mockClear();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
    it('notifies on state update with `updateState()` method' , () => {

      const listenerSpy = jest.fn();
      const interest = stateTracker.onUpdate(listenerSpy);

      context.updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.mockClear();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});
