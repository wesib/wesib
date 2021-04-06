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
import { DomProperty, domPropertyPathTo } from '../dom-properties';
import { ComponentState } from '../state';
import { ComponentRenderer } from './component-renderer';
import { RenderDef, RenderPath__root } from './render-def';
import { Render } from './render.decorator';
import Mock = jest.Mock;

describe('feature/render', () => {
  describe('@Render', () => {

    let mockRenderScheduler: Mock<RenderSchedule, Parameters<RenderScheduler>>;
    let mockRenderSchedule: Mock<void, Parameters<RenderSchedule>>;

    beforeEach(() => {
      mockRenderSchedule = jest.fn(immediateRenderScheduler());
      mockRenderScheduler = jest.fn((_options?: RenderScheduleOptions) => mockRenderSchedule);
    });

    let mockRenderer: Mock;

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
    it('reports errors by calling the given method', async () => {
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
      expect(logError.mock.instances[0]).toBe(renderDef);
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
    it('is not re-scheduled after component destruction', async () => {

      const context = await bootstrap();
      const { element } = context;

      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);

      context.destroy();
      context.updateState(domPropertyPathTo('property'), 'other', 'init');
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not rendered after component destruction', async () => {

      const scheduler = newManualRenderScheduler();

      mockRenderSchedule.mockImplementation(scheduler());

      const context = await bootstrap();
      const { component, element } = context;

      element.connectedCallback();
      component.property = 'other';
      context.destroy();
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

    describe('Delegated', () => {
      it('is scheduled', async () => {

        const { element } = await bootstrap({}, () => mockRenderer);

        element.connectedCallback();
        expect(mockRenderer).toHaveBeenCalledTimes(1);
      });
      it('is re-scheduled on state update', async () => {

        const { element, component } = await bootstrap({}, () => mockRenderer);

        element.connectedCallback();
        component.property = 'other';
        expect(mockRenderer).toHaveBeenCalledTimes(2);
      });
      it('does not re-create schedule on state update', async () => {

        const { component, element } = await bootstrap({}, () => mockRenderer);

        element.connectedCallback();
        mockRenderScheduler.mockClear();

        component.property = 'other';
        expect(mockRenderScheduler).not.toHaveBeenCalled();
      });
      it('is scheduled with a replacement function', async () => {

        const { component, element } = await bootstrap({}, () => mockRenderer);

        element.connectedCallback();

        const replacement = jest.fn();

        mockRenderer.mockImplementation(() => replacement);

        component.property = 'other';
        expect(mockRenderer).toHaveBeenCalledTimes(2);
        expect(replacement).toHaveBeenCalled();

        component.property = 'third';
        expect(mockRenderer).toHaveBeenCalledTimes(2);
        expect(replacement).toHaveBeenCalledTimes(2);
      });
    });

    async function bootstrap(def?: RenderDef, renderer: ComponentRenderer = mockRenderer): Promise<ComponentContext> {

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

        @Render(def)
        readonly render = renderer;

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
