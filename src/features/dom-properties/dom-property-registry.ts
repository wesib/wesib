import { SingleValueKey } from '../../common/context';

export interface DomPropertyRegistry {

  domProperty(propertyKey: PropertyKey, descriptor: PropertyDescriptor): void;

}

export namespace DomPropertyRegistry {

  export const key = new SingleValueKey<DomPropertyRegistry>('dom-property-registry');

}
