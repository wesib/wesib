/**
 * Custom HTML element (DOM) attributes definition.
 *
 * This is a map containing attribute names as keys and their change callbacks as values.
 *
 * @param <T> A type of web component.
 */
export interface AttributesDef<T extends object = object> {
  [name: string]: AttributeChangedCallback<T>;
}

/**
 * Custom HTML element attribute change callback.
 *
 * This function is called whenever a new attribute value assigned.
 *
 * @param <T> A type of web component.
 * @param this Web component instance.
 * @param oldValue Previous attribute value, or `null` if there were no value assigned.
 * @param newValue New attribute value.
 */
export type AttributeChangedCallback<T extends object = object> = (this: T, oldValue: string, newValue: string) => void;

export namespace AttributesDef {

  /**
   * A key of a property holding a attributes definition within web component's class constructor.
   */
  export const symbol = Symbol('web-component-attributes');

}
