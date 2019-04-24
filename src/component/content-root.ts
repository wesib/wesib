import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { ComponentContext__key } from './component-context.key';

/**
 * Component content root node.
 */
export type ContentRoot = ParentNode;

/**
 * A key of component context value containing a component root element.
 *
 * This is an element itself by default. But can be overridden e.g. by `@AttachShadow` decorator.
 */
export const ContentRoot: ContextTarget<ContentRoot> & ContextRequest<ContentRoot> =
    /*#__PURE__*/ new SingleContextKey<ContentRoot>(
        'content-root',
        ctx => ctx.get(ComponentContext__key).element);
