import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { ComponentContext } from '../../component';

/**
 * Component shadow content root.
 *
 * @category Feature
 */
export type ShadowContentRoot = ShadowRoot;

/**
 * Component context entry containing a shadow content root instance.
 *
 * This is only available when the component is decorated with {@link AttachShadow @AttachShadow} decorator.
 *
 * @category Feature
 */
export const ShadowContentRoot: CxEntry<ShadowContentRoot> = {
  perContext: (/*#__PURE__*/ cxScoped(
      ComponentContext,
      (/*#__PURE__*/ cxSingle()),
  )),
};
