import Mock = jest.Mock;
import { immediateRenderScheduler, RenderSchedule, RenderScheduler, setRenderScheduler } from 'render-scheduler';
import { Feature } from '../../feature';
import { bootstrapComponents } from '../bootstrap';
import { BootstrapWindow } from './bootstrap-window';
import { DefaultRenderScheduler } from './default-render-scheduler';

describe('boot', () => {
  describe('DefaultRenderScheduler', () => {

    let mockScheduler: Mock<RenderSchedule, Parameters<RenderScheduler>>;

    beforeEach(() => {
      mockScheduler = jest.fn(immediateRenderScheduler);
      setRenderScheduler(mockScheduler);
    });
    afterEach(() => {
      setRenderScheduler();
    });

    let mockWindow: BootstrapWindow;
    let scheduler: DefaultRenderScheduler;

    beforeEach(async () => {
      mockWindow = { name: 'bootstrap-window' } as any;

      @Feature({
        setup(setup) {
          setup.provide({ a: BootstrapWindow, is: mockWindow });
        },
      })
      class TestFeature {}

      const bsContext = await new Promise(bootstrapComponents(TestFeature).whenReady);

      scheduler = bsContext.get(DefaultRenderScheduler);
    });

    it('utilizes default render scheduler', () => {
      scheduler();
      expect(mockScheduler).toHaveBeenCalled();
    });
    it('substitutes bootstrap window by default', () => {

      const node = document.createElement('div');
      const error = (): void => { /* log error */ };

      scheduler({ node, error });
      expect(mockScheduler).toHaveBeenCalledWith({ window: mockWindow, node, error });
    });
    it('respects explicit parameters', () => {

      const window: Window = { name: 'window' } as any;
      const node = document.createElement('div');
      const error = (): void => { /* log error */ };

      scheduler({ window, node, error });
      expect(mockScheduler).toHaveBeenCalledWith({ window, node, error });
    });
  });
});
