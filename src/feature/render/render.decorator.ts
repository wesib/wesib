import { RenderExecution } from '@frontmeans/render-scheduler';
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRenderer } from './component-renderer';
import { RenderDef } from './render-def';

/**
 * Component property decorator that declares a rendering method for the component.
 *
 * The decorated method call will be scheduled by {@link DefaultRenderScheduler} once component state updated.
 *
 * The decorated method should have no arguments. It may return either nothing, or a function. In the latter case the
 * returned function will be called immediately to render the component. It may, in turn, return a renderer function,
 * and so on.
 *
 * Enables rendering with {@link ComponentRenderCtl.renderBy component render control}.
 *
 * @category Feature
 * @typeParam TClass - A type of decorated component class.
 * @param def - Non-mandatory render definition.
 *
 * @returns Component method decorator.
 */
export function Render<TClass extends ComponentClass>(
    def?: RenderDef,
): ComponentPropertyDecorator<(execution: RenderExecution) => ComponentRenderer | void, TClass> {
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
