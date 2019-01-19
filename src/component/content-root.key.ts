import { ContextKey, SingleContextKey } from 'context-values';
import { componentContextKey } from './component-context.key';
import { ContentRoot } from './content-root';

/**
 * @internal
 */
export const contentRootKey: ContextKey<ContentRoot> = new SingleContextKey(
    'content-root',
    ctx => ctx.get(componentContextKey).element);
