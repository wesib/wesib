import { ContextRegistry } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/supply';
import { ComponentContext } from '../../component';
import { ComponentState } from '../state';
import { RenderDef, RenderPath__root } from './render-def';

describe('feature/render', () => {
  describe('RenderDef', () => {
    describe('spec', () => {

      let context: ComponentContext;
      let spec: RenderDef.Spec;

      beforeEach(() => {
        context = { name: 'context' } as any;
        spec = {
          on: ['path1', 'path2'],
        };
      });

      it('retains specifier as is', () => {
        expect(RenderDef.spec(context, spec)).toBe(spec);
      });
      it('calls provider to build specifier', () => {

        const provider: RenderDef.Provider = jest.fn(() => spec);

        expect(RenderDef.spec(context, provider)).toBe(spec);
        expect(provider).toHaveBeenCalledWith(context);
      });
    });

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
