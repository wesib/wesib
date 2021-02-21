import { ComponentElement } from '../component';

/**
 * Checks whether the given DOM node is element.
 *
 * @category Utility
 * @param node - A DOM node to check.
 *
 * @returns `true` is `node` is element, or `false` otherwise.
 */
export function isElement(node: Node): node is ComponentElement {
  return node.nodeType === Node.ELEMENT_NODE;
}
