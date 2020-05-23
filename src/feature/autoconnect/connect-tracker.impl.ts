import { filterIt, itsEach, overArray } from '@proc7ts/a-iterable';
import { ContextKey, ContextKey__symbol, SingleContextKey } from '@proc7ts/context-values';
import { noEventSupply } from '@proc7ts/fun-events';
import { DomEventDispatcher } from '@proc7ts/fun-events/dom';
import { BootstrapContext } from '../../boot';
import { BootstrapRoot, ElementObserver } from '../../boot/globals';
import { isElement } from '../../common';
import { ShadowDomEvent } from '../shadow-dom';

const ShadowConnectTracker__symbol = (/*#__PURE__*/ Symbol('shadow-connect-tracker'));

interface TrackedShadowRoot extends ShadowRoot {
  [ShadowConnectTracker__symbol]?: ConnectTracker;
}

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

  track(root: Node = this._context.get(BootstrapRoot) as Node): void {

    const context = this._context;

    this._supply = new DomEventDispatcher(root)
        .on<ShadowDomEvent>('wesib:shadowAttached')
        .to(event => trackShadow(event.shadowRoot));

    const newObserver = this._context.get(ElementObserver);
    const observer = this._observer = newObserver(records => updateConnections(records));

    observer.observe(root, { subtree: true });

    function updateConnections(records: MutationRecord[]): void {
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

    function trackNested(element: Element): void {

      const shadowRoot = element.shadowRoot;

      if (shadowRoot) {
        trackShadow(shadowRoot);
      }
    }

    function trackShadow(shadowRoot: TrackedShadowRoot): void {
      if (shadowRoot[ShadowConnectTracker__symbol]) {
        // Already tracked
        return;
      }

      const shadowTracker = new ConnectTracker(context);

      shadowRoot[ShadowConnectTracker__symbol] = shadowTracker;

      shadowTracker.track(shadowRoot);
    }
  }

  _untrack(): void {
    this._observer.disconnect();
    this._supply.off();
    this._supply = noEventSupply();
  }

}

function untrackNested(element: Element): void {

  const shadowRoot = element.shadowRoot;

  if (shadowRoot) {
    untrackShadow(shadowRoot);
  }
}

function untrackShadow(shadowRoot: TrackedShadowRoot): void {

  const shadowTracker = shadowRoot[ShadowConnectTracker__symbol];

  if (shadowTracker) {
    delete shadowRoot[ShadowConnectTracker__symbol];
    shadowTracker._untrack();
  }
}
