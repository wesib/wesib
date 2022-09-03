import {
  AeClass,
  AeMember,
  allAmender,
  Amendment,
  AmendTarget,
  MemberAmendment,
} from '@proc7ts/amend';
import { Class } from '@proc7ts/primitives';
import { AeComponent, Component } from './component.amendment';
import { ComponentClass } from './definition';

/**
 * An amended entity representing a component member to amend.
 *
 * @category Core
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 */
export interface AeComponentMember<
  TValue extends TUpdate,
  TClass extends ComponentClass = Class,
  TUpdate = TValue,
> extends AeComponent<TClass>,
    AeMember<TValue, TClass, TUpdate> {}

/**
 * An amendment target representing a component member to amend.
 *
 * @category Core
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - Amended component member entity type.
 */
export type AeComponentMemberTarget<
  TValue extends TUpdate,
  TClass extends ComponentClass = Class,
  TUpdate = TValue,
  TAmended extends AeComponentMember<TValue, TClass, TUpdate> = AeComponentMember<
    TValue,
    TClass,
    TUpdate
  >,
> = AmendTarget<TAmended>;

/**
 * Component member amendment.
 *
 * Constructed by {@link ComponentMember} function.
 *
 * @category Core
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - Amended component member entity type.
 */
export type ComponentMemberAmendment<
  TValue extends TUpdate,
  TClass extends ComponentClass = Class,
  TUpdate = TValue,
  TAmended extends AeComponentMember<TValue, TClass, TUpdate> = AeComponentMember<
    TValue,
    TClass,
    TUpdate
  >,
> = MemberAmendment.ForBase<
  AeClass<TClass>,
  AeComponentMember<TValue, TClass, TUpdate>,
  TValue,
  TClass,
  TUpdate,
  TAmended
>;

/**
 * Creates an amendment (and decorator) for the component instance member.
 *
 * @category Core
 * @typeParam TValue - Amended member value type.
 * @typeParam TClass - Amended component class type.
 * @typeParam TUpdate - Amended member update type accepted by its setter.
 * @typeParam TAmended - Amended component member entity type.
 * @param amendments - Amendments to apply.
 *
 * @returns New component member amendment instance.
 */
export function ComponentMember<
  TValue extends TUpdate,
  TClass extends ComponentClass = Class,
  TUpdate = TValue,
  TAmended extends AeComponentMember<TValue, TClass, TUpdate> = AeComponentMember<
    TValue,
    TClass,
    TUpdate
  >,
>(
  ...amendments: Amendment<TAmended>[]
): ComponentMemberAmendment<TValue, TClass, TUpdate, TAmended> {
  return AeMember<TValue, TClass, TUpdate, TAmended>(
    Component<TClass, TAmended>(allAmender(amendments)),
  ) as ComponentMemberAmendment<TValue, TClass, TUpdate, TAmended>;
}
