/**
 * @module @wesib/wesib
 */
import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { StateSupport } from '../state';
import { ElementRender } from './element-render';
import { RenderDef } from './render-def';
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
 * Utilizes `ElementRender.render()` function to define rendering.
 *
 * @param def  Non-mandatory render definition.
 *
 * @returns Component method decorator.
 */
export function Render<T extends ComponentClass>(def?: RenderDef): TypedPropertyDecorator<T> {
  return (target: InstanceType<T>, propertyKey: string | symbol) => {

    const componentType = target.constructor as T;

    ComponentDef.define(
        componentType,
        {
          define(defContext) {
            defContext.onComponent(componentContext => {
              componentContext.whenReady(() => {

                const component = componentContext.component as any;
                const render: () => any = component[propertyKey].bind(component);

                ElementRender.render(componentContext, render, def);
              });
            });
          },
          feature: {
            needs: [StateSupport, RenderSupport],
          },
        });
  };
}
