import { SingleContextKey, SingleContextRef } from '@proc7ts/context-values';
import { ComponentContext__key } from './component-context.key.impl';

/**
 * Component content root node.
 *
 * Either element itself, or its shadow root.
 *
 * @category Core
 */
export type ContentRoot = Element | ShadowRoot;

/**
 * A key of component context value containing a component root element.
 *
 * This is an element itself by default. But can be overridden e.g. by {@link AttachShadow @AttachShadow} decorator.
 *
 * @category Core
 */
export const ContentRoot: SingleContextRef<ContentRoot> = (/*#__PURE__*/ new SingleContextKey<ContentRoot>(
    'content-root',
    {
      byDefault(ctx): ContentRoot {
        return ctx.get(ComponentContext__key).element as ContentRoot;
      },
    },
));
