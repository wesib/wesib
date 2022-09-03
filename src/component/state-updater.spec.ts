import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxValues } from '@proc7ts/context-values';
import { StateUpdater } from './state-updater';

describe('component', () => {
  describe('StateUpdater', () => {
    let cxBuilder: CxBuilder;
    let context: CxValues;
    let updater: StateUpdater;

    beforeEach(() => {
      cxBuilder = newBuilder();
      context = cxBuilder.context;
      updater = context.get(StateUpdater);
    });

    it('does nothing by default', () => {
      expect(updater('path', 'new', 'old')).toBeUndefined();
    });
    it('calls provided updaters in reverse order', () => {
      const calls: number[] = [];
      const updater1 = jest.fn().mockImplementation(() => calls.push(1));
      const updater2 = jest.fn().mockImplementation(() => calls.push(2));

      cxBuilder.provide(cxConstAsset(StateUpdater, updater1));
      cxBuilder.provide(cxConstAsset(StateUpdater, updater2));

      updater('path', 'new', 'old');
      expect(updater1).toHaveBeenCalledWith(['path'], 'new', 'old');
      expect(updater2).toHaveBeenCalledWith(['path'], 'new', 'old');
      expect(calls).toEqual([2, 1]);
    });
    it('does nothing after component destruction', () => {
      cxBuilder = newBuilder();
      context = cxBuilder.context;

      const updater1 = jest.fn();

      cxBuilder.provide(cxConstAsset(StateUpdater, updater1));
      updater = context.get(StateUpdater);

      const reason = new Error('reason');

      cxBuilder.supply.off(reason);
      updater('path', 'new', 'old');
      expect(updater1).not.toHaveBeenCalled();
    });

    describe('toString', () => {
      it('returns string representation', () => {
        expect(String(StateUpdater)).toBe('[StateUpdater]');
      });
    });
  });

  function newBuilder(): CxBuilder {
    return new CxBuilder(get => ({ get }));
  }
});
