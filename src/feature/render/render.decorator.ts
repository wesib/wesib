import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { ComponentState, StateSupport } from '../state';
import { RenderDef } from './render-def';
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
 * @param def Non-mandatory render definition.
 *
 * @returns Component method decorator.
 */
export function Render<T extends ComponentClass>(def: RenderDef = {}): TypedPropertyDecorator<T> {

  const { offline } = def;

  return <V>(target: InstanceType<T>, propertyKey: string | symbol) => {

    const componentType = target.constructor as T;

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
          feature: {
            needs: [StateSupport, RenderSupport],
          },
        });
  };
}
