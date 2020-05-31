import { ContextRegistry } from '@proc7ts/context-values';
import { StatePath, StateTracker, ValueTracker } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
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

      const registry = new ContextRegistry<ComponentContext>();

      registry.provide({ a: ComponentState, is: state });

      const values = registry.newValues();

      context = {
        component,
        get: values.get,
      } as ComponentContext;
    });

    let tracker: ValueTracker<string | null>;

    beforeEach(() => {
      tracker = trackStateProperty(context, 'test');
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

        tracker.done(reason);

        expect(updatesOff).toHaveBeenCalledWith(reason);
        expect(readOff).toHaveBeenCalledWith(reason);
      });
      it('rejects new property updates receivers', () => {

        const reason = 'test reason';

        tracker.done(reason);

        const updatesOff = jest.fn();

        tracker.on(noop).whenOff(updatesOff);

        const readOff = jest.fn();

        tracker.read(noop).whenOff(readOff);

        expect(updatesOff).toHaveBeenCalledWith(reason);
        expect(readOff).toHaveBeenCalledWith(reason);
      });
      it('rejects property updates', () => {
        tracker.it = 'old';
        tracker.done();
        tracker.it = 'new';
        expect(tracker.it).toBe('old');
      });
    });
  });
});
