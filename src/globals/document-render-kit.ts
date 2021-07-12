import { nodeDocument } from '@frontmeans/dom-primitives';
import { DrekContext, drekContextOf } from '@frontmeans/drek';
import { NamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { cxDefaultScoped, CxEntry, cxSingle } from '@proc7ts/context-values';
import { BootstrapContext } from '../boot';
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
   * is initialized with {@link DefaultRenderScheduler} and `NamespaceAliaser`.
   *
   * @param node - Target DOM node.
   *
   * @returns Target node rendering context.
   */
  contextOf(node: Node): DrekContext;

}

/**
 * Bootstrap context entry containing {@link DocumentRenderKit} instance.
 *
 * @category Core
 */
export const DocumentRenderKit: CxEntry<DocumentRenderKit> = {
  perContext: (/*#__PURE__*/ cxDefaultScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: DocumentRenderKit$byDefault,
      })),
  )),
  toString: () => '[DocumentRenderKit]',
};

function DocumentRenderKit$byDefault(target: CxEntry.Target<DocumentRenderKit>): DocumentRenderKit {

  const docs = new WeakMap<Document, 1>();
  const initDoc = (doc: Document): void => {
    if (!docs.get(doc)) {
      docs.set(doc, 1);
      drekContextOf(doc).update({
        nsAlias: target.get(NamespaceAliaser),
        scheduler: target.get(DefaultRenderScheduler),
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
