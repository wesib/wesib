import {
  immediateRenderScheduler,
  newManualRenderScheduler,
  noopRenderScheduler,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@proc7ts/render-scheduler';
import { DefaultRenderScheduler } from '../../boot/globals';
import { Component, ComponentContext } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { StateSupport } from '../state';
import { ElementRenderCtl } from './element-render-ctl';
import { ElementRenderScheduler } from './element-render-scheduler';

describe('feature/render', () => {
  describe('ElementRenderScheduler', () => {

    let mockRenderScheduler: jest.Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockRenderSchedule: jest.Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockRenderSchedule = jest.fn(immediateRenderScheduler());
      mockRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockRenderSchedule);
    });

    it('schedules render shot', async () => {

      const context = await bootstrap();

      context.element.connectedCallback();

      const scheduler: RenderScheduler = context.get(ElementRenderScheduler);
      const schedule = scheduler();
      const shot = jest.fn();

      schedule(shot);
      expect(shot).toHaveBeenCalledTimes(1);
    });
    it('schedules render shot only when component connected', async () => {

      const context = await bootstrap();
      const scheduler = context.get(ElementRenderScheduler);
      const schedule = scheduler();
      const shot = jest.fn();

      schedule(shot);
      expect(shot).not.toHaveBeenCalled();

      context.element.connectedCallback();
      expect(shot).toHaveBeenCalledTimes(1);
    });
    it('renders the latest shot', async () => {

      const manual = newManualRenderScheduler();

      mockRenderScheduler.mockImplementation(manual);

      const context = await bootstrap();

      context.element.connectedCallback();

      const scheduler = context.get(ElementRenderScheduler);
      const schedule = scheduler();
      const shot1 = jest.fn();
      const shot2 = jest.fn();

      schedule(shot1);
      schedule(shot2);
      expect(shot1).not.toHaveBeenCalled();
      expect(shot2).not.toHaveBeenCalled();

      manual.render();
      expect(shot1).not.toHaveBeenCalled();
      expect(shot2).toHaveBeenCalledTimes(1);
    });
    it('renders immediately on request', async () => {
      mockRenderScheduler.mockImplementation(noopRenderScheduler);

      const context = await bootstrap();

      context.element.connectedCallback();

      const scheduler = context.get(ElementRenderScheduler);
      const schedule = scheduler();
      const shot = jest.fn();

      schedule(shot);
      expect(shot).not.toHaveBeenCalled();

      context.get(ElementRenderCtl).renderNow();
      expect(shot).toHaveBeenCalledTimes(1);
    });

    async function bootstrap(): Promise<ComponentContext> {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
        feature: {
          needs: StateSupport,
          setup(setup) {
            setup.provide({ a: DefaultRenderScheduler, is: mockRenderScheduler });
          },
        },
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent))();

      return ComponentContext.of(element);
    }
  });
});
