import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { StatePath, StateTracker, ValueTracker } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { attributePathTo } from './attribute-path';
import { trackAttribute } from './track-attribute';

describe('feature/attributes', () => {
  describe('trackAttribute', () => {

    let element: Element;
    let context: ComponentContext;
    let state: StateTracker;

    beforeEach(() => {
      element = document.createElement('div');
      state = new StateTracker();

      const cxBuilder = new CxBuilder<ComponentContext>((get, { supply }) => ({
        element,
        supply,
        get,
      }) as ComponentContext);

      context = cxBuilder.context;

      cxBuilder.provide(cxConstAsset(ComponentState, state));
    });

    let tracker: ValueTracker<string | null>;

    beforeEach(() => {
      tracker = trackAttribute(context, 'test');
    });

    afterEach(() => {
      Supply.onUnexpectedAbort();
    });

    describe('it', () => {
      it('is `null` when attribute is absent', () => {
        expect(tracker.it).toBeNull();
      });
      it('reflects attribute value', () => {
        element.setAttribute('test', 'test value');
        expect(tracker.it).toBe('test value');
      });
      it('sets attribute value', () => {
        tracker.it = 'new value';
        expect(element.getAttribute('test')).toBe('new value');
      });
      it('sets empty attribute value', () => {
        tracker.it = '';
        expect(element.getAttribute('test')).toBe('');
      });
      it('removes attribute when set to `null`', () => {
        tracker.it = 'new value';
        tracker.it = null;
        expect(element.hasAttribute('test')).toBe(false);
      });
    });

    describe('on', () => {
      it('reflects attribute value updates', () => {

        const onUpdate = jest.fn();
        const read = jest.fn();

        tracker.on(onUpdate);
        tracker.read(read);
        state.update(attributePathTo('test'), 'new value', 'old value');
        expect(onUpdate).toHaveBeenCalledWith('new value', 'old value');
        expect(read).toHaveBeenCalledWith('new value');
      });
      it('reflects attribute value updates with custom path', () => {

        const path: StatePath = ['test', 'path'];

        tracker = trackAttribute(context, 'test', path);

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
      it('cuts off attribute updates supply', () => {

        const updatesOff = jest.fn();

        tracker.on(noop).whenOff(updatesOff);

        const readOff = jest.fn();

        tracker.read(noop).whenOff(readOff);

        const reason = 'test reason';

        tracker.supply.off(reason);

        expect(updatesOff).toHaveBeenCalledWith(reason);
        expect(readOff).toHaveBeenCalledWith(reason);
      });
      it('rejects new attribute updates receivers', () => {
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
      it('rejects attribute updates', () => {
        tracker.it = 'old';
        tracker.supply.off();
        tracker.it = 'new';
        expect(tracker.it).toBe('old');
      });
    });
  });
});
