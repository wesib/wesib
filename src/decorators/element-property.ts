import { componentOf, defineComponent } from '../component';
import { Class } from '../types';
import { ComponentPropertyDecorator } from './component-decorators';

export interface ElementPropertyDef {
  name?: string | symbol;
  configurable?: boolean;
  enumerable?: boolean;
  writable?: boolean;
}

export function ElementProperty<T extends Class>(def: ElementPropertyDef = {}): ComponentPropertyDecorator<T> {
  return <V>(target: T['prototype'], propertyKey: string | symbol, propertyDesc?: TypedPropertyDescriptor<V>) => {

    const name = def.name || propertyKey;
    const desc = elementPropertyDescriptor(propertyKey, propertyDesc, def);
    const constructor = target.constructor as T;

    defineComponent(
        constructor,
        {
          properties: {
            [name]: desc,
          }
        });
  };
}

export { ElementProperty as ElementMethod };

function elementPropertyDescriptor<V>(
    propertyKey: string | symbol,
    propertyDesc: TypedPropertyDescriptor<V> | undefined,
    {
      configurable,
      enumerable,
      writable,
    }: ElementPropertyDef): PropertyDescriptor {
  if (!propertyDesc) {
    // Component object property
    if (enumerable == null) {
      enumerable = true;
    }
    if (configurable == null) {
      configurable = true;
    }
    if (writable == null) {
      writable = true;
    }
  } else {
    // Component property accessor
    if (configurable == null) {
      configurable = propertyDesc.configurable === true;
    }
    if (enumerable == null) {
      enumerable = propertyDesc.enumerable === true;
    }
    if (!propertyDesc.set) {
      // No setter. Element property is not writable.
      writable = false;
    } else if (writable == null) {
      // There is a setter. Element property is writable by default.
      writable = true;
    }
  }

  const desc: TypedPropertyDescriptor<V> = {
    configurable,
    enumerable,
    get: function (this: HTMLElement) {
      return (componentOf(this) as any)[propertyKey];
    }
  };

  if (writable) {
    desc.set = function (this: HTMLElement, value: any) {
      (componentOf(this) as any)[propertyKey] = value;
    };
  }

  return desc;
}
