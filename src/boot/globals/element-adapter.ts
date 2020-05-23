/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextValueSlot } from '@proc7ts/context-values';
import { contextDestroyed, ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, EventKeeper, nextAfterEvent } from '@proc7ts/fun-events';
import { ComponentContext, ComponentContext__symbol } from '../../component';

/**
 * Element adapter is a function able to convert a raw element to component. E.g. mount a component to it.
 *
 * Features may use it internally. E.g. an `AutoConnectSupport` applies it to each added DOM element.
 *
 * Multiple element adapters can be registered in bootstrap context.
 *
 * @category Core
 */
export type ElementAdapter =
/**
 * @param element  Target raw element to adapt.
 *
 * @returns An adapted component's context, or `undefined` if element can not be adapted.
 */
    (this: void, element: any) => ComponentContext | undefined;

/**
 * @internal
 */
class ElementAdapterKey extends ContextUpKey<ElementAdapter, ElementAdapter> {

  readonly upKey: ContextUpKey.UpKey<ElementAdapter, ElementAdapter>;

  constructor() {
    super('element-adapter');
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.keepThru((...adapters) => {

          const combined: ElementAdapter = adapters.reduce(
              (prev, adapter) => element => prev(element) || adapter(element),
              defaultElementAdapter,
          );

          if (combined !== defaultElementAdapter) {
            return combined;
          }
          if (slot.hasFallback && slot.or) {
            return nextAfterEvent(slot.or);
          }

          return defaultElementAdapter;
        })),
    );
  }

  grow(
      slot: ContextValueSlot<
          ElementAdapter,
          EventKeeper<ElementAdapter[]> | ElementAdapter,
          AfterEvent<ElementAdapter[]>>,
  ): void {

    let delegated: ElementAdapter;

    slot.context.get(
        this.upKey,
        slot.hasFallback ? { or: slot.or != null ? afterThe(slot.or) : slot.or } : undefined,
    )!.to(
        adapter => delegated = adapter,
    ).whenOff(
        reason => delegated = contextDestroyed(reason),
    );

    slot.insert(element => delegated(element));
  }

}

/**
 * @internal
 */
function defaultElementAdapter(element: any): ComponentContext | undefined {
  return element[ComponentContext__symbol] as ComponentContext | undefined;
}

/**
 * A key of bootstrap context value containing combined [[ElementAdapter]] instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextUpRef<ElementAdapter, ElementAdapter> = (/*#__PURE__*/ new ElementAdapterKey());
