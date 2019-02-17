import { AIterable, overArray } from 'a-iterable';
import { ContextKey, SingleContextKey } from 'context-values';
import { DomEventDispatcher, noEventInterest } from 'fun-events';
import { ComponentMount } from '../../component';
import { BootstrapContext, BootstrapRoot, BootstrapWindow, ElementAdapter } from '../../kit';
import { ShadowDomEvent } from '../shadow-dom';

const SHADOW_CONNECT_TRACKER = /*#__PURE__*/ Symbol('shadow-connect-tracker');
const KEY = /*#__PURE__*/ new SingleContextKey<ConnectTracker>('connect-tracker');

/**
 * @internal
 */
export class ConnectTracker {

  static get key(): ContextKey<ConnectTracker> {
    return KEY;
  }

  private readonly _adapter: ElementAdapter;
  private _interest = noEventInterest();
  private _observer!: MutationObserver;

  constructor(private readonly _context: BootstrapContext) {
    this._adapter = _context.get(ElementAdapter);
  }

  track(root: Node = this._context.get(BootstrapRoot)) {
    this._interest = new DomEventDispatcher(root)
        .on<ShadowDomEvent>('wesib:shadowAttached')(event => this._trackShadow(event.shadowRoot));

    const Observer: typeof MutationObserver = (this._context.get(BootstrapWindow) as any).MutationObserver;
    const observer = this._observer = new Observer(records => this._update(records));

    observer.observe(root, { childList: true, subtree: true });
  }

  private _update(records: MutationRecord[]) {
    records.forEach(record => {
      AIterable.from(overArray(record.removedNodes))
          .filter<Element>(isElement)
          .map(element => {
            this._untrackNested(element);
            return this._mountOf(element);
          })
          .filter<ComponentMount>(isPresent)
          .forEach(mount => {
            mount.connected = false;
          });
      AIterable.from(overArray(record.addedNodes))
          .filter<Element>(isElement)
          .map(element => {
            this._trackNested(element);
            return this._mountOf(element);
          })
          .filter<ComponentMount>(isPresent)
          .forEach(mount => {
            mount.connected = true;
          });
    });
  }

  private _mountOf(element: Element): ComponentMount | undefined {

    const context = this._adapter(element);

    return context && context.mount;
  }

  private _trackNested(element: Element) {

    const shadowRoot = element.shadowRoot;

    if (shadowRoot) {
      this._trackShadow(shadowRoot);
    }
  }

  private _trackShadow(shadowRoot: ShadowRoot) {
    if ((shadowRoot as any)[SHADOW_CONNECT_TRACKER]) {
      // Already tracked
      return;
    }

    const shadowTracker = new ConnectTracker(this._context);

    (shadowRoot as any)[SHADOW_CONNECT_TRACKER] = shadowTracker;

    shadowTracker.track(shadowRoot);
  }

  private _untrackNested(element: Element) {

    const shadowRoot = element.shadowRoot;

    if (shadowRoot) {
      this._untrackShadow(shadowRoot);
    }
  }

  private _untrackShadow(shadowRoot: ShadowRoot) {

    const shadowTracker: ConnectTracker = (shadowRoot as any)[SHADOW_CONNECT_TRACKER];

    if (shadowTracker) {
      delete (shadowRoot as any)[SHADOW_CONNECT_TRACKER];
      shadowTracker._untrack();
    }
  }

  private _untrack() {
    this._observer.disconnect();
    this._interest.off();
    this._interest = noEventInterest();
  }

}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isPresent<T>(value: T | undefined): value is T {
  return value != null;
}
