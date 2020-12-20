/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { ContextRef, SingleContextKey } from '@proc7ts/context-values';
import { mergeFunctions } from '@proc7ts/primitives';
import { BootstrapWindow } from '../../boot/globals';
import { CustomElementClass } from '../../common';
import { ComponentContext, ComponentMount } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { AttributeChangedCallback, AttributeDescriptor } from './attribute-descriptor';

/**
 * A registry of component's element attributes.
 *
 * @category Feature
 */
export interface AttributeRegistry {

  /**
   * Declares component element's attribute.
   *
   * @param descriptor - Attribute descriptor.
   */
  declareAttribute(descriptor: AttributeDescriptor): void;

}

/**
 * A key of component definition context value containing {@link AttributeRegistry attribute registry}.
 *
 * @category Feature
 */
export const AttributeRegistry: ContextRef<AttributeRegistry> = (
    /*#__PURE__*/ new SingleContextKey<AttributeRegistry>(
        'attribute-registry',
        {
          byDefault(context) {
            return new AttributeRegistry$(context.get(DefinitionContext));
          },
        },
    )
);

/**
 * @internal
 */
class AttributeRegistry$ implements AttributeRegistry {

  private readonly attrs = new Map<string, AttributeChangedCallback<any>>();

  constructor(private readonly _context: DefinitionContext) {
    _context.whenReady(({ elementType }) => this.define(elementType as CustomElementClass));
    _context.whenComponent(({ mount }) => {
      if (mount) {
        // Mount element attributes
        this.mount(mount);
      }
    });
  }

  declareAttribute({ name, change }: AttributeDescriptor): void {
    this.attrs.set(name, mergeFunctions(this.attrs.get(name), change));
  }

  private define(elementType: CustomElementClass): void {

    const { attrs } = this;

    if (!attrs.size) {
      return; // No attributes defined
    }

    Object.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes(elementType, [...attrs.keys()]),
    });
    Object.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: attributeChangedCallback(elementType, attrs),
    });
  }

  private mount(mount: ComponentMount): void {

    const { element } = mount as { element: Element };
    const { attrs } = this;
    const attributeFilter = [...attrs.keys()];

    if (!attributeFilter.length) {
      return; // No attributes defined
    }

    const MutationObserver = this._context.get(BootstrapWindow).MutationObserver;
    const observer = new MutationObserver(
        records => records.forEach(
            record => {

              const attributeName = record.attributeName as string;

              return attrs.get(attributeName)!(
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
    elementType: CustomElementClass,
    attrs: readonly string[],
): readonly string[] {

  const alreadyObserved = elementType.observedAttributes;

  if (Array.isArray(alreadyObserved)) {

    const newAttrs = new Set<string>(alreadyObserved);

    attrs.forEach(attr => newAttrs.add(attr));

    attrs = [...newAttrs];
  }

  return attrs;
}

/**
 * @internal
 */
function attributeChangedCallback<T extends object>(
    elementType: CustomElementClass,
    attrs: Map<string, AttributeChangedCallback<T>>,
): ElementAttributeChanged {

  const prevCallback = elementType.prototype.attributeChangedCallback;

  if (!prevCallback) {
    return function (this: any, name, oldValue, newValue) {
      attrs.get(name)!(ComponentContext.of<T>(this).component, newValue, oldValue);
    };
  }

  return function (this: any, name, oldValue, newValue) {

    const attrChanged = attrs.get(name);

    if (attrChanged) {
      attrChanged(ComponentContext.of<T>(this).component, newValue, oldValue);
    } else {
      prevCallback.call(this, name, oldValue, newValue);
    }
  };
}
