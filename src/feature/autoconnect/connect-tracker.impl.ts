import { AIterable, overArray } from 'a-iterable';
import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { DomEventDispatcher, noEventInterest } from 'fun-events';
import { ComponentMount } from '../../component';
import { BootstrapContext } from '../../kit';
import { BootstrapRoot, BootstrapWindow, ElementAdapter } from '../../kit/globals';
import { ShadowDomEvent } from '../shadow-dom';

const shadowConnectTracker__symbol = /*#__PURE__*/ Symbol('shadow-connect-tracker');
const ConnectTracker__key = /*#__PURE__*/ new SingleContextKey<ConnectTracker>('connect-tracker');

/**
 * @internal
 */
export class ConnectTracker {

  static get [ContextKey__symbol](): ContextKey<ConnectTracker> {
    return ConnectTracker__key;
  }

  private _interest = noEventInterest();
  private _observer!: MutationObserver;

  constructor(private readonly _context: BootstrapContext) {
  }

  track(root: Node = this._context.get(BootstrapRoot)) {

    const { _context } = this;
    const adapter = _context.get(ElementAdapter);

    this._interest = new DomEventDispatcher(root)
        .on<ShadowDomEvent>('wesib:shadowAttached')(event => trackShadow(event.shadowRoot));

    const Observer: typeof MutationObserver = (this._context.get(BootstrapWindow) as any).MutationObserver;
    const observer = this._observer = new Observer(records => updateConnections(records));

    observer.observe(root, { childList: true, subtree: true });

    function updateConnections(records: MutationRecord[]) {
      records.forEach(record => {
        AIterable.from(overArray(record.removedNodes))
            .filter<Element>(isElement)
            .map(element => {
              untrackNested(element);
              return mountOf(element);
            })
            .filter<ComponentMount>(isPresent)
            .forEach(mount => {
              mount.connected = false;
            });
        AIterable.from(overArray(record.addedNodes))
            .filter<Element>(isElement)
            .map(element => {
              trackNested(element);
              return mountOf(element);
            })
            .filter<ComponentMount>(isPresent)
            .forEach(mount => {
              mount.connected = true;
            });
      });
    }

    function mountOf(element: Element): ComponentMount | undefined {

      const context = adapter(element);

      return context && context.mount;
    }

    function trackNested(element: Element) {

      const shadowRoot = element.shadowRoot;

      if (shadowRoot) {
        trackShadow(shadowRoot);
      }
    }

    function trackShadow(shadowRoot: ShadowRoot) {
      if ((shadowRoot as any)[shadowConnectTracker__symbol]) {
        // Already tracked
        return;
      }

      const shadowTracker = new ConnectTracker(_context);

      (shadowRoot as any)[shadowConnectTracker__symbol] = shadowTracker;

      shadowTracker.track(shadowRoot);
    }
  }

  _untrack() {
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

function untrackNested(element: Element) {

  const shadowRoot = element.shadowRoot;

  if (shadowRoot) {
    untrackShadow(shadowRoot);
  }
}

function untrackShadow(shadowRoot: ShadowRoot) {

  const shadowTracker: ConnectTracker = (shadowRoot as any)[shadowConnectTracker__symbol];

  if (shadowTracker) {
    delete (shadowRoot as any)[shadowConnectTracker__symbol];
    shadowTracker._untrack();
  }
}
