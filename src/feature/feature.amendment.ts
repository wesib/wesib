import {
  AeClass,
  Amendment,
  AmendRequest,
  AmendTarget,
  ClassAmendment,
  combineAmendments,
  isAmendatory,
  newAmendTarget,
  NoneAmended,
} from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';
import { FeatureDef, FeatureDef__symbol } from './feature-def';

/**
 * An amended entity representing a feature class to amend.
 *
 * @typeParam TClass - A type of amended class.
 */
export interface AeFeature<TClass extends Class = Class> extends AeClass<TClass> {

  /**
   * Amended feature definition.
   */
  readonly featureDef: FeatureDef.Options;

}

/**
 * Feature amendment.
 *
 * @typeParam TClass - Amended feature class type.
 * @typeParam TAmended - Amended feature entity type.
 */
export type FeatureAmendment<TClass extends Class, TAmended extends AeFeature<TClass>> =
    & Amendment<TAmended>
    & {
  readonly [FeatureDef__symbol]?: undefined;
};

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
 * @typeParam TClass - A type of decorated feature class.
 * @param amendments - Feature amendments and definitions.
 *
 * @returns Feature class amendment and decorator.
 */
export function Feature<TClass extends Class = Class, TAmended extends AeFeature<TClass> = AeFeature<TClass>>(
    ...amendments: (FeatureDef | FeatureAmendment<TClass, TAmended>)[]
): ClassAmendment<TClass> {

  const featureDefs: FeatureDef[] = [];
  const featureAmendments: FeatureAmendment<TClass, TAmended>[] = [];

  for (const amendment of amendments) {
    if (isFeatureAmendment<TClass, TAmended>(amendment)) {
      featureAmendments.push(amendment);
    } else {
      featureDefs.push(amendment);
    }
  }

  if (featureDefs.length) {
    featureAmendments.push(FeatureDef$toAmendment(featureDefs));
  }

  const amender = combineAmendments(featureAmendments);

  return AeClass<TClass>(baseTarget => {

    const { amendedClass } = baseTarget;
    let result: FeatureDef.Options = FeatureDef.of(amendedClass);

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
        const createBaseTarget = baseTarget.amend(baseRequest as AmendRequest<TBase>);
        const featureDef = result = FeatureDef.merge(result, defRequest);

        return () => ({
          ...createBaseTarget(),
          featureDef,
        } as AmendTarget.Draft<TBase & TExt>);
      },
    }));

    FeatureDef.define(baseTarget.amendedClass, result);
  });
}

function isFeatureAmendment<TClass extends Class, TAmended extends AeFeature<TClass>>(
    amendment: FeatureDef | FeatureAmendment<TClass, TAmended>,
): amendment is FeatureAmendment<TClass, TAmended> {
  return amendment[FeatureDef__symbol] == null
      && (typeof amendment === 'function' || isAmendatory(amendment));
}

function FeatureDef$toAmendment<TClass extends Class, TAmended extends AeFeature<TClass>>(
    defs: FeatureDef[],
): FeatureAmendment<TClass, TAmended> {
  return ({ amendedClass, amend }: AmendTarget<AeFeature<TClass>>) => {
    amend<NoneAmended>({
      featureDef: FeatureDef.for(
          amendedClass,
          FeatureDef.all(...defs),
      ),
    } as AmendRequest<TAmended>);
  };
}
