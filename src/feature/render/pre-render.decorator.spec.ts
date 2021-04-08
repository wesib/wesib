import {
  immediateRenderScheduler,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { DefaultPreRenderScheduler, DefaultRenderScheduler } from '../../boot/globals';
import { Component, ComponentContext, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../spec/test-element';
import { DomProperty } from '../dom-properties';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';
import { ComponentRendererExecution } from './component-renderer-execution';
import { PreRender } from './pre-render.decorator';
import { RenderDef } from './render-def';

describe('feature/render', () => {
  describe('@PreRender', () => {

    let mockRenderScheduler: jest.Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockRenderSchedule: jest.Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockRenderSchedule = jest.fn(immediateRenderScheduler());
      mockRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockRenderSchedule);
    });

    let mockPreRenderScheduler: jest.Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockPreRenderSchedule: jest.Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockPreRenderSchedule = jest.fn(immediateRenderScheduler());
      mockPreRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockPreRenderSchedule);
    });

    let mockPreRenderer: jest.Mock<void, [ComponentPreRendererExecution]>;

    beforeEach(() => {
      mockPreRenderer = jest.fn();
    });

    it('is not scheduled initially', async () => {
      await bootstrap();
      expect(mockPreRenderer).not.toHaveBeenCalled();
    });
    it('is scheduled on state update', async () => {

      const { component, element } = await bootstrap();

      element.connectedCallback();
      expect(mockPreRenderer).toHaveBeenCalledTimes(1);

      component.property = 'other';
      expect(mockPreRenderer).toHaveBeenCalledTimes(2);
    });
    it('is not re-scheduled when stopped', async () => {
      mockPreRenderer.mockImplementation(({ supply }) => supply.off());

      const { component, element } = await bootstrap();

      element.connectedCallback();
      component.property = 'other';
      expect(mockPreRenderer).toHaveBeenCalledTimes(1);
    });

    describe('Postponed', () => {
      it('is executed', async () => {

        const postponed = jest.fn();

        mockPreRenderer.mockImplementation(({ postpone }) => postpone(postponed));

        const { element } = await bootstrap();

        element.connectedCallback();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
      });
    });

    describe('Delegate pre-renderer', () => {

      let delegate: jest.Mock<void, [ComponentPreRendererExecution]>;

      beforeEach(() => {
        delegate = jest.fn();
        mockPreRenderer.mockImplementation(({ preRenderBy }) => preRenderBy(delegate));
      });

      it('is scheduled', async () => {

        const { element } = await bootstrap();

        element.connectedCallback();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(1);
      });
      it('is re-scheduled on state update', async () => {

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
      });
      it('does not re-create schedule on state update', async () => {

        const { component, element } = await bootstrap();

        element.connectedCallback();

        component.property = 'other';
        expect(mockPreRenderScheduler).toHaveBeenCalledTimes(1);
      });
    });

    describe('Delegate renderer', () => {

      let delegate: jest.Mock<void, [ComponentRendererExecution]>;

      beforeEach(() => {
        delegate = jest.fn();
        mockPreRenderer.mockImplementation(({ renderBy }) => renderBy(delegate));
      });

      it('is scheduled', async () => {

        const { element } = await bootstrap();

        element.connectedCallback();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(1);
      });
      it('is re-scheduled on state update', async () => {

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
      });
    });

    async function bootstrap(def?: RenderDef): Promise<ComponentContext> {

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
        feature: {
          setup(setup) {
            setup.provide({ a: DefaultRenderScheduler, is: mockRenderScheduler });
            setup.provide({ a: DefaultPreRenderScheduler, is: mockPreRenderScheduler });
          },
        },
      })
      class TestComponent {

        @PreRender(def)
        readonly preRender = mockPreRenderer;

        @DomProperty()
        property = 'value';

        @DomProperty()
        property2 = 'value';

      }

      const element = new (await testElement(TestComponent))();

      return ComponentSlot.of(element).whenReady;
    }
  });

});
