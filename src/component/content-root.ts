/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { ComponentContext__key } from './component-context.key.impl';

/**
 * Component content root node.
 *
 * @category Core
 */
export type ContentRoot = ParentNode;

/**
 * A key of component context value containing a component root element.
 *
 * This is an element itself by default. But can be overridden e.g. by `@AttachShadow` decorator.
 *
 * @category Core
 */
export const ContentRoot: ContextTarget<ContentRoot> & ContextRequest<ContentRoot> =
    /*#__PURE__*/ new SingleContextKey<ContentRoot>(
        'content-root',
        ctx => ctx.get(ComponentContext__key).element);
