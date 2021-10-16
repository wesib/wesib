import { drekContextOf } from '@frontmeans/drek';
import {
  immediateRenderScheduler,
  newManualRenderScheduler,
  RenderSchedule,
  RenderScheduleOptions,
  RenderScheduler,
} from '@frontmeans/render-scheduler';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { cxConstAsset } from '@proc7ts/context-builder';
import { Mock } from 'jest-mock';
import { Component, ComponentContext, ComponentElement, ComponentSlot } from '../../component';
import { MockElement, testElement } from '../../testing';
import { DomProperty, domPropertyPathTo } from '../dom-properties';
import { ComponentState } from '../state';
import { ComponentRendererExecution } from './component-renderer-execution';
import { RenderDef, RenderPath__root } from './render-def';
import { Render } from './render.amendment';

describe('feature/render', () => {
  describe('@Render', () => {

    let mockRenderScheduler: Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockRenderSchedule: Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockRenderSchedule = jest.fn(immediateRenderScheduler());
      mockRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockRenderSchedule);
    });

    let mockRenderer: Mock<void, [ComponentRendererExecution]>;

    beforeEach(() => {
      mockRenderer = jest.fn();
    });

    it('enables component state', async () => {

      const context = await bootstrap();

      expect(context.get(ComponentState, { or: null })).toBeDefined();
    });
    it('is not scheduled initially', async () => {
      await bootstrap();
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('is scheduled on state update', async () => {

      const { component, element } = await bootstrap();

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('is scheduled on state part update', async () => {

      const { element, component } = await bootstrap({ on: domPropertyPathTo('property2') });

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property2 = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('is scheduled on specified state part update', async () => {

      const { element, component } = await bootstrap({ on: domPropertyPathTo('property2') });

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property2 = 'third';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('is not scheduled on ignored sub-state update', async () => {

      const context = await bootstrap();
      const { element, component } = context;

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      context.updateState([RenderPath__root, 'some'], 'new', 'old');
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property2 = 'third';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('reports errors by calling custom function', async () => {
      mockRenderScheduler = jest.fn(immediateRenderScheduler);

      const error = new Error('test');

      mockRenderer.mockImplementation(() => {
        throw error;
      });

      const logError = jest.fn();
      const renderDef = { error: logError };
      const { element } = await bootstrap(renderDef);

      element.connectedCallback();
      expect(logError).toHaveBeenCalledWith(error);
    });
    it('is not scheduled on state update when not settled', async () => {

      const { component } = await bootstrap();

      component.property = 'other';
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('is scheduled when settled', async () => {

      const context = await bootstrap();

      context.settle();
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('is scheduled when connected', async () => {

      const { element } = await bootstrap();

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('(when: connected) is scheduled when connected', async () => {

      const { element } = await bootstrap({ when: 'connected' });

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('(when: connected) is not scheduled on settle', async () => {

      const context = await bootstrap({ when: 'connected' });

      context.settle();
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('is re-scheduled after when settled after state update', async () => {

      const context = await bootstrap();

      context.settle();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      context.component.property = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('(when: connected) is re-scheduled when connected after state update', async () => {

      const { component, element } = await bootstrap({ when: 'connected' });

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      component.property = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(2);
    });
    it('is not re-scheduled when stopped', async () => {
      mockRenderer.mockImplementation(({ supply }) => supply.off());

      const { component, element } = await bootstrap();

      element.connectedCallback();
      component.property = 'other';
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not re-scheduled after component disconnection', async () => {

      const context = await bootstrap();
      const { element } = context;

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      jest.spyOn(element, 'getRootNode').mockImplementation(() => element);
      element.disconnectedCallback();

      context.updateState(domPropertyPathTo('property'), 'other', 'init');
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not rendered after component disconnection', async () => {

      const scheduler = newManualRenderScheduler();

      mockRenderSchedule.mockImplementation(scheduler());

      const context = await bootstrap();
      const { component, element } = context;

      element.connectedCallback();
      component.property = 'other';

      jest.spyOn(element, 'getRootNode').mockImplementation(() => element);
      element.disconnectedCallback();

      scheduler.render();
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('uses decorated method', async () => {

      const { component, element } = await bootstrap();

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({
          error: expect.any(Function),
        }),
        postpone: expect.any(Function),
      }));
      expect(mockRenderer.mock.instances[0]).toBe(component);
    });
    it('lifts unrooted rendering contexts', async () => {

      const doc = document.implementation.createHTMLDocument('test');
      const whenConnected1 = jest.fn();
      const whenConnected2 = jest.fn();

      mockRenderer.mockImplementation(() => {

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

    describe('Postponed', () => {
      it('is executed', async () => {

        const postponed = jest.fn();

        mockRenderer.mockImplementation(({ postpone }) => postpone(postponed));

        const { element } = await bootstrap();

        element.connectedCallback();
        expect(mockRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
      });
      it('able to delegate to another renderer', async () => {

        const delegate = jest.fn();
        const postponed = jest.fn(({ renderBy }: ComponentRendererExecution): void => {
          renderBy(delegate);
        });

        mockRenderer.mockImplementation(({ postpone }) => postpone(postponed));

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(1);

        component.property = 'third';
        expect(mockRenderer).toHaveBeenCalledTimes(1);
        expect(postponed).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
      });
    });

    describe('Delegate', () => {

      let delegate: Mock<void, [ComponentRendererExecution]>;

      beforeEach(() => {
        delegate = jest.fn();
        mockRenderer.mockImplementation(({ renderBy }) => renderBy(delegate));
      });

      it('is scheduled', async () => {

        const { element } = await bootstrap();

        element.connectedCallback();
        expect(mockRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(1);
      });
      it('is re-scheduled on state update', async () => {

        const { element, component } = await bootstrap();

        element.connectedCallback();
        component.property = 'other';
        expect(mockRenderer).toHaveBeenCalledTimes(1);
        expect(delegate).toHaveBeenCalledTimes(2);
      });
      it('does not re-create schedule on state update', async () => {

        const { component, element } = await bootstrap();

        element.connectedCallback();

        component.property = 'other';
        expect(mockRenderScheduler).toHaveBeenCalledTimes(1);
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
            setup.provide(cxConstAsset(RenderScheduler, mockRenderScheduler));
          },
        },
      })
      class TestComponent {

        @Render(def)
        readonly render = mockRenderer;

        @DomProperty()
        property = 'value';

        @DomProperty()
        property2 = 'value';

      }

      const element: ComponentElement = new (await testElement(TestComponent))();

      return ComponentSlot.of(element).whenReady;
    }
  });
});
