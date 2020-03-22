import { SingleContextKey, SingleContextRef } from '@proc7ts/context-values';
import { EventEmitter } from '@proc7ts/fun-events';
import { ComponentContext } from '../../component';
import { ComponentClass, ComponentFactory, DefinitionContext } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { DefinitionContext$ } from './definition-context.impl';

/**
 * @internal
 */
export interface ElementBuilder {
  readonly definitions: EventEmitter<[DefinitionContext]>;
  readonly components: EventEmitter<[ComponentContext]>;
  buildElement<T extends object>(this: void, componentType: ComponentClass<T>): ComponentFactory<T>;
}

/**
 * @internal
 */
export const ElementBuilder: SingleContextRef<ElementBuilder> = (/*#__PURE__*/ new SingleContextKey<ElementBuilder>(
    'element-builder',
    {
      byDefault: bootstrapDefault(newElementBuilder),
    },
));

function newElementBuilder(bsContext: BootstrapContext): ElementBuilder {
  return {
    definitions: new EventEmitter<[DefinitionContext]>(),
    components: new EventEmitter<[ComponentContext]>(),
    buildElement<T extends object>(componentType: ComponentClass<T>) {

      const definitionContext = new DefinitionContext$(bsContext, this, componentType);

      return definitionContext._factory();
    },
  };

}
