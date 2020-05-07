import { ComponentContext } from '../../component';
import { RenderDef } from './render-def';

describe('feature/render', () => {
  describe('RenderDef', () => {
    describe('options', () => {

      let context: ComponentContext;
      let options: RenderDef.Options;

      beforeEach(() => {
        context = { name: 'context' } as any;
        options = {
          path: ['path1', 'path2'],
        };
      });

      it('retains options as is', () => {
        expect(RenderDef.options(context, options)).toBe(options);
      });
      it('calls provider to build options', () => {

        const provider: RenderDef.Provider = jest.fn(() => options);

        expect(RenderDef.options(context, provider)).toBe(options);
        expect(provider).toHaveBeenCalledWith(context);
      });
    });

    describe('fulfill', () => {
      it('fulfills path', () => {

        const path1 = ['path1'];
        const path2 = ['path2'];

        expect(RenderDef.fulfill({}, { path: path2 })).toEqual({ path: path2 });
        expect(RenderDef.fulfill({ path: path1 }, { path: path2 })).toEqual({ path: path1 });
        expect(RenderDef.fulfill({ path: path1 }, {})).toEqual({ path: path1 });
      });

      describe('error', () => {

        let error1: jest.Mock<any, any>;
        let error2: jest.Mock<any, any>;
        let def1: RenderDef.Options;
        let def2: RenderDef.Options;
        let message: any;

        beforeEach(() => {
          error1 = jest.fn();
          error2 = jest.fn();
          def1 = { error: error1 };
          def2 = { error: error2 };
          message = 'test';
        });

        it('prefers base when no default', () => {
          RenderDef.fulfill(def1, {}).error!(message);
          expect(error1).toHaveBeenCalledWith(message);
          expect(error1.mock.instances[0]).toBe(def1);
        });
        it('prefers base when present', () => {
          RenderDef.fulfill(def1, def2).error!(message);
          expect(error1).toHaveBeenCalledWith(message);
          expect(error1.mock.instances[0]).toBe(def1);
        });
        it('uses defaults when absent', () => {
          RenderDef.fulfill({}, def2).error!(message);
          expect(error2).toHaveBeenCalledWith(message);
          expect(error2.mock.instances[0]).toBe(def2);
        });
      });
    });
  });
});
