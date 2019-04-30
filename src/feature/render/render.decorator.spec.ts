import { Component, ComponentClass, ComponentContext } from '../../component';
import { CustomElements, DefinitionContext } from '../../component/definition';
import { MockElement, testElement } from '../../spec/test-element';
import { DomProperty } from '../dom-properties';
import { FeatureDef } from '../feature-def';
import { Feature } from '../feature.decorator';
import { StateSupport } from '../state';
import { RenderSchedule, RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';
import { Render } from './render.decorator';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('feature/render/render.decorator', () => {
  describe('@Render', () => {

    let testComponent: ComponentClass;
    let mockRender: Mock;
    let mockOfflineRender: Mock;
    let mockDelegateRender: Mock;
    let definitionContext: DefinitionContext<object>;

    beforeEach(() => {
      mockRender = jest.fn();
      mockOfflineRender = jest.fn();
      mockDelegateRender = jest.fn();

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
        readonly render = mockRender;

        @Render({ offline: true })
        readonly offlineRender = mockOfflineRender;

        @DomProperty()
        property = 'value';

        @Render({ offline: true })
        nestRender() {
          return mockDelegateRender;
        }

      }

      testComponent = TestComponent;
    });

    let mockRenderScheduler: Mocked<RenderScheduler>;
    let mockRenderSchedule: Mocked<RenderSchedule>;

    beforeEach(() => {
      mockRenderSchedule = {
        schedule: jest.fn((fn: () => void) => fn()),
      };
      mockRenderScheduler = {
        newSchedule: jest.fn(() => mockRenderSchedule),
      };
    });

    let mockCustomElements: Mocked<CustomElements>;

    beforeEach(() => {
      mockCustomElements = {
        define: jest.fn(),
      } as any;

      @Feature({
        set: [
          { a: RenderScheduler, is: mockRenderScheduler },
          { a: CustomElements, is: mockCustomElements },
        ],
        has: RenderSupport,
      })
      class TestFeature {}

      FeatureDef.define(testComponent, {
        needs: TestFeature,
      });

      testElement(testComponent);
    });

    it('requires state support', () => {
      expect(FeatureDef.of(testComponent).needs).toContain(StateSupport);
    });
    it('requires rendering support', () => {
      expect(FeatureDef.of(testComponent).needs).toContain(RenderSupport);
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
        expect(mockRender).not.toHaveBeenCalled();
      });
      it('is scheduled on state update', () => {
        component.property = 'other';
        expect(mockRender).toHaveBeenCalled();
      });
      it('is not scheduled on state update while offline', () => {
        connected = false;
        component.property = 'other';
        expect(mockRender).not.toHaveBeenCalled();
      });
      it('is scheduled when connected', () => {
        connected = true;
        element.connectedCallback();
        expect(mockRender).toHaveBeenCalled();
      });
      it('is re-scheduled when connected after state update', () => {
        component.property = 'other';
        connected = true;
        element.connectedCallback();
        expect(mockRender).toHaveBeenCalledTimes(1);
      });
      it('is not re-scheduled when connected without state update', () => {
        connected = true;
        element.connectedCallback();
        element.connectedCallback();
        expect(mockRender).toHaveBeenCalledTimes(1);
      });
      it('is not re-scheduled after component destruction', () => {
        connected = true;
        element.connectedCallback();
        context.destroy();
        connected = false;
        component.property = 'other';
        expect(mockRender).toHaveBeenCalledTimes(1);
      });
      it('uses decorated method', () => {
        mockRenderSchedule.schedule.mockRestore();
        component.property = 'other';
        mockRenderSchedule.schedule.mock.calls[0][0]();

        expect(mockRender).toHaveBeenCalledWith();
        expect(mockRender.mock.instances[0]).toBe(component);
      });

      describe('Offline', () => {
        it('is scheduled initially', () => {
          expect(mockOfflineRender).toHaveBeenCalled();
        });
        it('is scheduled on state update', () => {
          mockRenderSchedule.schedule.mockClear();
          component.property = 'other';
          expect(mockOfflineRender).toHaveBeenCalled();
        });
        it('is scheduled on state update while offline', () => {
          mockRenderSchedule.schedule.mockClear();
          connected = false;
          component.property = 'other';
          expect(mockOfflineRender).toHaveBeenCalled();
        });
      });

      describe('Delegated', () => {
        it('is scheduled', () => {
          expect(mockDelegateRender).toHaveBeenCalledTimes(1);
        });
        it('is re-scheduled on state update', () => {
          component.property = 'other';
          expect(mockDelegateRender).toHaveBeenCalledTimes(2);
        });
        it('does not re-create schedule on state update', () => {

          const schedulesCreated = mockRenderScheduler.newSchedule.mock.calls.length;

          component.property = 'other';
          expect(mockRenderScheduler.newSchedule).toHaveBeenCalledTimes(schedulesCreated);
        });
        it('is scheduled with a replacement function', () => {

          const replacement = jest.fn();

          mockDelegateRender.mockImplementation(() => replacement);

          component.property = 'other';
          expect(mockDelegateRender).toHaveBeenCalledTimes(2);
          expect(replacement).toHaveBeenCalled();

          component.property = 'third';
          expect(mockDelegateRender).toHaveBeenCalledTimes(2);
          expect(replacement).toHaveBeenCalledTimes(2);
        });
      });
    });
  });
});
