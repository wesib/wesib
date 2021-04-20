import { drekContextOf } from '@frontmeans/drek';
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
    it('lifts unrooted rendering contexts', async () => {

      const doc = document.implementation.createHTMLDocument('test');
      const whenConnected1 = jest.fn();
      const whenConnected2 = jest.fn();

      mockPreRenderer.mockImplementation(() => {

        const element1 = doc.createElement('test-element-1');
        const element2 = doc.createElement('test-element-2');

        drekContextOf(element1).whenConnected(whenConnected1);
        drekContextOf(element2).whenConnected(whenConnected1);

        doc.body.append(element1);
      });

      const { element } = await bootstrap();

      element.connectedCallback();

      expect(whenConnected1).toHaveBeenCalledWith({ connected: true });
      expect(whenConnected2).not.toHaveBeenCalled();
    });

    describe('connected', () => {
      it('is scheduled on state update', async () => {

        const { component, element } = await bootstrap();

        element.connectedCallback();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(mockPreRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockPreRenderSchedule).toHaveBeenCalledTimes(1);
        expect(mockRenderScheduler).not.toHaveBeenCalled();
        expect(mockRenderSchedule).not.toHaveBeenCalled();

        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(2);
        expect(mockPreRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockPreRenderSchedule).toHaveBeenCalledTimes(2);
        expect(mockRenderScheduler).not.toHaveBeenCalled();
      });
      it('is not re-scheduled when stopped', async () => {
        mockPreRenderer.mockImplementation(({ supply }) => supply.off());

        const { component, element } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
      });
    });

    describe('disconnected', () => {
      it('is scheduled on state update', async () => {

        const context = await bootstrap();
        const { component } = context;

        context.settle();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(mockPreRenderScheduler).not.toHaveBeenCalled();
        expect(mockRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockRenderSchedule).toHaveBeenCalledTimes(1);

        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(2);
        expect(mockPreRenderScheduler).not.toHaveBeenCalled();
        expect(mockRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockRenderSchedule).toHaveBeenCalledTimes(2);
      });
      it('is re-scheduled in pre-render scheduler when connected', async () => {

        const context = await bootstrap();
        const { component, element } = context;

        context.settle();
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(mockPreRenderScheduler).not.toHaveBeenCalled();
        expect(mockRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockRenderSchedule).toHaveBeenCalledTimes(1);

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(2);
        expect(mockPreRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockPreRenderSchedule).toHaveBeenCalledTimes(1);
        expect(mockRenderScheduler).toHaveBeenCalledTimes(1);
        expect(mockRenderSchedule).toHaveBeenCalledTimes(1);
      });
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
      it('able to delegate to another pre-renderer', async () => {

        const delegate = jest.fn();
        const postponed = jest.fn(({ preRenderBy }: ComponentPreRendererExecution): void => {
          preRenderBy(delegate);
        });

        mockPreRenderer.mockImplementation(({ postpone }) => postpone(postponed));

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(1);

        component.property = 'third';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
      });
      it('able to delegate to another renderer', async () => {

        const delegate = jest.fn();
        const postponed = jest.fn(({ renderBy }: ComponentPreRendererExecution): void => {
          renderBy(delegate);
        });

        mockPreRenderer.mockImplementation(({ postpone }) => postpone(postponed));

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
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
        expect(delegate).toHaveBeenCalledTimes(2);
      });
      it('is re-scheduled on state update', async () => {

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockPreRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(3);
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
