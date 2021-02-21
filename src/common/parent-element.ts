import { ComponentElement } from '../component';
import { isElement } from './is-element';

/**
 * Finds parent element of the given one.
 *
 * Crosses shadow DOM bounds.
 *
 * @param element - Target element.
 *
 * @returns Either parent element of the given one, or `null` when not found.
 */
export function parentElement(element: ComponentElement): ComponentElement | null {

  const { parentNode } = element;

  return parentNode && isElement(parentNode) && parentNode
      || (element.getRootNode() as ShadowRoot).host as ComponentElement | undefined
      || null;// Inside shadow DOM?
}
