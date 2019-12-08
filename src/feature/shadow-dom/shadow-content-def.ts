/**
 * @module @wesib/wesib
 */
import { ComponentContext, ComponentDef, ContentRoot } from '../../component';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowDomSupport } from './shadow-dom-support.feature';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * Shadow content root definition.
 *
 * This is a readonly component shadow root initialization options.
 *
 * @category Feature
 */
export type ShadowContentDef = Readonly<ShadowRootInit>;

const defaultShadowContentDef: ShadowContentDef = { mode: 'open' };

/**
 * @category Feature
 */
export const ShadowContentDef = {

  /**
   * Creates component definition for the given shadow content root definition.
   *
   * The returned component definition enables [[ShadowDomSupport]] feature and attaches shadow content root to the
   * component.
   *
   * @typeparam T  A type of component.
   * @param def  Shadow content root definition. Uses `mode: 'open'` by default.
   *
   * @returns Component definition.
   */
  componentDef<T extends object>(def: ShadowContentDef = defaultShadowContentDef): ComponentDef<T> {
    return {
      setup(setup) {
        setup.perComponent(
            {
              a: ShadowContentRoot,
              by(ctx: ComponentContext<T>) {
                return ctx.get(ShadowRootBuilder)(ctx, def);
              },
            },
        );
        setup.perComponent({ // Content root is an alias of shadow root when present.
          a: ContentRoot,
          by(context: ComponentContext<T>) {
            return context.get(ShadowContentRoot, { or: null });
          },
        });
      },
      feature: { needs: ShadowDomSupport },
    };
  },

};
