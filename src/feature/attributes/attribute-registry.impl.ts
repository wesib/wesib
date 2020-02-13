import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { BootstrapWindow } from '../../boot/globals';
import { Class, mergeFunctions } from '../../common';
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
    const observedAttributes = Array.from(attrs.keys());

    if (!observedAttributes.length) {
      return; // No attributes defined
    }

    Object.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes,
    });
    Object.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: function (name: string, oldValue: string | null, newValue: string) {
        attrs.get(name)!.call(ComponentContext.of<T>(this).component, newValue, oldValue);
      },
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

              return attrs.get(attributeName)!.call(
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
