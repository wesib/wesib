import { cxBuildAsset } from '@proc7ts/context-builder';
import { Class } from '@proc7ts/primitives';
import { AeComponent, Component, ComponentAmendment, ComponentContext, ContentRoot } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * @internal
 */
const defaultShadowContentDef: ShadowContentDef = { mode: 'open' };

/**
 * Shadow content root definition.
 *
 * This is a readonly component shadow root initialization options.
 *
 * @category Feature
 */
export type ShadowContentDef = Readonly<ShadowRootInit>;

/**
 * Creates a component amendment (and decorator) that attaches shadow root to decorated component instance.
 *
 * @category Feature
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 * @param def - Shadow content root definition. Uses `mode: 'open'` by default.
 *
 * @returns New component amendment and decorator.
 */
export function AttachShadow<
    TClass extends ComponentClass = Class,
    TAmended extends AeComponent<TClass> = AeComponent<TClass>>(
    def: ShadowContentDef = defaultShadowContentDef,
): ComponentAmendment<TClass, TAmended> {
  return Component({
    setup(setup) {
      setup.perComponent(cxBuildAsset(
          ShadowContentRoot,
          target => target.get(ShadowRootBuilder)(target.get(ComponentContext), def),
      ));
      setup.perComponent(cxBuildAsset( // Content root is an alias of shadow root when present.
        ContentRoot,
        target => target.get(ShadowContentRoot, { or: null }),
      ));
    },
  });
}
