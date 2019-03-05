import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { ComponentState, StateSupport } from '../state';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';

/**
 * Component property decorator that declares a rendering method for the component.
 *
 * The decorated method call will be scheduled by `RenderScheduler` once component state updated.
 *
 * The decorated method should have no arguments. It may return either nothing, or a function. In the latter case the
 * returned function will be called immediately to render the element. It may, in turn, return a renderer function,
 * and so on.
 *
 * This decorator automatically enables `StateSupport` and `RenderSupport` features.
 *
 * @param opts Non-mandatory rendering options.
 *
 * @returns Component method decorator.
 */
export function Render<T extends ComponentClass>({ offline }: Render.Opts = {}): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol) => {

    const componentType = target.constructor as T;

    FeatureDef.define(componentType, { need: [StateSupport, RenderSupport] });

    ComponentDef.define(
        componentType,
        {
          define(defContext) {
            defContext.onComponent(componentContext => {
              componentContext.whenReady(() => {

                const component = componentContext.component as any;
                let renderer: () => any = component[propertyKey];
                let rendered = false;
                const stateTracker = componentContext.get(ComponentState);
                const renderScheduler = componentContext.get(RenderScheduler);

                stateTracker.onUpdate(() => {
                  if (offline || componentContext.connected) {
                    scheduleRender();
                  } else {
                    rendered = false;
                  }
                });
                if (offline) {
                  scheduleRender();
                } else {
                  componentContext.onConnect(() => {
                    if (!rendered) {
                      scheduleRender();
                    }
                  });
                }

                function scheduleRender() {
                  rendered = true;
                  renderScheduler.scheduleRender(render);
                }

                function render() {
                  for (;;) {

                    const newRenderer = renderer.call(component);

                    if (newRenderer === renderer || typeof newRenderer !== 'function') {
                      break;
                    }

                    renderer = newRenderer;
                  }
                }
              });
            });
          },
        });
  };
}

export namespace Render {

  /**
   * Rendering options.
   */
  export interface Opts {

    /**
     * Whether to render element contents while disconnected.
     *
     * When offline rendering is disabled the rendering will be scheduled whenever element is connected.
     *
     * `false` by default. Which means the element contents won't be rendered while disconnected. Rendering will
     * be initiated once element is connected for the first time, or if it is connected after state update.
     */
    offline?: boolean;

  }

}
