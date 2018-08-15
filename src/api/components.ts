import { ComponentElementType, ComponentType } from '../component';
import { ElementClass } from '../element';
import { ComponentRegistry } from '../element/component-registry';

export interface Components {

  define<T extends object>(componentType: ComponentType<T>): ElementClass<ComponentElementType<T>>;

  whenDefined(componentType: ComponentType<any, any>): PromiseLike<void>;

}

export interface ComponentsOpts {
  window?: Window;
}

export function createComponents({ window }: ComponentsOpts = {}): Components {

  const registry = ComponentRegistry.create({ window });

  return {
    define(componentType) {
      return registry.define(componentType);
    },
    whenDefined(componentType) {
      return registry.whenDefined(componentType);
    }
  };
}

export const components = createComponents();
