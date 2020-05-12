/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { SingleContextKey } from '@proc7ts/context-values';
import { BootstrapWindow } from '../../boot/globals';
import { ArraySet, Class, mergeFunctions } from '../../common';
import { isArray } from '../../common/types.impl';
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
   * @param descriptor  Attribute descriptor.
   */
  declareAttribute(descriptor: AttributeDescriptor): void;

}

/**
 * A key of component definition context value containing {@link AttributeRegistry attribute registry}.
 *
 * @category Feature
 */
export const AttributeRegistry = (/*#__PURE__*/ new SingleContextKey<AttributeRegistry>(
    'attribute-registry',
    {
      byDefault(context) {
        return new AttributeRegistry$(context.get(DefinitionContext));
      },
    },
));

/**
 * @internal
 */
class AttributeRegistry$ implements AttributeRegistry {

  private readonly attrs = new Map<string, AttributeChangedCallback<any>>();

  constructor(private readonly _context: DefinitionContext) {
    _context.whenReady(({ elementType }) => this.define(elementType));
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

  private define(elementType: Class): void {

    const { attrs } = this;

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

  private mount(mount: ComponentMount): void {

    const element = mount.element;
    const { attrs } = this;
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
    elementType: Class,
    attrs: Iterable<string>,
): readonly string[] {

  const alreadyObserved: readonly string[] | undefined = (elementType as any).observedAttributes;

  return Array.from(
      isArray<string>(alreadyObserved)
          ? new ArraySet(alreadyObserved).addAll(attrs).items
          : attrs,
  );
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
