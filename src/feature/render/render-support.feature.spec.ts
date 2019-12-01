import { BootstrapContext } from '../../boot';
import { BootstrapWindow } from '../../boot/globals';
import { Class } from '../../common';
import { Component, ComponentContext } from '../../component';
import { ComponentClass, CustomElements } from '../../component/definition';
import { MockElement, testElement } from '../../spec/test-element';
import { FeatureDef } from '../feature-def';
import { Feature } from '../feature.decorator';
import { RenderSchedule, RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';
import Mocked = jest.Mocked;

describe('feature/render', () => {
  describe('RenderSupport', () => {

    let windowSpy: Mocked<Window>;
    let customElementsSpy: Mocked<CustomElements>;

    beforeEach(() => {
      windowSpy = {
        requestAnimationFrame: jest.fn(),
      } as any;
      customElementsSpy = {
        define: jest.fn(),
      } as any;
    });

    let testComponent: ComponentClass;
    let elementType: Class;

    beforeEach(() => {
      @Component({
        name: 'test-component',
        extend: {
          type: MockElement,
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

    beforeEach(async () => {

      @Feature({
        needs: [RenderSupport],
        set: [
          { a: BootstrapWindow, is: windowSpy },
          { a: CustomElements, is: customElementsSpy },
        ],
      })
      class TestFeature {}

      FeatureDef.define(testComponent, { needs: TestFeature });

      await testElement(testComponent);
    });

    describe('RenderSchedule', () => {

      let componentContext: ComponentContext;
      let renderSchedule: RenderSchedule;

      beforeEach(() => {

        const element = new elementType;

        componentContext = ComponentContext.of(element);
        renderSchedule = componentContext.get(BootstrapContext).get(RenderScheduler).newSchedule();
      });

      describe('schedule', () => {
        it('requests animation frame', () => {

          const renderSpy = jest.fn();

          renderSchedule.schedule(renderSpy);

          expect(windowSpy.requestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
          expect(renderSpy).not.toHaveBeenCalled();

          windowSpy.requestAnimationFrame.mock.calls[0][0](0);

          expect(renderSpy).toHaveBeenCalled();
        });
        it('does not request animation frame for the second time', () => {

          const render1spy = jest.fn();
          const render2spy = jest.fn();

          renderSchedule.schedule(render1spy);
          renderSchedule.schedule(render2spy);

          expect(windowSpy.requestAnimationFrame).toHaveBeenCalledTimes(1);
        });
        it('renders with the latest scheduled renderer', () => {

          const render1spy = jest.fn();
          const render2spy = jest.fn();

          renderSchedule.schedule(render1spy);
          renderSchedule.schedule(render2spy);

          windowSpy.requestAnimationFrame.mock.calls[0][0](0);

          expect(render1spy).not.toHaveBeenCalled();
          expect(render2spy).toHaveBeenCalled();
        });
        it('allows to re-render', () => {

          const render1spy = jest.fn();

          renderSchedule.schedule(render1spy);

          windowSpy.requestAnimationFrame.mock.calls[0][0](0);

          expect(render1spy).toHaveBeenCalled();

          const render2spy = jest.fn();

          renderSchedule.schedule(render2spy);

          windowSpy.requestAnimationFrame.mock.calls[0][0](0);

          expect(render2spy).toHaveBeenCalled();
        });
      });
    });
  });
});
