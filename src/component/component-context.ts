/**
 * Web component context.
 *
 * Passed to component constructor as its only parameter.
 *
 * @param <E> A type of HTML element.
 */
export interface ComponentContext<E extends HTMLElement> {

  /**
   * Custom HTML element constructed for the component according to its type.
   */
  readonly element: E;

  /**
   * Returns a `super` property value inherited from custom HTML element parent.
   *
   * @param name Target property name.
   */
  elementSuper(name: string): any;

}
