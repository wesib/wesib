import { componentOf, defineComponent } from '../component';
import { Class } from '../types';
import { ComponentPropertyDecorator } from './component-decorators';

export interface ElementPropertyDef {
  name?: string;
  configurable?: boolean;
  enumerable?: boolean;
  writable?: boolean;
}

export function ElementProperty<T extends Class>(def: ElementPropertyDef = {}):
    ComponentPropertyDecorator<T> {
  return (target: T['prototype'], propertyName: string, propertyDesc?: PropertyDescriptor) => {

    const name = def.name || propertyName;
    const desc = elementPropertyDescriptor(propertyName, propertyDesc, def);
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

function elementPropertyDescriptor(
    propertyName: string,
    propertyDesc: PropertyDescriptor | undefined,
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

  const desc: PropertyDescriptor = {
    configurable,
    enumerable,
    get: function (this: HTMLElement) {
      return (componentOf(this) as any)[propertyName];
    }
  };

  if (writable) {
    desc.set = function (this: HTMLElement, value: any) {
      (componentOf(this) as any)[propertyName] = value;
    };
  }

  return desc;
}
