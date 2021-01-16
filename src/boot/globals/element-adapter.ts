/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { html__naming, QualifiedName } from '@frontmeans/namespace-aliaser';
import { ContextValueSlot } from '@proc7ts/context-values';
import { contextDestroyed, ContextUpKey, ContextUpRef } from '@proc7ts/context-values/updatable';
import { AfterEvent, afterThe, digAfter, EventKeeper } from '@proc7ts/fun-events';
import { ComponentContext, ComponentElement, ComponentSlot__symbol } from '../../component';
import { DefaultNamespaceAliaser } from './default-namespace-aliaser';

/**
 * Element adapter is a function able to bind a component to element. E.g. to mount a component to it.
 *
 * Features may use it internally. E.g. an `AutoConnectSupport` applies it to each added DOM element.
 *
 * An element adapter is formed out of {@link ComponentBinder component binders} registered in bootstrap context.
 *
 * @category Core
 */
export type ElementAdapter =
/**
 * @param element - Target element to adapt.
 *
 * @returns Either a bound component's context, or `undefined` if element is not adapted.
 */
    (this: void, element: ComponentElement) => ComponentContext | undefined;

/**
 * A binder of component to element.
 *
 * Component binders form an {@link ElementAdapter element adapter} available in bootstrap context.
 *
 * @category Core
 */
export interface ComponentBinder {

  /**
   * Matching element name.
   *
   * The binder is applied only to elements with matching names.
   */
  readonly to: QualifiedName;

  /**
   * Binds component to element if applicable.
   *
   * @param element - Target element to adapt.
   */
  bind(element: ComponentElement): void;

}

/**
 * @internal
 */
class ElementAdapterKey extends ContextUpKey<ElementAdapter, ComponentBinder> {

  readonly upKey: ContextUpKey.UpKey<ElementAdapter, ComponentBinder>;

  constructor() {
    super('element-adapter');
    this.upKey = this.createUpKey(
        slot => slot.insert(slot.seed.do(
            digAfter((...binders: ComponentBinder[]): AfterEvent<[ElementAdapter]> => {
              if (binders.length === 0) {
                return slot.hasFallback && slot.or
                    ? slot.or
                    : afterThe(defaultElementAdapter);
              }

              const nsAlias = slot.context.get(DefaultNamespaceAliaser);
              const adapterByName = new Map<string, ElementAdapter>();

              for (const spec of binders) {

                const name = html__naming.name(spec.to, nsAlias).toLowerCase();
                const prev = adapterByName.get(name) || defaultElementAdapter;

                adapterByName.set(
                    name,
                    element => {

                      const context = prev(element);

                      if (context) {
                        return context;
                      }

                      spec.bind(element);

                      return defaultElementAdapter(element);
                    },
                );
              }

              const combined = (element: ComponentElement): ComponentContext | undefined => {

                const adapter = adapterByName.get(element.tagName.toLowerCase()) || defaultElementAdapter;

                return adapter(element);
              };

              return afterThe(combined);
            }),
        )),
    );
  }

  grow(
      slot: ContextValueSlot<
          ElementAdapter,
          EventKeeper<ComponentBinder[]> | ComponentBinder,
          AfterEvent<ComponentBinder[]>>,
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
function defaultElementAdapter(element: ComponentElement): ComponentContext | undefined {

  const slot = element[ComponentSlot__symbol];

  return slot && slot.context;
}

/**
 * A key of bootstrap context value containing combined {@link ElementAdapter} instance.
 *
 * @category Core
 */
export const ElementAdapter: ContextUpRef<ElementAdapter, ComponentBinder> = (
    /*#__PURE__*/ new ElementAdapterKey()
);
