import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRendererExecution } from './component-renderer-execution';
import { RenderDef } from './render-def';

/**
 * Creates a {@link ComponentRenderer component renderer} method decorator.
 *
 * Enables rendering with {@link ComponentRenderCtl.renderBy component render control}.
 *
 * The decorated method accepts a {@link ComponentRendererExecution component rendering context} as its only parameter.
 *
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param def - Non-mandatory render definition.
 *
 * @returns Component method decorator.
 */
export function Render<TClass extends ComponentClass>(
    def?: RenderDef,
): ComponentPropertyDecorator<(execution: ComponentRendererExecution) => void, TClass> {
  return ComponentProperty(({ get }) => ({
    componentDef: {
      define(defContext) {
        defContext.whenComponent(context => {
          context.whenReady(() => {

            const { component } = context;
            const renderer = get(component).bind(component);

            context.get(ComponentRenderCtl).renderBy(renderer, def);
          });
        });
      },
    },
  }));
}
