import { CustomHTMLElementClass } from '@frontmeans/dom-primitives';
import { CxEntry, cxScoped, cxSingle } from '@proc7ts/context-values';
import { mergeFunctions } from '@proc7ts/primitives';
import { ComponentContext, ComponentElement, ComponentSlot } from '../../component';
import { DefinitionContext } from '../../component/definition';
import { BootstrapWindow } from '../../globals';
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
 * Component definition context entry containing {@link AttributeRegistry attribute registry}.
 *
 * @category Feature
 */
export const AttributeRegistry: CxEntry<AttributeRegistry> = {
  perContext: (/*#__PURE__*/ cxScoped(
      DefinitionContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: target => new AttributeRegistry$(target.get(DefinitionContext)),
      })),
  )),
  toString: () => '[AttributeRegistry]',
};

class AttributeRegistry$ implements AttributeRegistry {

  private readonly attrs = new Map<string, AttributeChangedCallback<any>>();

  constructor(private readonly _defContext: DefinitionContext) {
    _defContext.whenReady(({ elementType }) => this.define(elementType as CustomHTMLElementClass));
    _defContext.whenComponent(context => {
      if (context.mounted) {
        // Mount element attributes
        this.mount(context);
      }
    });
  }

  declareAttribute({ name, change }: AttributeDescriptor): void {
    this.attrs.set(name, mergeFunctions(this.attrs.get(name), change));
  }

  private define(elementType: CustomHTMLElementClass): void {

    const { attrs } = this;

    if (!attrs.size) {
      return; // No attributes defined
    }

    Reflect.defineProperty(elementType, 'observedAttributes', {
      configurable: true,
      enumerable: true,
      value: observedAttributes(elementType, [...attrs.keys()]),
    });
    Reflect.defineProperty(elementType.prototype, 'attributeChangedCallback', {
      configurable: true,
      enumerable: true,
      value: attributeChangedCallback(elementType, attrs),
    });
  }

  private mount(context: ComponentContext): void {

    const { element } = context as { element: ComponentElement };
    const { attrs } = this;
    const attributeFilter = [...attrs.keys()];

    if (!attributeFilter.length) {
      return; // No attributes defined
    }

    const MutationObserver = this._defContext.get(BootstrapWindow).MutationObserver;
    const observer = new MutationObserver(
        records => records.forEach(
            record => {

              const attributeName = record.attributeName as string;

              return attrs.get(attributeName)!(
                  context.component,
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
    elementType: CustomHTMLElementClass,
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
    elementType: CustomHTMLElementClass,
    attrs: Map<string, AttributeChangedCallback<T>>,
): ElementAttributeChanged {

  const prevCallback = elementType.prototype.attributeChangedCallback;

  if (!prevCallback) {
    return function (this: ComponentElement<T>, name, oldValue, newValue) {
      ComponentSlot.of(this).whenReady(({ component }) => {
        attrs.get(name)!(component, newValue, oldValue);
      });
    };
  }

  return function (this: ComponentElement<T>, name, oldValue, newValue) {

    const attrChanged = attrs.get(name);

    if (attrChanged) {
      ComponentSlot.of(this).whenReady(({ component }) => attrChanged(component, newValue, oldValue));
    } else {
      prevCallback.call(this, name, oldValue, newValue);
    }
  };
}
