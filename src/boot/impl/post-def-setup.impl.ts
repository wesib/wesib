import { nextArgs, nextSkip } from '@proc7ts/call-thru';
import { EventEmitter, onAny, OnEvent, onEventBy, trackValue } from '@proc7ts/fun-events';
import { superClassOf } from '@proc7ts/primitives';
import { ComponentDef__symbol } from '../../component';
import { ComponentClass, DefinitionSetup } from '../../component/definition';
import { Unloader } from './unloader.impl';

/**
 * @internal
 */
export function onPostDefSetup(
    componentType: ComponentClass,
    unloader: Unloader,
): OnEvent<[DefinitionSetup]> {

  const { on } = postDefSetup(componentType);

  return onEventBy(receiver => {
    on.to({
      supply: receiver.supply.needs(unloader.supply),
      receive(ctx, setup) {

        const whenReady = setup.whenReady().tillOff(unloader.supply).F;
        const whenComponent = setup.whenComponent().tillOff(unloader.supply).F;

        receiver.receive(ctx, {
          get componentType() {
            return setup.componentType;
          },
          get whenReady() {
            return whenReady;
          },
          get whenComponent() {
            return whenComponent;
          },
          perDefinition(spec) {
            return unloader.add(() => setup.perDefinition(spec));
          },
          perComponent(spec) {
            return unloader.add(() => setup.perComponent(spec));
          },
        });
      },
    });
  });
}

/**
 * @internal
 */
export interface PostDefSetup<T extends object = any> {
  readonly on: OnEvent<[DefinitionSetup<T>]>;
  send(setup: DefinitionSetup): void;
  setup(setup: DefinitionSetup<T>): void;
}

const PostDefSetup__symbol = (/*#__PURE__*/ Symbol('post-def-setup'));

interface PostDefComponentClass<T extends object> extends ComponentClass<T> {
  [PostDefSetup__symbol]?: PostDefSetup<T>;
}

/**
 * @internal
 */
export function postDefSetup<T extends object>(componentType: PostDefComponentClass<T>): PostDefSetup<T> {
  // eslint-disable-next-line no-prototype-builtins
  if (componentType.hasOwnProperty(PostDefSetup__symbol)) {
    return componentType[PostDefSetup__symbol] as PostDefSetup<T>;
  }

  const tracker = trackValue<DefinitionSetup<T>>();
  const emitter = new EventEmitter<[DefinitionSetup]>();
  const onSetup: OnEvent<[DefinitionSetup<T>]> = tracker.read().thru(setup => setup ? nextArgs(setup) : nextSkip());
  const on = onAny(onSetup, emitter);
  const superType = superClassOf(componentType, type => ComponentDef__symbol in type);

  if (superType) {

    const superPostDefSetup = postDefSetup(superType);

    on.to(setup => superPostDefSetup.send(setup));
  }

  const result: PostDefSetup<T> = {
    on,
    send(setup) {
      emitter.send(setup);
    },
    setup(setup) {
      tracker.it = setup;
    },
  };

  Object.defineProperty(componentType, PostDefSetup__symbol, { value: result });

  return result;
}
