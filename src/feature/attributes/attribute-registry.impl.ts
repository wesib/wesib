import { ContextKey, ContextKey__symbol, SingleContextKey } from '@proc7ts/context-values';
import { BootstrapWindow } from '../../boot/globals';
import { ArraySet, Class, mergeFunctions } from '../../common';
import { isArray } from '../../common/types.impl';
import { ComponentContext, ComponentMount } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { AttributeChangedCallback, AttributeDescriptor } from './attribute-descriptor';

const AttributeRegistry__key = (/*#__PURE__*/ new SingleContextKey<AttributeRegistry>('attribute-registry'));

/**
 * @internal
 */
export class AttributeRegistry<T extends object = any> {

  static get [ContextKey__symbol](): ContextKey<AttributeRegistry> {
    return AttributeRegistry__key;
  }

  private _attrs?: Map<string, AttributeChangedCallback<T>>;

  constructor(private readonly _context: DefinitionContext) {
  }

  get attrs(): Map<string, AttributeChangedCallback<T>> {
    if (this._attrs) {
      return this._attrs;
    }

    const attrs = new Map<string, AttributeChangedCallback<T>>();

    this._context.get(AttributeDescriptor).forEach(desc => {

      const { name, change } = desc;

      attrs.set(name, mergeFunctions(attrs.get(name), change));
    });

    return this._attrs = attrs;
  }

  define(elementType: Class): void {

    const attrs = this.attrs;

    if (!attrs.size) {
      return; // No attributes defined
    }

    Object.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes(elementType, attrs.keys()),
    });
    Object.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: attributeChangedCallback(elementType, attrs),
    });
  }

  mount(mount: ComponentMount<T>): void {

    const element = mount.element;
    const attrs = this.attrs;
    const attributeFilter = Array.from(attrs.keys());

    if (!attributeFilter.length) {
      return; // No attributes defined
    }

    const MutationObserver = this._context.get(BootstrapWindow).MutationObserver;
    const observer = new MutationObserver(
        records => records.forEach(
            record => {

              const attributeName = record.attributeName as string;

              return attrs.get(attributeName)!(
                  ComponentContext.of<T>(element).component,
                  element.getAttribute(attributeName),
                  record.oldValue,
              );
            },
        ),
    );

    observer.observe(element, {
      attributes: true,
      attributeFilter,
      attributeOldValue: true,
    });
  }

}

/**
 * @internal
 */
type ElementAttributeChanged = (
    this: any,
    name: string,
    oldValue: string | null,
    newValue: string | null,
) => void;

/**
 * @internal
 */
function observedAttributes(
    elementType: Class,
    attrs: Iterable<string>,
): readonly string[] {

  const alreadyObserved: readonly string[] | undefined = (elementType as any).observedAttributes;

  return Array.from(isArray<string>(alreadyObserved)
      ? new ArraySet(alreadyObserved).addAll(attrs).items
      : attrs);
}

/**
 * @internal
 */
function attributeChangedCallback<T extends object>(
    elementType: Class,
    attrs: Map<string, AttributeChangedCallback<T>>,
): ElementAttributeChanged {

  const prevCallback: ElementAttributeChanged | undefined = elementType.prototype.attributeChangedCallback;

  if (!prevCallback) {
    return function (name, oldValue, newValue) {
      attrs.get(name)!(ComponentContext.of<T>(this).component, newValue, oldValue);
    };
  }

  return function (name, oldValue, newValue) {

    const attrChanged = attrs.get(name);

    if (attrChanged) {
      attrChanged(ComponentContext.of<T>(this).component, newValue, oldValue);
    } else {
      prevCallback.call(this, name, oldValue, newValue);
    }
  };
}
