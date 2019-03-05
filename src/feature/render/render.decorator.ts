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

                let rendered = false;
                const component = componentContext.component as any;
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
                  renderScheduler.scheduleRender(() => component[propertyKey]());
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
     * be initiated once element is connected.
     */
    offline?: boolean;

  }

}
