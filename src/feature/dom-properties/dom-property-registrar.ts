import { ContextKey, SingleContextKey } from 'context-values';

export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

const KEY = /*#__PURE__*/ new SingleContextKey<DomPropertyRegistrar>('dom-property-registrar');

export const DomPropertyRegistrar = {

  get key(): ContextKey<DomPropertyRegistrar> {
    return KEY;
  }

};
