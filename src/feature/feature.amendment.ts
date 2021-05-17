import {
  AeClass,
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
import { FeatureDef } from './feature-def';

/**
 * An amended entity representing a feature class to amend.
 *
 * @category Core
 * @typeParam TClass - A type of amended class.
 */
export interface AeFeature<TClass extends Class = Class> extends AeClass<TClass> {

  /**
   * Amended feature definition options.
   */
  readonly featureDef: FeatureDef;

}

/**
 * Feature amendment.
 *
 * Constructed by {@link Feature} function.
 *
 * @category Core
 * @typeParam TClass - Amended feature class type.
 * @typeParam TAmended - Amended feature entity type.
 */
export type FeatureAmendment<TClass extends Class, TAmended extends AeFeature<TClass>> =
    ClassAmendment.ForBase<AeFeature<TClass>, TClass, TAmended>;

/**
 * Creates a feature class amendment (and decorator).
 *
 * Decorate a class with this decorator to define it as a feature like this:
 * ```TypeScript
 * @Feature({ needs: [OtherFeature, MyComponent] })
 * class MyFeature {
 *   // ...
 * }
 * ```
 *
 * Such feature can be passed to {@link bootstrapComponents} function or referenced by other features.
 *
 * This is an alternative to direct call to {@link FeatureDef.define} method.
 *
 * @category Core
 * @typeParam TClass - Amended feature class type.
 * @typeParam TAmended - Amended feature entity type.
 * @param amendments - Feature definitions or amendments to apply.
 *
 * @returns Feature class amendment and decorator.
 */
export function Feature<TClass extends Class = Class, TAmended extends AeFeature<TClass> = AeFeature<TClass>>(
    ...amendments: (FeatureDef | Amendment<TAmended>)[]
): FeatureAmendment<TClass, TAmended> {

  const amender = Feature$toAmender(amendments);

  return AeClass<TClass, TAmended>(baseTarget => {

    let result: FeatureDef = {};

    amender(newAmendTarget({
      base: {
        ...baseTarget as unknown as TAmended,
        featureDef: {},
      },
      amend<TBase extends TAmended, TExt>(
          _base: TBase,
          request = {} as AmendRequest<TBase, TExt>,
      ): () => AmendTarget.Draft<TBase & TExt> {

        const { featureDef: defRequest = {}, ...baseRequest } = request;
        const createBaseTarget = baseTarget.amend(baseRequest as AmendRequest<any>);
        const featureDef = result = FeatureDef.merge(result, defRequest);

        return () => ({
          ...createBaseTarget(),
          featureDef,
        } as AmendTarget.Draft<TBase & TExt>);
      },
    }));

    FeatureDef.define(baseTarget.amendedClass, result);
  }) as FeatureAmendment<TClass, TAmended>;
}

function Feature$toAmender<TClass extends Class, TAmended extends AeFeature<TClass>>(
    amendments: (FeatureDef | Amendment<TAmended>)[],
): Amender<TAmended> {

  const featureDefs: FeatureDef[] = [];
  const featureAmendments: Amendment<TAmended>[] = [];

  for (const amendment of amendments) {
    if (isFeatureAmendment<TClass, TAmended>(amendment)) {
      featureAmendments.push(amendment);
    } else {
      featureDefs.push(amendment);
    }
  }

  if (featureDefs.length) {
    featureAmendments.push(FeatureDef$toAmender(featureDefs));
  }

  return combineAmendments(featureAmendments);
}

function isFeatureAmendment<TClass extends Class, TAmended extends AeFeature<TClass>>(
    amendment: FeatureDef | Amendment<TAmended>,
): amendment is Amendment<TAmended> {
  return typeof amendment === 'function' || isAmendatory(amendment);
}

function FeatureDef$toAmender<TClass extends Class, TAmended extends AeFeature<TClass>>(
    defs: FeatureDef[],
): Amender<TAmended> {
  return ({ amend }: AmendTarget<AeFeature<TClass>>) => {
    amend({
      featureDef: FeatureDef.merge(...defs),
    });
  };
}
