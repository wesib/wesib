import { TypedClassDecorator } from '../../common';
import { ComponentClass, ComponentDef } from '../../component';
import { ShadowContentDef } from './shadow-content-def';

/**
 * Component class decorator that attaches shadow root to decorated component instance.
 *
 * Applies component definition created by `ShadowContentDef.componentDef()` function.
 *
 * @typeparam T A type of component.
 * @param def Shadow content root definition. Uses `mode: 'open'` by default.
 *
 * @return Component class decorator.
 */
export function AttachShadow<T extends ComponentClass = any>(
    def?: ShadowContentDef): TypedClassDecorator<T> {
  return (type: T) => {
    ComponentDef.define(
        type,
        ShadowContentDef.componentDef(def));
  };
}
