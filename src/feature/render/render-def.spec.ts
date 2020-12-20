import { ContextRegistry } from '@proc7ts/context-values';
import { Supply } from '@proc7ts/primitives';
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

    describe('fulfill', () => {
      describe('on', () => {
        it('is fulfilled by defaults', () => {

          const path1 = ['path1'];
          const path2 = ['path2'];

          expect(RenderDef.fulfill({}, { on: path2 })).toEqual({ on: path2 });
          expect(RenderDef.fulfill({ on: path1 }, { on: path2 })).toEqual({ on: path1 });
          expect(RenderDef.fulfill({ on: path1 }, {})).toEqual({ on: path1 });
        });
      });

      describe('error', () => {

        let error1: jest.Mock<any, any>;
        let error2: jest.Mock<any, any>;
        let spec1: RenderDef.Spec;
        let spec2: RenderDef.Spec;
        let message: any;

        beforeEach(() => {
          error1 = jest.fn();
          error2 = jest.fn();
          spec1 = { error: error1 };
          spec2 = { error: error2 };
          message = 'test';
        });

        it('prefers base when no default', () => {
          RenderDef.fulfill(spec1, {}).error!(message);
          expect(error1).toHaveBeenCalledWith(message);
          expect(error1.mock.instances[0]).toBe(spec1);
        });
        it('prefers base when present', () => {
          RenderDef.fulfill(spec1, spec2).error!(message);
          expect(error1).toHaveBeenCalledWith(message);
          expect(error1.mock.instances[0]).toBe(spec1);
        });
        it('uses defaults when absent', () => {
          RenderDef.fulfill({}, spec2).error!(message);
          expect(error2).toHaveBeenCalledWith(message);
          expect(error2.mock.instances[0]).toBe(spec2);
        });
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
