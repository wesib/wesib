import { ContextKey, ContextKey__symbol, SingleContextKey } from 'context-values';
import { Class } from '../../common';
import { ComponentMount } from '../../component';

const DomPropertyRegistry__key = (/*#__PURE__*/ new SingleContextKey<DomPropertyRegistry>('dom-property-registry'));

/**
 * @internal
 */
export class DomPropertyRegistry {

  static get [ContextKey__symbol](): ContextKey<DomPropertyRegistry> {
    return DomPropertyRegistry__key;
  }

  private readonly _props = new Map<PropertyKey, PropertyDescriptor>();

  add(propertyKey: PropertyKey, descriptor: PropertyDescriptor): void {
    this._props.set(propertyKey, descriptor);
  }

  define<T extends object>(elementType: Class<T>): void {

    const prototype = elementType.prototype;

    this._props.forEach((desc, key) => {
      Object.defineProperty(prototype, key, desc);
    });
  }

  mount<T extends object>(mount: ComponentMount<T>): void {

    const element = mount.element;

    this._props.forEach((desc, key) => {
      Object.defineProperty(element, key, desc);
    });
  }

}
