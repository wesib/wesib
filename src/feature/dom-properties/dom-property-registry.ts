import { ContextKey, SingleContextKey } from 'context-values';
import { Class } from '../../common';
import { ComponentMount } from '../../component';

const KEY = /*#__PURE__*/ new SingleContextKey<DomPropertyRegistry>('dom-property-registry');

/**
 * @internal
 */
export class DomPropertyRegistry {

  static get key(): ContextKey<DomPropertyRegistry> {
    return KEY;
  }

  private readonly _props = new Map<PropertyKey, PropertyDescriptor>();

  add(propertyKey: PropertyKey, descriptor: PropertyDescriptor): void {
    this._props.set(propertyKey, descriptor);
  }

  define<T extends object>(elementType: Class<T>) {

    const prototype = elementType.prototype;

    this._props.forEach((desc, key) => {
      Object.defineProperty(prototype, key, desc);
    });
  }

  mount<T extends object>(mount: ComponentMount<T>) {

    const element = mount.element;

    this._props.forEach((desc, key) => {
      Object.defineProperty(element, key, desc);
    });
  }

}
