/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

export const DomPropertyRegistrar: ContextTarget<DomPropertyRegistrar> & ContextRequest<DomPropertyRegistrar> =
    /*#__PURE__*/ new SingleContextKey<DomPropertyRegistrar>('dom-property-registrar');
