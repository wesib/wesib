import { QualifiedName } from '@frontmeans/namespace-aliaser';
import {
  allAmender,
  Amender,
  Amendment,
  AmendRequest,
  AmendTarget,
  ClassAmendment,
  isAmendatory,
  newAmendTarget,
} from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';
import { AeFeature, Feature } from '../feature';
import { ComponentDef } from './component-def';
import { ComponentClass } from './definition';

/**
 * An amended entity representing a component class to amend.
 *
 * @category Core
 * @typeParam TClass - Amended component class type.
 */
export interface AeComponent<TClass extends ComponentClass = Class> extends AeFeature<TClass> {

  /**
   * Amended component definition.
   */
  readonly componentDef: ComponentDef;

}

/**
 * An amendment target representing a component class to amend.
 *
 * @category Core
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 */
export type AeComponentTarget<
    TClass extends ComponentClass = Class,
    TAmended extends AeComponent<TClass> = AeComponent<TClass>,
    > = AmendTarget<TAmended>;

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
 * {@link bootstrapComponents} function, or added to {@link FeatureDef.needs} property of another feature.
 *
 * This is an alternative to direct call to {@link ComponentDef.define} method.
 *
 * @category Core
 * @typeParam TClass - Amended component class type.
 * @typeParam TAmended - Amended component entity type.
 * @param amendments - Component definitions, qualified name od component's element, or amendments to apply.
 *
 * @returns Component class amendment and decorator.
 */
export function Component<
    TClass extends ComponentClass = Class,
    TAmended extends AeComponent<TClass> = AeComponent<TClass>>(
    ...amendments: (ComponentDef<InstanceType<TClass>> | QualifiedName | Amendment<TAmended>)[]
): ComponentAmendment<TClass, TAmended> {

  const amender = Component$toAmender(amendments);

  return Feature<TClass, TAmended>(baseTarget => {

    let result: ComponentDef = {};

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
  }) as ComponentAmendment<TClass, TAmended>;
}

function Component$toAmender<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    amendments: (ComponentDef<InstanceType<TClass>> | QualifiedName | Amendment<TAmended>)[],
): Amender<TAmended> {

  const componentDefs: (ComponentDef | QualifiedName)[] = [];
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

  return allAmender(componentAmendments);
}

function isComponentAmendment<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    amendment: ComponentDef | QualifiedName | Amendment<TAmended>,
): amendment is Amendment<TAmended> {
  return typeof amendment === 'function' || isAmendatory(amendment);
}

function ComponentDef$toAmender<TClass extends ComponentClass, TAmended extends AeComponent<TClass>>(
    defs: (ComponentDef | QualifiedName)[],
): Amender<TAmended> {
  return ({ amend }: AeComponentTarget<TClass>) => amend({
    componentDef: ComponentDef.merge(...defs),
  });
}
