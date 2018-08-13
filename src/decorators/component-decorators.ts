import { Class } from '../types';

export type ComponentDecorator<T extends Class> = (type: T) => T | void;

export type ComponentPropertyDecorator<T extends Class> =
    (target: T['prototype'], name: string, descriptor?: PropertyDescriptor) => void;
