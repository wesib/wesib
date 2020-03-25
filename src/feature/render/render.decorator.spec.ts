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
import { DomProperty, domPropertyPathTo } from '../dom-properties';
import { ComponentState } from '../state';
import { ElementRenderCtl } from './element-render-ctl';
import { ElementRenderer } from './element-renderer';
import { RenderDef } from './render-def';
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

    let connected: boolean;

    beforeEach(() => {
      connected = true;
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

      const { component } = await bootstrap();

      component.property = 'other';
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('is scheduled on state part update', async () => {

      const { component } = await bootstrap({ path: domPropertyPathTo('property2') });

      component.property2 = 'other';
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('is scheduled on another state part update', async () => {

      const { component } = await bootstrap({ path: domPropertyPathTo('property2') });

      component.property = 'other';
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('is not scheduled on state update while offline', async () => {

      const { component } = await bootstrap();

      connected = false;
      component.property = 'other';
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('is scheduled when connected', async () => {

      const { element } = await bootstrap();

      connected = true;
      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalled();
    });
    it('is re-scheduled when connected after state update', async () => {

      const { component, element } = await bootstrap();

      component.property = 'other';
      connected = true;
      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not re-scheduled when connected without state update', async () => {

      const { element } = await bootstrap();

      connected = true;
      element.connectedCallback();
      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not re-scheduled after component destruction', async () => {

      const context = await bootstrap();
      const { element } = context;

      connected = true;
      element.connectedCallback();
      context.destroy();
      connected = false;
      context.updateState(domPropertyPathTo('property'), 'other', 'init');
      expect(mockRenderer).toHaveBeenCalledTimes(1);
    });
    it('is not rendered after component destruction', async () => {

      const scheduler = newManualRenderScheduler();

      mockRenderSchedule.mockImplementation(scheduler());

      const context = await bootstrap();
      const { component, element } = context;

      connected = true;
      element.connectedCallback();
      component.property = 'other';
      context.destroy();
      scheduler.render();
      expect(mockRenderer).not.toHaveBeenCalled();
    });
    it('uses decorated method', async () => {

      const { component, element } = await bootstrap();

      connected = true;
      element.connectedCallback();
      expect(mockRenderer).toHaveBeenCalledWith(expect.objectContaining({
        config: expect.objectContaining({
          window,
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

        const { component } = await bootstrap({}, () => mockRenderer);
        const { element } = await bootstrap({}, () => mockRenderer);

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

    describe('ElementRenderCtl', () => {
      beforeEach(() => {
        mockRenderSchedule.mockImplementation(noopRenderScheduler());
      });

      describe('renderNow', () => {
        it('renders component immediately', async () => {

          const context = await bootstrap();
          const renderCtl = context.get(ElementRenderCtl);

          renderCtl.renderNow();
          expect(mockRenderer).toHaveBeenCalledTimes(1);
        });
        it('does not render component without state update', async () => {

          const context = await bootstrap();
          const renderCtl = context.get(ElementRenderCtl);

          renderCtl.renderNow();
          renderCtl.renderNow();
          renderCtl.renderNow();
          expect(mockRenderer).toHaveBeenCalledTimes(1);
        });
        it('renders component after state update', async () => {

          const context = await bootstrap();
          const renderCtl = context.get(ElementRenderCtl);

          renderCtl.renderNow();
          context.element.property = 'other';
          renderCtl.renderNow();
          expect(mockRenderer).toHaveBeenCalledTimes(2);
        });
      });
    });

    async function bootstrap(def?: RenderDef, renderer: ElementRenderer = mockRenderer): Promise<ComponentContext> {

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
      const context = ComponentContext.of(element);

      jest.spyOn(context, 'connected', 'get').mockImplementation(() => connected);

      return context;
    }
  });
});
