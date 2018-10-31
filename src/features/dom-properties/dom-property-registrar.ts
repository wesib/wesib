import { SingleValueKey } from '../../common/context';

export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

export namespace DomPropertyRegistrar {

  export const key = new SingleValueKey<DomPropertyRegistrar>('dom-property-registrar');

}
