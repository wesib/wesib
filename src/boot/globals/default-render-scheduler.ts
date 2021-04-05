import { newRenderSchedule, RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextValues, ContextValueSlot } from '@proc7ts/context-values';
import { ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, digAfter } from '@proc7ts/fun-events';
import { BootstrapContext } from '../bootstrap-context';
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
        slot => slot.insert(slot.seed.do(digAfter(
            (...fns) => {
              if (fns.length) {
                return afterThe(toDefaultRenderScheduler(slot.context, fns[fns.length - 1]));
              }
              if (slot.hasFallback && slot.or) {
                return slot.or;
              }
              return afterThe(toDefaultRenderScheduler(slot.context, newRenderSchedule));
            },
        ))),
    );
  }

  grow(
      slot: ContextValueSlot<
          DefaultRenderScheduler,
          ContextUpKey.Source<RenderScheduler>,
          AfterEvent<RenderScheduler[]>>,
  ): void {

    const { context } = slot;
    const bsContext = context.get(BootstrapContext);

    if (context !== bsContext) {
      return slot.insert(bsContext.get(this, slot.hasFallback ? slot : undefined));
    }

    let delegated: DefaultRenderScheduler;

    context.get(
        this.upKey,
        slot.hasFallback ? { or: slot.or != null ? afterThe(slot.or) : slot.or } : undefined,
    )!(
        scheduler => delegated = toDefaultRenderScheduler(context, scheduler),
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
 * A key of bootstrap context value containing {@link DefaultRenderScheduler} instance.
 *
 * Uses the default `RenderScheduler` (`newRenderSchedule()`) for {@link BootstrapWindow bootstrap window}.
 *
 * @category Core
 */
export const DefaultRenderScheduler: ContextUpRef<DefaultRenderScheduler, RenderScheduler> = (
    /*#__PURE__*/ new DefaultRenderSchedulerKey()
);
