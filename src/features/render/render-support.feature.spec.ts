import SpyObj = jasmine.SpyObj;
import { bootstrapComponents } from '../../bootstrap';
import { Class } from '../../common';
import { ComponentClass, ComponentContext, CustomElements, WesComponent } from '../../component';
import { BootstrapContext, WesFeature } from '../../feature';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';

describe('features/render/render-support.feature', () => {
  describe('RenderSupport', () => {

    let windowSpy: SpyObj<Window>;
    let customElementsSpy: SpyObj<CustomElements>;

    beforeEach(() => {
      windowSpy = jasmine.createSpyObj('window', ['requestAnimationFrame']);
      customElementsSpy = jasmine.createSpyObj('customElements', ['define']);
    });

    let testComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {
      @WesComponent({
        name: 'test-component',
        extend: {
          type: Object,
        },
        define(ctx) {
          ctx.whenReady(() => {
            elementType = ctx.elementType;
          });
        },
      })
      class TestComponent {}

      testComponent = TestComponent;
    });

    beforeEach(() => {

      @WesFeature({
        require: [RenderSupport, testComponent],
        prebootstrap: [
          { key: BootstrapContext.windowKey, value: windowSpy },
          { key: CustomElements.key, value: customElementsSpy },
        ]
      })
      class TestFeature {}

      bootstrapComponents(TestFeature);
    });

    describe('RenderScheduler', () => {

      let componentContext: ComponentContext;
      let renderScheduler: RenderScheduler;

      beforeEach(() => {

        const element = new elementType;

        componentContext = ComponentContext.of(element);
        renderScheduler = componentContext.get(RenderScheduler.key);
      });

      it('is available to component', () => {
        expect(renderScheduler).toBeDefined();
      });

      describe('scheduleRender', () => {
        it('requests animation frame', () => {

          const renderSpy = jasmine.createSpy('render');

          renderScheduler.scheduleRender(renderSpy);

          expect(windowSpy.requestAnimationFrame).toHaveBeenCalledWith(jasmine.any(Function));
          expect(renderSpy).not.toHaveBeenCalled();

          windowSpy.requestAnimationFrame.calls.first().args[0]();

          expect(renderSpy).toHaveBeenCalled();
        });
        it('does not request animation frame for the second time', () => {

          const render1spy = jasmine.createSpy('render1');
          const render2spy = jasmine.createSpy('render2');

          renderScheduler.scheduleRender(render1spy);
          renderScheduler.scheduleRender(render2spy);

          expect(windowSpy.requestAnimationFrame).toHaveBeenCalledTimes(1);
        });
        it('renders with the latest scheduled renderer', () => {

          const render1spy = jasmine.createSpy('render1');
          const render2spy = jasmine.createSpy('render2');

          renderScheduler.scheduleRender(render1spy);
          renderScheduler.scheduleRender(render2spy);

          windowSpy.requestAnimationFrame.calls.first().args[0]();

          expect(render1spy).not.toHaveBeenCalled();
          expect(render2spy).toHaveBeenCalled();
        });
        it('allows to re-render', () => {

          const render1spy = jasmine.createSpy('render1');

          renderScheduler.scheduleRender(render1spy);

          windowSpy.requestAnimationFrame.calls.first().args[0]();

          expect(render1spy).toHaveBeenCalled();

          const render2spy = jasmine.createSpy('render2');

          renderScheduler.scheduleRender(render2spy);

          windowSpy.requestAnimationFrame.calls.first().args[0]();

          expect(render2spy).toHaveBeenCalled();
        });
      });
    });
  });
});