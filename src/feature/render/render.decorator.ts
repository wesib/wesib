import { StateTracker } from 'fun-events';
import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { StateSupport } from '../state';
import { RenderScheduler } from './render-scheduler';
import { RenderSupport } from './render-support.feature';

/**
 * Component property decorator that declares a rendering method for the component.
 *
 * The decorated method call will be scheduled by `RenderScheduler` once component state updated.
 *
 * This decorator automatically enables `StateSupport` and `RenderSupport` features.
 *
 * @returns Component property decorator.
 */
export function Render<T extends ComponentClass>(): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol) => {

    const componentType = target.constructor as T;

    FeatureDef.define(componentType, { need: [StateSupport, RenderSupport] });

    ComponentDef.define(
        componentType,
        {
          define(defContext) {
            defContext.onComponent(compContext => {
              compContext.whenReady(() => {

                const component = compContext.component as any;
                const stateTracker = compContext.get(StateTracker);
                const renderScheduler = compContext.get(RenderScheduler);

                stateTracker.onUpdate(() => {
                  renderScheduler.scheduleRender(() => component[propertyKey]());
                });
              });
            });
          },
        });
  };
}
