import { filterIt, itsEach, overArray } from 'a-iterable';
import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { DomEventDispatcher, noEventSupply } from 'fun-events';
import { BootstrapContext } from '../../boot';
import { BootstrapRoot, ElementObserver } from '../../boot/globals';
import { isElement } from '../../common';
import { ShadowDomEvent } from '../shadow-dom';

const shadowConnectTracker__symbol = (/*#__PURE__*/ Symbol('shadow-connect-tracker'));
const ConnectTracker__key = (/*#__PURE__*/ new SingleContextKey<ConnectTracker>('connect-tracker'));

/**
 * @internal
 */
export class ConnectTracker {

  static get [ContextKey__symbol](): ContextKey<ConnectTracker> {
    return ConnectTracker__key;
  }

  private _supply = noEventSupply();
  private _observer!: ElementObserver;

  constructor(private readonly _context: BootstrapContext) {
  }

  track(root: Node = this._context.get(BootstrapRoot)) {

    const { _context } = this;

    this._supply = new DomEventDispatcher(root)
        .on<ShadowDomEvent>('wesib:shadowAttached')(event => trackShadow(event.shadowRoot));

    const newObserver = this._context.get(ElementObserver);
    const observer = this._observer = newObserver(records => updateConnections(records));

    observer.observe(root, { subtree: true });

    function updateConnections(records: MutationRecord[]) {
      records.forEach(record => {
        itsEach(
            filterIt<Node, Element>(
                overArray(record.removedNodes),
                isElement,
            ),
            untrackNested,
        );
        itsEach(
            filterIt<Node, Element>(
                overArray(record.addedNodes),
                isElement,
            ),
            trackNested,
        );
      });
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
    this._supply.off();
    this._supply = noEventSupply();
  }

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
