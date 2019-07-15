import { Component, ComponentClass, ComponentContext, StateUpdater } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { Feature } from '../feature.decorator';
import { ComponentState } from './component-state';
import { StateSupport } from './state-support.feature';

describe('feature/state', () => {
  describe('State usage', () => {

    let testComponent: ComponentClass;
    let context: ComponentContext;
    let updateState: StateUpdater;
    let componentState: ComponentState;

    beforeEach(() => {
      context = undefined!;
      updateState = undefined!;
      componentState = undefined!;

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
      })
      @Feature({ needs: StateSupport })
      class TestComponent {
        constructor(ctx: ComponentContext) {
          context = ctx;
          updateState = ctx.get(StateUpdater);
          componentState = ctx.get(ComponentState);
        }
      }

      testComponent = TestComponent;
    });

    beforeEach(() => {
      new (testElement(testComponent))(); // tslint:disable-line:no-unused-expression
    });

    it('provides state update', () => {
      expect(updateState).toBeInstanceOf(Function);
    });
    it('provides component state', () => {
      expect(componentState).toBeInstanceOf(Object);
    });
    it('notifies on state update', () => {

      const listenerSpy = jest.fn();
      const interest = componentState.onUpdate(listenerSpy);

      updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.mockClear();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
    it('notifies on state update with `updateState()` method' , () => {

      const listenerSpy = jest.fn();
      const interest = componentState.onUpdate(listenerSpy);

      context.updateState(['key'], 'new', 'old');

      expect(listenerSpy).toHaveBeenCalledWith(['key'], 'new', 'old');

      interest.off();
      listenerSpy.mockClear();
      updateState('key', 'new', 'old');

      expect(listenerSpy).not.toHaveBeenCalled();
    });
  });
});
