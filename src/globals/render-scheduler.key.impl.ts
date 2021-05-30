import { RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextValues, ContextValueSlot } from '@proc7ts/context-values';
import { ContextUpKey } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, digAfter } from '@proc7ts/fun-events';
import { BootstrapContext } from '../boot';
import { BootstrapWindow } from './bootstrap-window';

/**
 * @internal
 */
export class RenderScheduler$Key extends ContextUpKey<RenderScheduler, RenderScheduler> {

  readonly upKey: ContextUpKey.UpKey<RenderScheduler, RenderScheduler>;

  constructor(name: string, byDefault: RenderScheduler) {
    super(name);
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.do(digAfter(
            (...fns) => {
              if (fns.length) {
                return afterThe(RenderScheduler$adopt(slot.context, fns[fns.length - 1]));
              }
              if (slot.hasFallback && slot.or) {
                return slot.or;
              }
              return afterThe(RenderScheduler$adopt(slot.context, byDefault));
            },
        ))),
    );
  }

  grow(
      slot: ContextValueSlot<
          RenderScheduler,
          ContextUpKey.Source<RenderScheduler>,
          AfterEvent<RenderScheduler[]>>,
  ): void {

    const { context } = slot;
    const bsContext = context.get(BootstrapContext);

    if (context !== bsContext) {
      return slot.insert(bsContext.get(this, slot.hasFallback ? slot : undefined));
    }

    let delegated: RenderScheduler;

    context.get(
        this.upKey,
        slot.hasFallback ? { or: slot.or != null ? afterThe(slot.or) : slot.or } : undefined,
    )!(
        scheduler => delegated = RenderScheduler$adopt(context, scheduler),
    );

    slot.insert((...args) => delegated(...args));
  }

}

function RenderScheduler$adopt(context: ContextValues, scheduler: RenderScheduler): RenderScheduler {
  return (options = {}) => scheduler({
    ...options,
    window: options.window || context.get(BootstrapWindow),
  });
}
