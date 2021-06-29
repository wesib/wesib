import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { CxEntry, cxSingle } from '@proc7ts/context-values';

/**
 * Namespace aliaser used by default.
 *
 * Maps namespaces to their unique aliases.
 *
 * @category Core
 */
export type DefaultNamespaceAliaser = NamespaceAliaser;

/**
 * Bootstrap context entry containing the default namespace aliaser as its value.
 *
 * @category Core
 */
export const DefaultNamespaceAliaser: CxEntry<DefaultNamespaceAliaser> = {
  perContext: (/*#__PURE__*/ cxSingle()),
};
