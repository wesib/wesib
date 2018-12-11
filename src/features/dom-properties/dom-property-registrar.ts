import { ContextKey, SingleContextKey } from 'context-values';

export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

export namespace DomPropertyRegistrar {

  export const key: ContextKey<DomPropertyRegistrar> = new SingleContextKey('dom-property-registrar');

}
