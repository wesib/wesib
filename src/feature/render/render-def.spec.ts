import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ContextRegistry } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { RenderDef, RenderPath__root } from './render-def';

describe('feature/render', () => {
  describe('RenderDef', () => {
    describe('trigger', () => {

      let context: ComponentContext;
      let state: ComponentState;

      beforeEach(() => {
        state = new ComponentState();

        const registry = new ContextRegistry();

        registry.provide({ a: ComponentState, is: state });

        context = {
          get: registry.newValues().get,
          supply: new Supply(),
        } as ComponentContext;
      });

      it('is full state except render root by default', () => {

        const receiver = jest.fn();

        RenderDef.trigger(context)(receiver);

        state.update([RenderPath__root], 'new', 'old');
        expect(receiver).not.toHaveBeenCalled();

        state.update('some', 'new', 'old');
        expect(receiver).toHaveBeenCalledTimes(1);
      });
    });
  });
});
