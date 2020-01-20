import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { BootstrapWindow } from '../../boot/globals';
import { Class, mergeFunctions } from '../../common';
import { ComponentContext, ComponentMount } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { AttributeChangedCallback } from './attribute-registrar';

const AttributeRegistry__key = (/*#__PURE__*/ new SingleContextKey<AttributeRegistry>('attribute-registry'));

/**
 * @internal
 */
export class AttributeRegistry<T extends object = any> {

  static get [ContextKey__symbol](): ContextKey<AttributeRegistry> {
    return AttributeRegistry__key;
  }

  private readonly _MutationObserver: typeof MutationObserver;
  private readonly _attrs: { [name: string]: AttributeChangedCallback<T> } = {};

  constructor(ctx: DefinitionContext) {
    this._MutationObserver = ctx.get(BootstrapWindow).MutationObserver;
  }

  add(name: string, callback: AttributeChangedCallback<T>): void {
    this._attrs[name] = mergeFunctions<[string, string | null], void, T>(this._attrs[name], callback);
  }

  define(elementType: Class): void {

    const attrs = this._attrs;
    const observedAttributes = Object.keys(attrs);

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
        (attrs[name] as any).call(ComponentContext.of(this).component, newValue, oldValue);
      },
    });
  }

  mount(mount: ComponentMount<T>): void {

    const element = mount.element;
    const attrs = this._attrs;
    const attributeFilter = Object.keys(attrs);

    if (!attributeFilter.length) {
      return; // No attributes defined
    }

    const observer = new this._MutationObserver(
        records => records.forEach(
            record => {

              const attributeName = record.attributeName as string;

              return (attrs[attributeName] as any).call(
                  ComponentContext.of(element).component,
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
