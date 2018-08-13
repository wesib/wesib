import { Class } from '../types';

export type ComponentDecorator<T extends Class> = (type: T) => T | void;

export type ComponentPropertyDecorator<T extends Class> =
    (target: T['prototype'], propertyKey: string | symbol, descriptor?: PropertyDescriptor) => void;

export type ComponentMethodDecorator<T extends Class, V> =
    (target: T['prototype'], propertyKey: string | symbol, descriptor?: TypedPropertyDescriptor<V>) => void;
