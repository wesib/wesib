import { Component, ComponentClass, ComponentContext, ComponentDef } from '../../component';
import { CustomElements, DefinitionContext } from '../../component/definition';
import { bootstrapComponents } from '../../kit/bootstrap';
import { MockElement, testElement } from '../../spec/test-element';
import { DomProperty } from '../dom-properties';
import { FeatureDef } from '../feature-def';
import { Feature } from '../feature.decorator';
import { StateSupport } from '../state';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';
import { Render } from './render.decorator';
import Mock = jest.Mock;
import Mocked = jest.Mocked;

describe('feature/render/render.decorator', () => {
  describe('@Render', () => {

    let customElementsSpy: Mocked<CustomElements>;
    let renderSchedulerSpy: Mocked<RenderScheduler>;
    let testComponent: ComponentClass;
    let renderSpy: Mock;
    let definitionContext: DefinitionContext<object>;

    beforeEach(() => {
      renderSpy = jest.fn();

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

        @DomProperty()
        property = 'value';

      }

      testComponent = TestComponent;
    });
    beforeEach(() => {
      renderSchedulerSpy = {
        scheduleRender: jest.fn(),
      };
    });
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
      let component: any;

      beforeEach(() => {
        element = new definitionContext.elementType;
        component = ComponentContext.of(element).component as any;
      });

      it('is scheduled on state update', () => {
        component.property = 'other';
        expect(renderSchedulerSpy.scheduleRender).toHaveBeenCalled();
      });
      it('uses decorated method', () => {
        component.property = 'other';
        renderSchedulerSpy.scheduleRender.mock.calls[0][0]();

        expect(renderSpy).toHaveBeenCalledWith();
        expect(renderSpy.mock.instances[0]).toBe(component);
      });
    });
  });
});
