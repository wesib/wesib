/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { Class } from '@proc7ts/primitives';
import { Component, ComponentContext, ComponentDecorator, ContentRoot } from '../../component';
import { ComponentClass } from '../../component/definition';
import { ShadowContentRoot } from './shadow-content-root';
import { ShadowRootBuilder } from './shadow-root-builder';

/**
 * @internal
 */
const defaultShadowContentDef: ShadowContentDef = { mode: 'open' };

/**
 * Shadow content root definition.
 *
 * This is a readonly component shadow root initialization options.
 *
 * @category Feature
 */
export type ShadowContentDef = Readonly<ShadowRootInit>;

/**
 * Creates a component decorator that attaches shadow root to decorated component instance.
 *
 * @category Feature
 * @typeparam T  A type of decorated component class.
 * @param def  Shadow content root definition. Uses `mode: 'open'` by default.
 *
 * @returns New component decorator.
 */
export function AttachShadow<T extends ComponentClass = Class>(
    def: ShadowContentDef = defaultShadowContentDef,
): ComponentDecorator<T> {
  return Component({
    setup(setup) {
      setup.perComponent(
          {
            a: ShadowContentRoot,
            by(ctx: ComponentContext<InstanceType<T>>) {
              return ctx.get(ShadowRootBuilder)(ctx, def);
            },
          },
      );
      setup.perComponent({ // Content root is an alias of shadow root when present.
        a: ContentRoot,
        by(context: ComponentContext<InstanceType<T>>) {
          return context.get(ShadowContentRoot, { or: null });
        },
      });
    },
  });
}
