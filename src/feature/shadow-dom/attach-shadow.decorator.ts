import { TypedClassDecorator } from '../../common';
import { ComponentClass, ComponentContext, ComponentDef, ContentRoot } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { FeatureDef } from '../feature-def';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowDomSupport } from './shadow-dom-support.feature';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * Component class decorator that attaches shadow root to decorated component instance.
 *
 * @param init Shadow root initialization options. Uses `mode: 'open'` by default.
 *
 * @return Component class decorator.
 */
export function AttachShadow<T extends ComponentClass<any> = any>(
    init: ShadowRootInit = { mode: 'open' }): TypedClassDecorator<T> {
  return (type: T) => {
    FeatureDef.define(type, { needs: [ShadowDomSupport] });
    ComponentDef.define(
        type,
        {
          define(this: ComponentClass<InstanceType<T>>, context: DefinitionContext<InstanceType<T>>) {
            // Attach shadow root eagerly when component is ready.
            context.onComponent(ctx =>
                ctx.whenReady(() =>
                    ctx.get(ShadowContentRoot)));
          },
          perComponent: [
            {
              a: ShadowContentRoot,
              by(ctx: ComponentContext<InstanceType<T>>) {
                return ctx.get(ShadowRootBuilder)(ctx, init);
              },
            },
            { // Content root is an alias of shadow root.
              a: ContentRoot,
              by(shadowRoot: ShadowContentRoot) {
                return shadowRoot;
              },
              with: [ShadowContentRoot],
            },
          ],
        });
  };
}
