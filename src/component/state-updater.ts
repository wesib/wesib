/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { noop, valueProvider } from '@proc7ts/call-thru';
import { ContextValueOpts, ContextValues } from '@proc7ts/context-values';
import { ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, EventKeeper, nextAfterEvent, statePath, StatePath } from '@proc7ts/fun-events';
import { mergeFunctions } from '../common';

/**
 * Component state updater signature.
 *
 * @category Core
 */
export type StateUpdater =
/**
 * @typeparam V  Updated value type
 * @param path  Updated state node path.
 * @param newValue  New value.
 * @param oldValue  Replaced value.
 */
    <V>(this: void, path: StatePath, newValue: V, oldValue: V) => void;

export namespace StateUpdater {

  /**
   * Normalized component state updater signature.
   *
   * Accepts normalized state path.
   */
  export type Normalized =
  /**
   * @typeparam V  Updated value type
   * @param path  Normalized path of updated state node.
   * @param newValue  New value.
   * @param oldValue  Replaced value.
   */
      <V>(this: void, path: StatePath.Normalized, newValue: V, oldValue: V) => void;

}

/**
 * @internal
 */
class StateUpdaterKey extends ContextUpKey<StateUpdater, StateUpdater.Normalized> {

  readonly upKey: ContextUpKey.UpKey<StateUpdater, StateUpdater.Normalized>;

  constructor() {
    super('state-updater');
    this.upKey = this.createUpKey(
        opts => opts.seed.keepThru(
            (...fns) => {
              if (fns.length) {

                const combined: StateUpdater.Normalized = fns.reduce(
                    (prev, fn) => mergeFunctions(fn, prev),
                    noop,
                );

                return (path, newValue, oldValue) => combined(statePath(path), newValue, oldValue);
              }

              const defaultProvider = valueProvider(afterThe(noop));

              return nextAfterEvent(opts.byDefault(defaultProvider) || defaultProvider());
            },
        ),
    );
  }

  grow<Ctx extends ContextValues>(
      opts: ContextValueOpts<
          Ctx,
          StateUpdater,
          EventKeeper<StateUpdater.Normalized[]> | StateUpdater.Normalized,
          AfterEvent<StateUpdater.Normalized[]>>,
      ): StateUpdater {

    let delegated: StateUpdater;

    opts.context.get(
        this.upKey,
        'or' in opts ? { or: opts.or != null ? afterThe(opts.or) : opts.or } : undefined,
    )!.to(
        fn => delegated = fn,
    ).whenOff(
        () => delegated = noop,
    );

    return (path, newValue, oldValue) => delegated(path, newValue, oldValue);
  }

}

/**
 * A key of component context value containing a component {@link StateUpdater state updater} function.
 *
 * Features are calling this function by default when component state changes, e.g. attribute value or DOM property
 * modified.
 *
 * Note that this value is not provided, unless a {@link StateSupport state support} enabled.
 *
 * When multiple state updaters provided, they all will be called on each state update, in reverse order.
 *
 * Does nothing after component destruction.
 *
 * @category Core
 */
export const StateUpdater: ContextUpRef<StateUpdater, StateUpdater.Normalized> = (/*#__PURE__*/ new StateUpdaterKey());
