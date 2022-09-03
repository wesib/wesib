import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { StatePath, StateTracker, ValueTracker } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState, statePropertyPathTo, trackStateProperty } from '../state';

describe('feature/state', () => {
  describe('trackStateProperty', () => {
    let component: any;
    let context: ComponentContext;
    let state: StateTracker;

    beforeEach(() => {
      component = {};
      state = new StateTracker();

      const cxBuilder = new CxBuilder<ComponentContext>(
        (get, { supply }) => ({
            component,
            supply,
            get,
          } as ComponentContext),
      );

      context = cxBuilder.context;
      cxBuilder.provide(cxConstAsset(ComponentState, state));
    });

    let tracker: ValueTracker<string | null>;

    beforeEach(() => {
      tracker = trackStateProperty(context, 'test');
    });

    afterEach(() => {
      Supply.onUnexpectedAbort();
    });

    describe('it', () => {
      it('reflects property value', () => {
        component.test = 'test value';
        expect(tracker.it).toBe('test value');
      });
      it('sets property value', () => {
        tracker.it = 'new value';
        expect(component.test).toBe('new value');
      });
    });

    describe('on', () => {
      it('reflects property value updates', () => {
        const onUpdate = jest.fn();
        const read = jest.fn();

        tracker.on(onUpdate);
        tracker.read(read);
        state.update(statePropertyPathTo('test'), 'new value', 'old value');
        expect(onUpdate).toHaveBeenCalledWith('new value', 'old value');
        expect(read).toHaveBeenCalledWith('new value');
      });
      it('reflects property value updates with custom path', () => {
        const path: StatePath = ['test', 'path'];

        tracker = trackStateProperty(context, 'test', path);

        const onUpdate = jest.fn();
        const read = jest.fn();

        tracker.on(onUpdate);
        tracker.read(read);
        state.update(path, 'new value', 'old value');
        expect(onUpdate).toHaveBeenCalledWith('new value', 'old value');
        expect(read).toHaveBeenCalledWith('new value');
      });
    });

    describe('done', () => {
      it('cuts off property updates supply', () => {
        const updatesOff = jest.fn();

        tracker.on(noop).whenOff(updatesOff);

        const readOff = jest.fn();

        tracker.read(noop).whenOff(readOff);

        const reason = 'test reason';

        tracker.supply.off(reason);

        expect(updatesOff).toHaveBeenCalledWith(reason);
        expect(readOff).toHaveBeenCalledWith(reason);
      });
      it('rejects new property updates receivers', () => {
        Supply.onUnexpectedAbort(noop);

        const reason = 'test reason';

        tracker.supply.off(reason);

        const updatesOff = jest.fn();

        tracker.on(noop).whenOff(updatesOff);

        const readOff = jest.fn();

        tracker.read(noop).whenOff(readOff);

        expect(updatesOff).toHaveBeenCalledWith(reason);
        expect(readOff).toHaveBeenCalledWith(reason);
      });
      it('rejects property updates', () => {
        tracker.it = 'old';
        tracker.supply.off();
        tracker.it = 'new';
        expect(tracker.it).toBe('old');
      });
    });
  });
});
