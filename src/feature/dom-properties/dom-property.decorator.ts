/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from '../../common';
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertyDef } from './dom-property-def';
import { domPropertyDescriptor } from './dom-property-descriptor.impl';
import { DomPropertyRegistry } from './dom-property-registry';
import { domPropertyUpdate } from './dom-property-update.impl';

/**
 * Creates component property decorator that declares a property to add to custom element created for this component.
 *
 * The value of declared element's property will be read from and written to decorated one.
 *
 * By default does not update component state if property value didn't change.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Custom element property definition.
 *
 * @returns Component property decorator.
 */
export function DomProperty<V = any, T extends ComponentClass = Class>(
    def: DomPropertyDef<T> = {},
): ComponentPropertyDecorator<V, T> {
  return ComponentProperty(descriptor => {

    const { key, get } = descriptor;
    let { set } = descriptor;
    const domDescriptor = domPropertyDescriptor(descriptor, def);

    if (def.updateState !== false) {

      const updateState = domPropertyUpdate<InstanceType<T>>(key, def.updateState);
      const setValue = set;

      set = (component, newValue) => {

        const oldValue = get(component);

        setValue(component, newValue);
        updateState(component, newValue, oldValue);
      };
    }

    return {
      componentDef: {
        define(defContext) {
          defContext.get(DomPropertyRegistry).declareDomProperty(domDescriptor);
        },
      },
      get,
      set,
    };
  });
}

/**
 * Component method decorator that declares a method to add to custom element created for this component.
 *
 * This is just an alias of {@link DomProperty @DomProperty} decorator.
 *
 * @category Feature
 */
export { DomProperty as DomMethod };
