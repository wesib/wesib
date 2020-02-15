/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from '../../common';
import { ComponentProperty, ComponentPropertyDecorator } from '../../component';
import { ComponentClass } from '../../component/definition';
import { DomPropertiesSupport } from './dom-properties-support.feature';
import { DomPropertyDef } from './dom-property-def';
import { DomPropertyDescriptor } from './dom-property-descriptor';
import { domPropertyDescriptor } from './dom-property-descriptor.impl';
import { propertyStateUpdate } from './property-state-update.impl';

/**
 * Component property decorator that declares a property to add to custom element created for this component.
 *
 * The value of declared element's property will be read from and written to decorated one.
 *
 * This decorator can be applied both to plain properties and to property accessors.
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

      const updateState = propertyStateUpdate<InstanceType<T>>(key, def.updateState);
      const setValue = set;

      set = (component, newValue) => {

        const oldValue = get(component);

        setValue(component, newValue);
        updateState.call(component, newValue, oldValue);
      };
    }

    return {
      componentDef: {
        feature: {
          needs: DomPropertiesSupport,
        },
        setup(setup) {
          setup.perDefinition({ a: DomPropertyDescriptor, is: domDescriptor });
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
