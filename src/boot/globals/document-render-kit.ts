import { nodeDocument } from '@frontmeans/dom-primitives';
import { DrekContext, drekContextOf } from '@frontmeans/drek';
import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';
import { DefaultRenderScheduler } from './default-render-scheduler';

/**
 * A document render kit instance.
 *
 * A [Drek] API accessor used by Wesib internally.
 *
 * [Drek]: https://www.npmjs.com/package/@frontmeans/drek
 *
 * @category Core
 */
export interface DocumentRenderKit {

  /**
   * Obtains a rendering context of the given DOM node.
   *
   * Does the same as `drekContextOf()` function, and also makes sure that the rendering context for the document
   * is initialized with {@link DefaultRenderScheduler} and {@link DefaultNamespaceAliaser}.
   *
   * @param node - Target DOM node.
   *
   * @returns Target node rendering context.
   */
  contextOf(node: Node): DrekContext;

}

/**
 * A key of bootstrap context value containing {@link DocumentRenderKit} instance.
 *
 * @category Core
 */
export const DocumentRenderKit: ContextRef<DocumentRenderKit> = (
    /*#__PURE__*/ new SingleContextKey<DocumentRenderKit>(
        'document-render-kit',
        {
          byDefault: bootstrapDefault(DocumentRenderKit$create),
        },
    )
);

function DocumentRenderKit$create(bsContext: BootstrapContext): DocumentRenderKit {

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
