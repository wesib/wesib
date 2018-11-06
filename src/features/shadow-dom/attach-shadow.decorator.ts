import { TypedClassDecorator } from '../../common';
import { ComponentClass, ComponentDef, ContentRoot, DefinitionContext } from '../../component';
import { FeatureDef } from '../../feature';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowDomSupport } from './shadow-dom-support.feature';
import { ShadowRootBuilder } from './shadow-root-builder';

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

            context.forComponents({
              a: ShadowContentRoot,
              by(ctx) {
                return ctx.get(ShadowRootBuilder)(ctx, init);
              },
            });

            // Content root is an alias of shadow root.
            context.forComponents({
              a: ContentRoot,
              by(ctx) {
                return ctx.get(ShadowContentRoot);
              },
            });

            // Attach shadow root eagerly on element instantiation.
            context.onComponent(ctx => ctx.get(ShadowContentRoot));
          }
        });
  };
}
