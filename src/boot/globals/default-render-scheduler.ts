/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { newRenderSchedule, RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextValues, ContextValueSlot } from '@proc7ts/context-values';
import { contextDestroyed, ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, EventKeeper, nextAfterEvent } from '@proc7ts/fun-events';
import { BootstrapWindow } from './bootstrap-window';

/**
 * Default rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultRenderScheduler = RenderScheduler;

/**
 * @internal
 */
class DefaultRenderSchedulerKey extends ContextUpKey<DefaultRenderScheduler, RenderScheduler> {

  readonly upKey: ContextUpKey.UpKey<DefaultRenderScheduler, RenderScheduler>;

  constructor() {
    super('default-render-scheduler');
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.keepThru(
            (...fns) => {
              if (fns.length) {
                return toDefaultRenderScheduler(slot.context, fns[fns.length - 1]);
              }
              if (slot.hasFallback && slot.or) {
                return nextAfterEvent(slot.or);
              }
              return toDefaultRenderScheduler(slot.context, newRenderSchedule);
            },
        )),
    );
  }

  grow(
      slot: ContextValueSlot<
          DefaultRenderScheduler,
          EventKeeper<RenderScheduler[]> | RenderScheduler,
          AfterEvent<RenderScheduler[]>>,
  ): void {

    let delegated: DefaultRenderScheduler;

    slot.context.get(
        this.upKey,
        slot.hasFallback ? { or: slot.or != null ? afterThe(slot.or) : slot.or } : undefined,
    )!.to(
        scheduler => delegated = toDefaultRenderScheduler(slot.context, scheduler),
    ).whenOff(
        reason => delegated = contextDestroyed(reason),
    );

    slot.insert((...args) => delegated(...args));
  }

}

/**
 * @internal
 */
function toDefaultRenderScheduler(
    context: ContextValues,
    scheduler: RenderScheduler,
): DefaultRenderScheduler {
  return (options = {}) => scheduler({
    ...options,
    window: options.window || context.get(BootstrapWindow),
  });
}

/**
 * A key of bootstrap, definition, or component context value containing [[DefaultRenderScheduler]] instance.
 *
 * Uses the default `RenderScheduler` (`newRenderSchedule()`) for {@link BootstrapWindow bootstrap window}.
 *
 * @category Core
 */
export const DefaultRenderScheduler: ContextUpRef<DefaultRenderScheduler, RenderScheduler> = (
    /*#__PURE__*/ new DefaultRenderSchedulerKey()
);
