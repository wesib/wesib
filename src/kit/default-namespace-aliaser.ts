/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';
import { NamespaceAliaser } from 'namespace-aliaser';

/**
 * Namespace aliaser used by default.
 *
 * Maps namespaces to their unique aliases.
 *
 * @category Core
 */
export type DefaultNamespaceAliaser = NamespaceAliaser;

/**
 * A key of bootstrap context value containing the default namespace aliaser.
 *
 * @category Core
 */
export const DefaultNamespaceAliaser:
    ContextTarget<DefaultNamespaceAliaser> & ContextRequest<DefaultNamespaceAliaser> =
    /*#__PURE__*/ new SingleContextKey<DefaultNamespaceAliaser>('default-namespace-aliaser');