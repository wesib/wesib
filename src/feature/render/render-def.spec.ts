import { RenderDef } from './render-def';

describe('feature/render', () => {
  describe('RenderDef', () => {
    describe('merge', () => {
      it('merges path', () => {

        const path1 = ['path1'];
        const path2 = ['path2'];

        expect(RenderDef.merge({}, { path: path2 })).toEqual({ path: path2 });
        expect(RenderDef.merge({ path: path1 }, { path: path2 })).toEqual({ path: path2 });
        expect(RenderDef.merge({ path: path1 }, {})).toEqual({ path: path1 });
      });

      describe('error', () => {

        let error1: jest.Mock<any, any>;
        let error2: jest.Mock<any, any>;
        let def1: RenderDef;
        let def2: RenderDef;
        let message: any;

        beforeEach(() => {
          error1 = jest.fn();
          error2 = jest.fn();
          def1 = { error: error1 };
          def2 = { error: error2 };
          message = 'test';
        });

        it('prefers base when not overridden', () => {
          RenderDef.merge(def1, {}).error!(message);
          expect(error1).toHaveBeenCalledWith(message);
          expect(error1.mock.instances[0]).toBe(def1);
        });
        it('overrides with extension', () => {
          RenderDef.merge(def1, def2).error!(message);
          expect(error2).toHaveBeenCalledWith(message);
          expect(error2.mock.instances[0]).toBe(def2);
        });
        it('prefers extension', () => {
          RenderDef.merge({}, def2).error!(message);
          expect(error2).toHaveBeenCalledWith(message);
          expect(error2.mock.instances[0]).toBe(def2);
        });
      });
    });
  });
});
