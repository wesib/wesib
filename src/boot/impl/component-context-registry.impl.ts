import { ContextRef, ContextRegistry, SingleContextKey } from '@proc7ts/context-values';
import { ComponentContext } from '../../component';
import { bootstrapDefault } from '../bootstrap-default';

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
