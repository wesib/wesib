import {
  immediateRenderScheduler,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
  setRenderScheduler,
} from '@frontmeans/render-scheduler';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { Component } from '../../component';
import { Feature, FeatureDef } from '../../feature';
import { MockElement } from '../../testing';
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
      const fallback = jest.fn<RenderSchedule, [RenderScheduleOptions?]>();
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

      const customScheduler = jest.fn<RenderSchedule, [RenderScheduleOptions?]>();
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
    it('is singleton', async () => {

      const bsContext = await bootstrapContext();

      @Component({ extend: { type: MockElement } })
      class TestComponent {
      }

      await bsContext.load(TestComponent).whenReady;

      const defContext = await bsContext.whenDefined(TestComponent);

      expect(defContext.get(DefaultRenderScheduler)).toBe(bsContext.get(DefaultRenderScheduler));
    });
    it('respects fallback render scheduler when requested indirectly', async () => {

      const bsContext = await bootstrapContext();

      @Component({ extend: { type: MockElement } })
      class TestComponent {
      }

      await bsContext.load(TestComponent).whenReady;

      const defContext = await bsContext.whenDefined(TestComponent);

      const fallback = jest.fn<RenderSchedule, [RenderScheduleOptions?]>();
      const scheduler = defContext.get(DefaultRenderScheduler, { or: fallback })!;

      scheduler();
      expect(fallback).toHaveBeenCalled();
      expect(mockScheduler).not.toHaveBeenCalled();
    });

    async function bootstrapContext(
        scheduler?: RenderScheduler,
        feature: FeatureDef = {},
    ): Promise<BootstrapContext> {
      @Feature(
          {
            setup(setup) {
              setup.provide({ a: BootstrapWindow, is: mockWindow });
              if (scheduler) {
                setup.provide({ a: DefaultRenderScheduler, is: scheduler });
              }
            },
          },
          feature,
      )
      class TestFeature {}

      return bootstrapComponents(TestFeature).whenReady;
    }

    async function bootstrap(
        scheduler?: RenderScheduler,
        feature?: FeatureDef,
    ): Promise<DefaultRenderScheduler> {

      const bsContext = await bootstrapContext(scheduler, feature);

      return bsContext.get(DefaultRenderScheduler);
    }
  });
});
