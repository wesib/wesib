import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CxBuilder, cxConstAsset, CxSupply } from '@proc7ts/context-builder';
import { CxValues } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
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
      const contextSupply = new Supply();

      cxBuilder.provide(cxConstAsset(StateUpdater, updater1));
      cxBuilder.provide(cxConstAsset(CxSupply, contextSupply));
      updater = context.get(StateUpdater);

      const reason = new Error('reason');

      contextSupply.off(reason);
      updater('path', 'new', 'old');
      expect(updater1).not.toHaveBeenCalled();
    });
  });

  function newBuilder(): CxBuilder {
    return new CxBuilder(get => ({ get }));
  }
});
