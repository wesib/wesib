/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextValueSlot } from '@proc7ts/context-values';
import { contextDestroyed, ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, digAfter, EventKeeper } from '@proc7ts/fun-events';
import { ComponentContext, ComponentContextHolder } from '../../component';

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
 * @param element - Target raw element to adapt.
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
        slot => slot.insert(slot.seed.do(digAfter((...adapters) => {

          const combined: ElementAdapter = adapters.reduce(
              (prev, adapter) => element => prev(element) || adapter(element),
              defaultElementAdapter,
          );

          if (combined !== defaultElementAdapter) {
            return afterThe(combined);
          }
          if (slot.hasFallback && slot.or) {
            return slot.or;
          }

          return afterThe(defaultElementAdapter);
        }))),
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
    )!(
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
function defaultElementAdapter(element: ComponentContextHolder): ComponentContext | undefined {
  return ComponentContext.findIn(element);
}

/**
 * A key of bootstrap context value containing combined {@link ElementAdapter} instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextUpRef<ElementAdapter, ElementAdapter> = (/*#__PURE__*/ new ElementAdapterKey());
