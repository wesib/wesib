import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentContext__key } from './component-context.key';
import { ContentRoot } from './content-root';

/**
 * @internal
 */
export const ContentRoot__key: ContextKey<ContentRoot> = new SingleContextKey(
    'content-root',
    ctx => ctx.get(ComponentContext__key).element);
