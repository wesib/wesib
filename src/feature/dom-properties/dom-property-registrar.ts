/**
 * @module @wesib/wesib
 */
import { ContextRequest, ContextTarget, SingleContextKey } from 'context-values';

/**
 * @category Feature
 */
export type DomPropertyRegistrar = (propertyKey: PropertyKey, descriptor: PropertyDescriptor) => void;

/**
 * @category Feature
 */
export const DomPropertyRegistrar: ContextTarget<DomPropertyRegistrar> & ContextRequest<DomPropertyRegistrar> =
    /*#__PURE__*/ new SingleContextKey<DomPropertyRegistrar>('dom-property-registrar');
