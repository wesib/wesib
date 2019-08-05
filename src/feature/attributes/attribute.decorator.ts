/**
 * @module @wesib/wesib
 */
import { TypedPropertyDecorator } from '../../common';
import { ComponentClass, ComponentContext, ComponentDef } from '../../component';
import { FeatureDef } from '../feature-def';
import { AttributeDef } from './attribute-def';
import { parseAttributeDef } from './attribute-def.impl';
import { AttributeRegistrar } from './attribute-registrar';
import { AttributesSupport } from './attributes-support.feature';

/**
 * Creates a decorator for component's property that accesses custom element's attribute.
 *
 * The decorated property accesses corresponding attribute on read, and updates it on setting.
 *
 * This decorator automatically enables [[AttributesSupport]] feature.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Attribute definition or just an attribute name.
 *
 * @return Component property decorator.
 */
export function Attribute<T extends ComponentClass>(
    def?: AttributeDef<InstanceType<T>> | string,
): TypedPropertyDecorator<T> {
  return <V>(target: InstanceType<T>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => {

    const { name, updateState } = parseAttributeDef(target, propertyKey, def);
    const componentType = target.constructor as T;

    FeatureDef.define(componentType, { needs: AttributesSupport });
    ComponentDef.define(
        componentType,
        {
          define(definitionContext) {
            definitionContext.get(AttributeRegistrar)(name, updateState);
          }
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
