import { CxEntry, cxSingle } from '@proc7ts/context-values';
import { ComponentContext } from './component-context';

/**
 * Component content root node.
 *
 * Either element itself, or its shadow root.
 *
 * @category Core
 */
export type ContentRoot = Element | ShadowRoot;

/**
 * Component context entry containing a component root element.
 *
 * This is an element itself by default. But can be overridden e.g. by {@link AttachShadow @AttachShadow} decorator.
 *
 * @category Core
 */
export const ContentRoot: CxEntry<ContentRoot> = {
  perContext: (/*#__PURE__*/ cxSingle({
    byDefault(target): ContentRoot {
      return target.get(ComponentContext).element as ContentRoot;
    },
  })),
  toString: () => '[ContentRoot]',
};
