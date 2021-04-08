import { DrekCharger } from '@frontmeans/drek';
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';
import { ComponentRenderCtl } from './component-render-ctl';
import { RenderDef } from './render-def';

export type PreRenderDef =
    | PreRenderDef.Spec
    | PreRenderDef.Provider;

export namespace PreRenderDef {

  export interface Spec extends RenderDef.Spec {

    readonly charge?: DrekCharger.Spec;

  }

  export type Provider = RenderDef.Provider<Spec>;

}

export function PreRender<TClass extends ComponentClass>(
    def: PreRenderDef = {},
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
