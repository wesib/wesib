import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';
import { ComponentRenderCtl } from './component-render-ctl';
import { RenderDef } from './render-def';

/**
 * Creates a {@link ComponentPreRenderer component pre-renderer} method decorator.
 *
 * Enables pre-rendering with {@link ComponentRenderCtl.preRenderBy component render control}.
 *
 * The decorated method accepts a {@link ComponentPreRendererExecution component rendering context} as its only
 * parameter.
 *
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param def - Non-mandatory render definition.
 *
 * @returns Component method decorator.
 */
export function PreRender<TClass extends ComponentClass>(
    def: RenderDef = {},
): ComponentPropertyDecorator<(execution: ComponentPreRendererExecution) => void, TClass> {
  return ComponentProperty(({ get }) => ({
    componentDef: {
      define(defContext) {
        defContext.whenComponent(context => {
          context.whenReady(() => {

            const { component } = context;
            const preRenderer = get(component).bind(component);

            context.get(ComponentRenderCtl).preRenderBy(preRenderer, def);
          });
        });
      },
    },
  }));

}
