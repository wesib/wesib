/**
 * @module @wesib/wesib
 */
/**
 * An event related to element's shadow DOM.
 *
 * The following event types supported:
 * - `wesib:shadowAttached` is thrown when a shadow root is attached to element.
 *   In particular, it is thrown for components decorated with `@AttachShadow()`.
 *   This event bubbles and is not cancelable.
 */
export class ShadowDomEvent extends Event {

  /**
   * Constructs shadow DOM event.
   *
   * @param type  Event type.
   * @param eventInitDict  Event initialization dictionary.
   */
  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
  }

  /**
   * Shadow root this event relates to.
   */
  get shadowRoot(): ShadowRoot {
    return (this.target as Element).shadowRoot as ShadowRoot;
  }

}
