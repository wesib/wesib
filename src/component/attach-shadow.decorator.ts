import { TypedClassDecorator } from '../common';
import { ComponentClass } from './component';
import { ComponentContext } from './component-context';
import { ComponentDef } from './component-def';
import { DefinitionContext } from './definition';

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
    ComponentDef.define(
        type,
        {
          define(this: ComponentClass<InstanceType<T>>, context: DefinitionContext<InstanceType<T>>) {
            context.forComponents(
                ComponentContext.shadowRootKey,
                ctx => {

                  const element: HTMLElement = ctx.element;

                  return element.attachShadow(init);
                });

            // Content root is an alias of shadow root.
            context.forComponents(ComponentContext.contentRootKey, ctx => ctx.get(ComponentContext.shadowRootKey));

            // Attach shadow root eagerly on element instantiation.
            context.onComponent(ctx => ctx.get(ComponentContext.shadowRootKey));
          }
        });
  };
}
