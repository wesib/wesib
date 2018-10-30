import { bootstrapComponents } from '../../bootstrap';
import { Component, ComponentClass, ComponentContext, CustomElements, DefinitionContext } from '../../component';
import { Feature, FeatureDef } from '../../feature';
import { DomProperty } from '../dom-properties';
import { StateSupport } from '../state';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';
import { Render } from './render.decorator';
import Spy = jasmine.Spy;
import SpyObj = jasmine.SpyObj;

describe('features/render/render.decorator', () => {
  describe('@Render', () => {

    let customElementsSpy: SpyObj<CustomElements>;
    let renderSchedulerSpy: SpyObj<RenderScheduler>;
    let testComponent: ComponentClass;
    let renderSpy: Spy;
    let definitionContext: DefinitionContext<object>;

    beforeEach(() => {
      renderSpy = jasmine.createSpy('render');

      @Component({
        name: 'test-component',
        extend: {
          type: Object,
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
      renderSchedulerSpy = jasmine.createSpyObj('renderScheduler', ['scheduleRender']);
    });
    beforeEach(() => {
      customElementsSpy = jasmine.createSpyObj('customElements', ['define']);

      @Feature({
        require: testComponent,
        prebootstrap: [
          { provide: RenderScheduler, value: renderSchedulerSpy },
          { provide: CustomElements, value: customElementsSpy },
        ],
        provide: RenderSupport,
      })
      class TestFeature {}

      bootstrapComponents(TestFeature);
    });

    it('requires state support', () => {
      expect(FeatureDef.of(testComponent).require).toContain(StateSupport);
    });
    it('requires rendering support', () => {
      expect(FeatureDef.of(testComponent).require).toContain(RenderSupport);
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
        renderSchedulerSpy.scheduleRender.calls.first().args[0]();

        expect(renderSpy).toHaveBeenCalledWith();
        expect(renderSpy.calls.first().object).toBe(component);
      });
    });
  });
});
