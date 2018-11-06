import { SingleContextKey } from '../../common/context';

export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

export namespace DomPropertyRegistrar {

  export const key = new SingleContextKey<DomPropertyRegistrar>('dom-property-registrar');

}
