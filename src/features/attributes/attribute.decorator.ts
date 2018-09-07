import { TypedPropertyDecorator } from '../../common';
import { StateValueKey } from '../../common/events';
import { ComponentContext, ComponentType } from '../../component';
import { attributeStateUpdate } from './attribute-state-update';
import { AttributeChangedCallback, AttributesDef, AttributeUpdateConsumer } from './attributes-def';

/**
 * Creates decorator for HTML element accessor property.
 *
 * The decorated property accesses corresponding attribute on read, and updates it on setting.
 *
 * This decorator automatically enables `AttributesSupport` feature.
 *
 * @param opts Attribute definition options, or just an attribute name.
 *
 * @return Web component property decorator.
 */
export function Attribute<T extends ComponentType>(opts?: Attribute.Opts<T> | string): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => {

    const { name, updateState } = parseAttributeOpts(target, propertyKey, opts);
    const componentType = target.constructor as T;

    AttributesDef.define(
        componentType,
        {
          [name]: updateState,
        });

    const newDesc: TypedPropertyDescriptor<string | null> = {
      get(this: InstanceType<T>): string | null {
        return ComponentContext.of(this).element.getAttribute(name);
      },
      set(this: InstanceType<T>, newValue: string | null) {
        ComponentContext.of(this).element.setAttribute(name, newValue as string);
      },
    };

    if (descriptor == null) {
      // Annotated field
      Object.defineProperty(target, propertyKey, newDesc);
      return;
    }

    return newDesc;
  };
}

export namespace Attribute {

  /**
   * Attribute definition options.
   *
   * This is passed to `@Attribute` and `@AttributeChanged` decorators.
   */
  export interface Opts<T extends object> {

    /**
     * Attribute name.
     *
     * This is required if annotated property's key is not a string (i.e. a symbol). Otherwise,
     * the attribute name is equal to the property name by default.
     */
    name?: string;

    /**
     * Whether to update the component state after attribute change.
     *
     * Can be one of:
     * - `false` to not update the component state,
     * - `true` (the default value) to update the component state with changed attribute key,
     * - a state value key to update, or
     * - an attribute update consumer function with custom state update logic.
     */
    updateState?: boolean | StateValueKey | AttributeUpdateConsumer<T>;

  }

}

/**
 * @internal
 */
export function parseAttributeOpts<T extends ComponentType>(
    target: InstanceType<T>,
    propertyKey: string | symbol,
    opts?: Attribute.Opts<T> | string) {

  let name: string;
  let updateState: AttributeChangedCallback<InstanceType<T>>;

  if (typeof opts === 'string') {
    name = opts;
    updateState = attributeStateUpdate(name);
  } else {
    if (opts && opts.name) {
      name = opts.name;
    } else if (typeof propertyKey !== 'string') {
      throw new TypeError(
          'Attribute name is required, as property key is not a string: ' +
          `${target.constructor.name}.${propertyKey.toString()}`);
    } else {
      name = propertyKey;
    }

    updateState = attributeStateUpdate(name, opts && opts.updateState);
  }

  return { name, updateState };
}
