import { TypedClassDecorator } from '../../common';
import { ComponentClass, ComponentContext, ComponentDef, DefinitionContext } from '../../component';
import { FeatureDef } from '../../feature';
import { ShadowRootBuilder } from './shadow-root-builder';
import { ShadowDomSupport } from './shadow-dom-support.feature';

/**
 * Component class decorator that attaches shadow root to decorated component instance.
 *
 * @param init Shadow root initialization options. Uses `mode: "open"` by default.
 *
 * @return Component class decorator.
 */
export function AttachShadow<T extends ComponentClass<any> = any>(
    init: ShadowRootInit = { mode: 'open' }): TypedClassDecorator<T> {
  return (type: T) => {
    FeatureDef.define(type, { require: [ShadowDomSupport] });
    ComponentDef.define(
        type,
        {
          define(this: ComponentClass<InstanceType<T>>, context: DefinitionContext<InstanceType<T>>) {

            context.forComponents(
                ComponentContext.shadowRootKey,
                ctx => ctx.get(ShadowRootBuilder.key).attachShadow(ctx, init));

            // Content root is an alias of shadow root.
            context.forComponents(ComponentContext.contentRootKey, ctx => ctx.get(ComponentContext.shadowRootKey));

            // Attach shadow root eagerly on element instantiation.
            context.onComponent(ctx => ctx.get(ComponentContext.shadowRootKey));
          }
        });
  };
}
