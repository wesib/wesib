import { OnEvent, onPromise } from '@proc7ts/fun-events';
import { ComponentClass, CustomElements, DefinitionContext } from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { definitionContextOf } from './definition-context.symbol.impl';

/**
 * @internal
 */
export const WhenDefined__symbol = (/*#__PURE__*/ Symbol('when-defined'));

/**
 * @internal
 */
export function whenDefined<T extends object>(
    bsContext: BootstrapContext,
    componentType: ComponentClass<T>,
): OnEvent<[DefinitionContext<T>]> {
  // eslint-disable-next-line no-prototype-builtins
  if (componentType.hasOwnProperty(WhenDefined__symbol)) {
    return (componentType as any)[WhenDefined__symbol];
  }

  const result: OnEvent<[DefinitionContext<T>]> = onPromise(
      Promise.resolve(bsContext.whenReady())
          .then(() => bsContext.get(CustomElements).whenDefined(componentType))
          .then(() => definitionContextOf(componentType)),
  );

  return (componentType as any)[WhenDefined__symbol] = result;
}
