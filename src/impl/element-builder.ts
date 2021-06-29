import { cxDefaultScoped, CxEntry, cxSingle } from '@proc7ts/context-values';
import { EventEmitter } from '@proc7ts/fun-events';
import { BootstrapContext } from '../boot';
import { ComponentContext } from '../component';
import { ComponentClass, DefinitionContext } from '../component/definition';
import { DefinitionContext$ } from './definition-context';

export interface ElementBuilder {
  readonly definitions: EventEmitter<[DefinitionContext]>;
  readonly components: EventEmitter<[ComponentContext]>;
  buildElement<T extends object>(this: void, componentType: ComponentClass<T>): DefinitionContext<T>;
}

export const ElementBuilder: CxEntry<ElementBuilder> = {
  perContext: (/*#__PURE__*/ cxDefaultScoped(
      BootstrapContext,
      (/*#__PURE__*/ cxSingle({
        byDefault: ElementBuilder$create,
      })),
  )),
};

function ElementBuilder$create(target: CxEntry.Target<ElementBuilder>): ElementBuilder {
  return {
    definitions: new EventEmitter<[DefinitionContext]>(),
    components: new EventEmitter<[ComponentContext]>(),
    buildElement<T extends object>(componentType: ComponentClass<T>) {

      const definitionContext = DefinitionContext$.create(target.get(BootstrapContext), this, componentType);

      definitionContext._define();

      return definitionContext;
    },
  };

}
