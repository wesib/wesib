/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
/**
 * An event related to element's shadow DOM.
 *
 * The following event types supported:
 * - `wesib:shadowAttached` is dispatched when a shadow root is attached to element.
 *   In particular, it is dispatched for components decorated with {@link AttachShadow @AttachShadow}.
 *   The event is dispatched when component is connected for the first time. I.e. when element is added to the document.
 *   This event bubbles and is not cancelable.
 *
 * @category Feature
 */
export class ShadowDomEvent extends Event {

  /**
   * Shadow root this event relates to.
   */
  get shadowRoot(): ShadowRoot {
    return (this.target as Element).shadowRoot as ShadowRoot;
  }

}
