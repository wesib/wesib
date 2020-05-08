import { noop } from '@proc7ts/call-thru';
import { ContextKey__symbol, ContextRegistry, ContextValues } from '@proc7ts/context-values';
import { ContextSupply } from '@proc7ts/context-values/updatable';
import { eventSupply } from '@proc7ts/fun-events';
import { StateUpdater } from './state-updater';

describe('component', () => {
  describe('StateUpdater', () => {

    let registry: ContextRegistry;
    let values: ContextValues;
    let updater: StateUpdater;

    beforeEach(() => {
      registry = new ContextRegistry();
      values = registry.newValues();
      updater = values.get(StateUpdater);
    });

    it('does nothing by default', () => {
      expect(updater('path', 'new', 'old')).toBeUndefined();
    });
    it('returns fallback if no value provided', () => {

      const fallback = jest.fn();

      values = registry.newValues();
      updater = values.get(StateUpdater, { or: fallback })!;
      updater('path', 'new', 'old');
      expect(fallback).toHaveBeenCalledWith('path', 'new', 'old');
    });
    it('returns noop if no value provided and fallback is null', () => {
      values = registry.newValues();
      updater = values.get(StateUpdater, { or: null })!;
      expect(updater('path', 'new', 'old')).toBeUndefined();
    });
    it('calls provided updaters in reverse order', () => {

      const calls: number[] = [];
      const updater1 = jest.fn(() => calls.push(1));
      const updater2 = jest.fn(() => calls.push(2));

      registry.provide({ a: StateUpdater, is: updater1 });
      registry.provide({ a: StateUpdater, is: updater2 });

      updater('path', 'new', 'old');
      expect(updater1).toHaveBeenCalledWith(['path'], 'new', 'old');
      expect(updater2).toHaveBeenCalledWith(['path'], 'new', 'old');
      expect(calls).toEqual([2, 1]);
    });
    it('does nothing after component destruction', () => {

      const updater1 = jest.fn();
      const contextSupply = eventSupply();

      registry.provide({ a: StateUpdater, is: updater1 });
      registry.provide({ a: ContextSupply, is: contextSupply });
      values = registry.newValues();
      updater = values.get(StateUpdater);

      const reason = new Error('reason');

      contextSupply.off(reason);
      updater('path', 'new', 'old');
      expect(updater1).not.toHaveBeenCalled();

      const whenOff = jest.fn();

      values.get(StateUpdater[ContextKey__symbol].upKey).to(noop).whenOff(whenOff);
      expect(whenOff).toHaveBeenCalledWith(reason);
    });
  });
});
