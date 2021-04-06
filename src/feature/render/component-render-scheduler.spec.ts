import {
  immediateRenderScheduler,
  newManualRenderScheduler,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { DefaultRenderScheduler } from '../../boot/globals';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { ComponentRenderScheduler } from './component-render-scheduler';

describe('feature/render', () => {
  describe('ComponentRenderScheduler', () => {

    let mockRenderScheduler: jest.Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockRenderSchedule: jest.Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockRenderSchedule = jest.fn(immediateRenderScheduler());
      mockRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockRenderSchedule);
    });

    it('schedules render shot', async () => {

      const context = await bootstrap();

      context.element.connectedCallback();

      const scheduler: RenderScheduler = context.get(ComponentRenderScheduler);
      const schedule = scheduler();
      const shot = jest.fn();

      schedule(shot);
      expect(shot).toHaveBeenCalledTimes(1);
    });
    it('schedules render shot only when component connected', async () => {

      const context = await bootstrap();
      const scheduler = context.get(ComponentRenderScheduler);
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

      const scheduler = context.get(ComponentRenderScheduler);
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
    it('reports errors by calling the given method', async () => {
      mockRenderScheduler = jest.fn(immediateRenderScheduler);

      const error = new Error('test');
      const logError = jest.fn();
      const context = await bootstrap();

      context.element.connectedCallback();

      const scheduler = context.get(ComponentRenderScheduler);
      const options = { error: logError };
      const schedule = scheduler(options);
      const shot = (): never => {
        throw error;
      };

      schedule(shot);
      expect(logError).toHaveBeenCalledWith(error);
      expect(logError.mock.instances[0]).toBe(options);
    });

    async function bootstrap(): Promise<ComponentContext> {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
        feature: {
          setup(setup) {
            setup.provide({ a: DefaultRenderScheduler, is: mockRenderScheduler });
          },
        },
      })
      class TestComponent {
      }

      const element = new (await testElement(TestComponent))();

      return ComponentSlot.of(element).whenReady;
    }
  });
});
