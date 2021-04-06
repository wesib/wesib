import { drekAppender, DrekCharger, drekCharger, DrekFragment, DrekFragmentRenderExecution } from '@frontmeans/drek';
import { asyncRenderScheduler, RenderExecution } from '@frontmeans/render-scheduler';
import { valueByRecipe } from '@proc7ts/primitives';
import { ComponentContext, ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ComponentRenderCtl } from './component-render-ctl';
import { ComponentRenderer } from './component-renderer';
import { RenderDef } from './render-def';

export type PreRenderExecution = DrekFragmentRenderExecution;

export type PreRenderDef =
    | PreRenderDef.Spec
    | PreRenderDef.Provider;

export namespace PreRenderDef {

  export interface Spec {

    readonly charge?: DrekCharger.Spec;

    readonly render?: RenderDef.Spec;

  }

  export type Provider = (this: void, context: ComponentContext) => Spec;

}

export function PreRender<TClass extends ComponentClass>(
    def: PreRenderDef = {},
): ComponentPropertyDecorator<(execution: PreRenderExecution) => ComponentRenderer<PreRenderExecution> | void, TClass> {
  return ComponentProperty(({ get }) => ({
    componentDef: {
      define(defContext) {
        defContext.whenComponent(context => {
          context.whenReady(() => {

            const spec = valueByRecipe(def, context);
            const { component } = context;
            const preRenderer = get(component).bind(component);

            context.get(ComponentRenderCtl).renderBy(
                execution => {

                  const charger = drekCharger(drekAppender(context.contentRoot), spec.charge);
                  let fragment = new DrekFragment(charger);
                  let renderer: ComponentRenderer;

                  const toRenderer = (
                      preRenderer: ComponentRenderer<PreRenderExecution>,
                  ): ComponentRenderer => (
                      _execution: RenderExecution,
                  ): ComponentRenderer | undefined => {
                    fragment.scheduler()(preExecution => {

                      const next = preRenderer(preExecution);

                      if (typeof next !== 'function' || next === preRenderer) {

                        const renderedFragment = fragment;

                        fragment = new DrekFragment(charger);
                        renderedFragment.render();
                      } else {
                        renderer = toRenderer(next);
                      }
                    });

                    return renderer;
                  };

                  renderer = toRenderer(preRenderer);

                  return renderer(execution);
                },
                RenderDef.fulfill(
                    { schedule: asyncRenderScheduler() },
                    spec.render,
                ),
            );
          });
        });
      },
    },
  }));

}
