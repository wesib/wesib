import { ContextRef, ContextRegistry, SingleContextKey } from '@proc7ts/context-values';
import { bootstrapDefault } from '../boot';
import { ComponentContext } from '../component';

export type PerComponentRegistry = ComponentContextRegistry;

export const PerComponentRegistry: ContextRef<PerComponentRegistry> = (
    /*#__PURE__*/ new SingleContextKey<ComponentContextRegistry>(
    'per-component-registry',
    {
      byDefault: bootstrapDefault(() => new ComponentContextRegistry()),
    },
));

/**
 * @internal
 */
export class ComponentContextRegistry extends ContextRegistry<ComponentContext> {
}
