import { AeComponentMember, AeComponentMemberTarget, ComponentMember, ComponentMemberAmendment } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentRenderCtl } from './component-render-ctl';
import { RenderDef } from './render-def';

/**
 * Creates a {@link ComponentPreRenderer component pre-renderer} method amendment (and decorator).
 *
 * Enables pre-rendering with {@link ComponentRenderCtl.preRenderBy component render control}.
 *
 * The decorated method accepts a {@link ComponentPreRendererExecution component rendering context} as its only
 * parameter.
 *
 * @category Feature
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component member entity type.
 * @param def - Non-mandatory render definition.
 *
 * @returns New component method amendment.
 */
export function PreRender<
    TClass extends ComponentClass,
    TAmended extends AeComponentMember<RenderDef.PreMethod, TClass> = AeComponentMember<RenderDef.PreMethod, TClass>,
    >(
    def?: RenderDef,
): ComponentMemberAmendment<RenderDef.PreMethod, TClass, RenderDef.PreMethod, TAmended> {
  return ComponentMember<
      RenderDef.PreMethod,
      TClass,
      RenderDef.PreMethod,
      TAmended>((
      { get, amend }: AeComponentMemberTarget<RenderDef.PreMethod, TClass>,
  ) => amend({
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
