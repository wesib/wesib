import { Class } from '../types';

/**
 * Web component class decorator.
 *
 * @param <T> A type of web component.
 * @param <HTE> A type of HTML element this web component extends.
 */
export type ComponentDecorator<T extends Class> = (type: T) => T | void;

/**
 * Web component property decorator.
 *
 * @param <T> A type of web component.
 */
export type ComponentPropertyDecorator<T extends Class> =
    <V>(target: T['prototype'], propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => void;
