import { Class } from '../common';

/**
 * Web component class decorator.
 *
 * @param <T> A type of web component.
 */
export type ComponentDecorator<T extends Class> = (type: T) => T | void;

/**
 * Web component property decorator.
 *
 * @param <T> A type of web component.
 */
export type ComponentPropertyDecorator<T extends Class> =
    <V>(target: InstanceType<T>, propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => any | void;
