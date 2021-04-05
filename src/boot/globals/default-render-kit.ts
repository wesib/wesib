import { nodeDocument } from '@frontmeans/dom-primitives';
import { DrekContext, drekContextOf } from '@frontmeans/drek';
import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';
import { DefaultRenderScheduler } from './default-render-scheduler';

/**
 * A render kit used by default.
 *
 * @category Core
 */
export interface DefaultRenderKit {

  /**
   * Obtains a rendering context of the given node.
   *
   * Does the same as `drekContextOf()` function, and also makes sure that the rendering context for the document
   * is initialized with {@link DefaultRenderScheduler} and {@link DefaultNamespaceAliaser}.
   *
   * @param node - Target node.
   *
   * @returns Target node rendering context.
   */
  contextOf(node: Node): DrekContext;

}

/**
 * A key of bootstrap context value containing {@link DefaultRenderKit} instance.
 *
 * @category Core
 */
export const DefaultRenderKit: ContextRef<DefaultRenderKit> = (
    /*#__PURE__*/ new SingleContextKey<DefaultRenderKit>(
        'default-render-kit',
        {
          byDefault: bootstrapDefault(DefaultRenderKit$new),
        },
    )
);

function DefaultRenderKit$new(bsContext: BootstrapContext): DefaultRenderKit {

  const docs = new WeakMap<Document, 1>();
  const initDoc = (doc: Document): void => {
    if (!docs.get(doc)) {
      docs.set(doc, 1);
      drekContextOf(doc).update({
        nsAlias: bsContext.get(DefaultNamespaceAliaser),
        scheduler: bsContext.get(DefaultRenderScheduler),
      });
    }
  };

  return {
    contextOf(node: Node): DrekContext {
      initDoc(nodeDocument(node));
      return drekContextOf(node);
    },
  };
}
