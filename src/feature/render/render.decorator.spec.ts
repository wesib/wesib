import { noop } from 'call-thru';
import { EventEmitter, EventProducer } from 'fun-events';
import { Component, ComponentClass, ComponentContext } from '../../component';
import { CustomElements, DefinitionContext } from '../../component/definition';
import { ObjectMock } from '../../spec/mocks';
import { MockElement, testElement } from '../../spec/test-element';
import { DomProperty } from '../dom-properties';
import { FeatureDef } from '../feature-def';
import { Feature } from '../feature.decorator';
import { StateSupport } from '../state';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';
import { Render } from './render.decorator';
import Mock = jest.Mock;

describe('feature/render/render.decorator', () => {
  describe('@Render', () => {

    let testComponent: ComponentClass;
    let renderSpy: Mock;
    let offlineRenderSpy: Mock;
    let definitionContext: DefinitionContext<object>;

    beforeEach(() => {
      renderSpy = jest.fn();
      offlineRenderSpy = jest.fn();

      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
        },
        define(ctx) {
          definitionContext = ctx;
        }
      })
      class TestComponent {

        @Render()
        readonly render = renderSpy;

        @Render({ offline: true })
        readonly offlineRender = offlineRenderSpy;

        @DomProperty()
        property = 'value';

      }

      testComponent = TestComponent;
    });

    let renderSchedulerSpy: ObjectMock<RenderScheduler>;

    beforeEach(() => {
      renderSchedulerSpy = {
        scheduleRender: jest.fn((fn: () => void) => fn()),
      };
    });

    let customElementsSpy: ObjectMock<CustomElements>;

    beforeEach(() => {
      customElementsSpy = {
        define: jest.fn(),
      } as any;

      @Feature({
        set: [
          { a: RenderScheduler, is: renderSchedulerSpy },
          { a: CustomElements, is: customElementsSpy },
        ],
        has: RenderSupport,
      })
      class TestFeature {}

      FeatureDef.define(testComponent, {
        need: TestFeature,
      });

      testElement(testComponent);
    });

    it('requires state support', () => {
      expect(FeatureDef.of(testComponent).need).toContain(StateSupport);
    });
    it('requires rendering support', () => {
      expect(FeatureDef.of(testComponent).need).toContain(RenderSupport);
    });

    describe('Rendering', () => {

      let element: any;
      let context: ComponentContext;
      let component: any;

      beforeEach(() => {
        element = new definitionContext.elementType;
        context = ComponentContext.of(element);
        component = context.component as any;
      });

      let connected: boolean;

      beforeEach(() => {
        connected = true;
        jest.spyOn(context, 'connected', 'get').mockImplementation(() => connected);
      });

      it('is not scheduled initially', () => {
        expect(renderSpy).not.toHaveBeenCalled();
      });
      it('is scheduled on state update', () => {
        component.property = 'other';
        expect(renderSpy).toHaveBeenCalled();
      });
      it('is not scheduled on state update while offline', () => {
        connected = false;
        component.property = 'other';
        expect(renderSpy).not.toHaveBeenCalled();
      });
      it('is scheduled when connected', () => {
        connected = true;
        element.connectedCallback();
        expect(renderSpy).toHaveBeenCalled();
      });
      it('is re-scheduled when connected after state update', () => {
        connected = true;
        element.connectedCallback();
        component.property = 'other';
        element.connectedCallback();
        expect(renderSpy).toHaveBeenCalledTimes(2);
      });
      it('is not re-scheduled when connected without state update', () => {
        connected = true;
        element.connectedCallback();
        element.connectedCallback();
        expect(renderSpy).toHaveBeenCalledTimes(1);
      });
      it('uses decorated method', () => {
        renderSchedulerSpy.scheduleRender.mockRestore();
        component.property = 'other';
        renderSchedulerSpy.scheduleRender.mock.calls[0][0]();

        expect(renderSpy).toHaveBeenCalledWith();
        expect(renderSpy.mock.instances[0]).toBe(component);
      });

      describe('Offline', () => {
        it('is scheduled initially', () => {
          expect(offlineRenderSpy).toHaveBeenCalled();
        });
        it('is scheduled on state update', () => {
          renderSchedulerSpy.scheduleRender.mockClear();
          component.property = 'other';
          expect(offlineRenderSpy).toHaveBeenCalled();
        });
        it('is scheduled on state update while offline', () => {
          renderSchedulerSpy.scheduleRender.mockClear();
          connected = false;
          component.property = 'other';
          expect(offlineRenderSpy).toHaveBeenCalled();
        });
      });
    });
  });
});
