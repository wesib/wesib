import Mock = jest.Mock;
import { immediateRenderScheduler, RenderSchedule, RenderScheduler, setRenderScheduler } from 'render-scheduler';
import { Feature } from '../../feature';
import { bootstrapComponents } from '../bootstrap';
import { BootstrapContext } from '../bootstrap-context';
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

    beforeEach(() => {
      mockWindow = { name: 'bootstrap-window' } as any;
    });

    it('utilizes default render scheduler', async () => {

      const scheduler = await bootstrap();

      scheduler();
      expect(mockScheduler).toHaveBeenCalled();
    });
    it('utilizes default render scheduler with `null` fallback', async () => {

      const bsContext = await bootstrapContext();
      const scheduler = bsContext.get(DefaultRenderScheduler, { or: null })!;

      scheduler();
      expect(mockScheduler).toHaveBeenCalled();
    });
    it('respects fallback render scheduler', async () => {

      const bsContext = await bootstrapContext();
      const fallback = jest.fn();
      const scheduler = bsContext.get(DefaultRenderScheduler, { or: fallback })!;

      scheduler();
      expect(fallback).toHaveBeenCalled();
      expect(mockScheduler).not.toHaveBeenCalled();
    });
    it('substitutes bootstrap window by default', async () => {

      const scheduler = await bootstrap();
      const node = document.createElement('div');
      const error = (): void => { /* log error */ };

      scheduler({ node, error });
      expect(mockScheduler).toHaveBeenCalledWith({ window: mockWindow, node, error });
    });
    it('substitutes bootstrap window to provided scheduler', async () => {

      const customScheduler = jest.fn();
      const scheduler = await bootstrap(customScheduler);
      const node = document.createElement('div');
      const error = (): void => { /* log error */ };

      scheduler({ node, error });
      expect(customScheduler).toHaveBeenCalledWith({ window: mockWindow, node, error });
    });
    it('respects explicit parameters', async () => {

      const scheduler = await bootstrap();
      const window: Window = { name: 'window' } as any;
      const node = document.createElement('div');
      const error = (): void => { /* log error */ };

      scheduler({ window, node, error });
      expect(mockScheduler).toHaveBeenCalledWith({ window, node, error });
    });

    async function bootstrapContext(scheduler?: RenderScheduler): Promise<BootstrapContext> {
      @Feature({
        setup(setup) {
          setup.provide({ a: BootstrapWindow, is: mockWindow });
          if (scheduler) {
            setup.provide({ a: DefaultRenderScheduler, is: scheduler });
          }
        },
      })
      class TestFeature {}

      return bootstrapComponents(TestFeature).whenReady;
    }

    async function bootstrap(scheduler?: RenderScheduler): Promise<DefaultRenderScheduler> {

      const bsContext = await bootstrapContext(scheduler);

      return bsContext.get(DefaultRenderScheduler);
    }
  });
});
