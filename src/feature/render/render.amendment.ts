import { AeComponentMember, AeComponentMemberTarget, ComponentMember, ComponentMemberAmendment } from '../../component';
import { ComponentClass, DefinitionContext } from '../../component/definition';
import { ComponentRenderCtl } from './component-render-ctl';
import { RenderDef } from './render-def';

/**
 * Creates a {@link ComponentRenderer component renderer} method amendment (and decorator).
 *
 * Enables rendering with {@link ComponentRenderCtl.renderBy component render control}.
 *
 * The decorated method accepts a {@link ComponentRendererExecution component rendering context} as its only parameter.
 *
 * @category Feature
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component member entity type.
 * @param def - Non-mandatory render definition.
 *
 * @returns New component method amendment.
 */
export function Render<
    TClass extends ComponentClass,
    TAmended extends AeComponentMember<RenderDef.Method, TClass> = AeComponentMember<RenderDef.Method, TClass>,
    >(
    def?: RenderDef,
): ComponentMemberAmendment<RenderDef.Method, TClass, RenderDef.Method, TAmended> {
  return ComponentMember<
      RenderDef.Method,
      TClass,
      RenderDef.Method,
      TAmended>((
      { get, amend }: AeComponentMemberTarget<RenderDef.Method, TClass>,
  ) => amend({
    componentDef: {
      define(defContext: DefinitionContext<InstanceType<TClass>>) {
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
