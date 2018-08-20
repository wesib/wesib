export namespace Component {

  /**
   * A key of custom HTML element property holding a reference to web component instance.
   */
  export const symbol = Symbol('web-component');

  /**
   * Extracts a reference to the web component from custom HTML element
   *
   * @param <T> A type of web component.
   * @param element Target HTML element instance.
   *
   * @return Either a web component reference stored under `Component.symbol` key, or `undefined` if the given `element` is
   * not a custom element constructed for the web component.
   */
  export function of<T extends object>(element: HTMLElement): T | undefined {
    return (element as any)[symbol];
  }

}
