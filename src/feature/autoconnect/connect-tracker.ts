import { AIterable, overArray } from 'a-iterable';
import { ContextKey, SingleContextKey } from 'context-values';
import { ComponentMount } from '../../component';
import { BootstrapContext, BootstrapRoot, BootstrapWindow, ElementAdapter } from '../../kit';

/**
 * @internal
 */
export class ConnectTracker {

  static readonly key: ContextKey<ConnectTracker> = new SingleContextKey('connect-tracker');

  private readonly _adapter: ElementAdapter;

  constructor(private readonly _context: BootstrapContext) {
    this._adapter = _context.get(ElementAdapter);
  }

  track() {

    const root: Node = this._context.get(BootstrapRoot);
    const Observer: typeof MutationObserver = (this._context.get(BootstrapWindow) as any).MutationObserver;
    const observer = new Observer(records => this._update(records));

    observer.observe(root, { childList: true, subtree: true });
  }

  private _update(records: MutationRecord[]) {
    records.forEach(record => {
      AIterable.from(overArray(record.removedNodes))
          .map(node => this._mountOf(node))
          .filter<ComponentMount>(isPresent)
          .forEach(mount => {
            mount.connected = false;
          });
      AIterable.from(overArray(record.addedNodes))
          .map(node => this._mountOf(node))
          .filter<ComponentMount>(isPresent)
          .forEach(mount => {
            mount.connected = true;
          });
    });
  }

  private _mountOf(node: Node): ComponentMount | undefined {

    const context = this._adapter(node);

    return context && context.mount;
  }

}

function isPresent<T>(value: T | undefined): value is T {
  return value != null;
}
