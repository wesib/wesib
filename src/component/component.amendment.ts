import {
  AeNone,
  Amender,
  Amendment,
  AmendRequest,
  AmendTarget,
  ClassAmendment,
  combineAmendments,
  isAmendatory,
  newAmendTarget,
} from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';
import { AeFeature, Feature, FeatureDef, FeatureDef__symbol } from '../feature';
import { ComponentDef, ComponentDef__symbol } from './component-def';
import { ComponentClass } from './definition';

/**
 * An amended entity representing a component class to amend.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface AeComponent<TClass extends ComponentClass = Class> extends AeFeature<TClass> {

  /**
   * Amended component definition.
   */
  readonly componentDef: ComponentDef.Options;

}

/**
 * Component amendment.
 *
 * Constructed by {@link Component} function.
 *
 * @category Core
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 */
export type ComponentAmendment<
    TClass extends ComponentClass = Class,
    TAmended extends AeComponent<TClass> = AeComponent<TClass>> =
    ClassAmendment.ForBase<AeComponent<TClass>, TClass, TAmended>;

/**
 * Creates a component class amendment (and decorator).
 *
 * Decorated class becomes component:
 * ```TypeScript
 * @Component({ name: 'my-element' })
 * class MyComponent {
 *   // ...
 * }
 * ```
 *
 * Such component can be registered with {@link FeatureContext.define} method or used as a feature, e.g. passed to
 * {@link bootstrapComponents} function, or added to {@link FeatureDef.Options.needs} property of another feature.
 *
 * This is an alternative to direct call to {@link ComponentDef.Options.define} method.
 *
 * @category Core
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 * @param amendments - Component definitions.
 *
 * @returns Component class amendment and decorator.
 */
export function Component<
    TClass extends ComponentClass = Class,
    TAmended extends AeComponent<TClass> = AeComponent<TClass>>(
    ...amendments: (ComponentDef<InstanceType<TClass>> | Amendment<TAmended>)[]
): ComponentAmendment<TClass, TAmended> {

  const amender = Component$toAmender(amendments);

  return Feature<TClass, TAmended>(baseTarget => {

    let result: ComponentDef.Options = {};

    amender(newAmendTarget({
      base: {
        ...baseTarget as unknown as TAmended,
        componentDef: {},
      },
      amend<TBase extends TAmended, TExt>(
          _base: TBase,
          request = {} as AmendRequest<TBase, TExt>,
      ): () => AmendTarget.Draft<TBase & TExt> {

        const { componentDef: defRequest = {}, ...baseRequest } = request;
        const createBaseTarget = baseTarget.amend(baseRequest as AmendRequest<any>);
        const componentDef = result = ComponentDef.merge(result, defRequest);

        return () => ({
          ...createBaseTarget(),
          componentDef,
        } as AmendTarget.Draft<TBase & TExt>);
      },
    }));

    ComponentDef.define(baseTarget.amendedClass, result);
  });
}

function Component$toAmender<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    amendments: (ComponentDef<InstanceType<TClass>> | Amendment<TAmended>)[],
): Amender<TAmended> {

  const componentDefs: ComponentDef[] = [];
  const componentAmendments: Amendment<TAmended>[] = [];

  for (const amendment of amendments) {
    if (isComponentAmendment<TClass, TAmended>(amendment)) {
      componentAmendments.push(amendment);
    } else {
      componentDefs.push(amendment);
    }
  }

  if (componentDefs.length) {
    componentAmendments.push(ComponentDef$toAmender(componentDefs));
  }

  return combineAmendments(componentAmendments);
}

function isComponentAmendment<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    amendment: ComponentDef | Amendment<TAmended>,
): amendment is Amendment<TAmended> {
  return (amendment as Partial<FeatureDef.Holder>)[FeatureDef__symbol] == null
      && (amendment as Partial<ComponentDef.Holder>)[ComponentDef__symbol] == null
      && (typeof amendment === 'function' || isAmendatory(amendment));
}

function ComponentDef$toAmender<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    defs: ComponentDef[],
): Amender<TAmended> {
  return ({ amendedClass, amend }: AmendTarget<AeComponent<TClass>>) => {
    amend<AeNone>({
      componentDef: ComponentDef.for(
          amendedClass,
          ComponentDef.all(...defs),
      ),
    } as AmendRequest<TAmended>);
  };
}
