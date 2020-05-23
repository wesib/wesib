/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from './classes';

/**
 * Custom element.
 *
 * @category Utility
 */
export interface CustomElement extends Element {

  attributeChangedCallback?(
      name: string,
      oldValue: string | null,
      newValue: string | null
  ): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;

}

/**
 * Custom element constructor signature.
 *
 * @category Utility
 */
export interface CustomElementClass<T extends CustomElement = CustomElement> extends Class<T> {
  observedAttributes: readonly string[] | undefined;
  new(): T;
}
