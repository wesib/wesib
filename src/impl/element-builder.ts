import { SingleContextKey, SingleContextRef } from '@proc7ts/context-values';
import { EventEmitter } from '@proc7ts/fun-events';
import { BootstrapContext, bootstrapDefault } from '../boot';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { DefinitionContext$ } from './definition-context';

/**
 * @internal
 */
export interface ElementBuilder {
  readonly definitions: EventEmitter<[DefinitionContext]>;
  readonly components: EventEmitter<[ComponentContext]>;
  buildElement<T extends object>(this: void, componentType: ComponentClass<T>): DefinitionContext<T>;
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

      definitionContext._define();

      return definitionContext;
    },
  };

}
