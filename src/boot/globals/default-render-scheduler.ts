import { FnContextKey, FnContextRef } from 'context-values';
import { newRenderSchedule, RenderScheduler } from 'render-scheduler';
import { bootstrapDefault } from '../bootstrap-default';
import { BootstrapWindow } from './bootstrap-window';

/**
 * Default rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultRenderScheduler = RenderScheduler;

/**
 * A key of bootstrap, definition, or component context value containing [[DefaultRenderScheduler]] instance.
 *
 * Uses the default `RenderScheduler` (`newRenderSchedule()`) for {@link BootstrapWindow bootstrap window}.
 *
 * @category Core
 */
export const DefaultRenderScheduler:
    FnContextRef<Parameters<DefaultRenderScheduler>, ReturnType<DefaultRenderScheduler>> = (
    /*#__PURE__*/ new FnContextKey<Parameters<DefaultRenderScheduler>, ReturnType<DefaultRenderScheduler>>(
        'default-render-scheduler',
        {
          byDefault: bootstrapDefault(
              context => (options = {}) => newRenderSchedule({
                ...options,
                window: options.window || context.get(BootstrapWindow),
              }),
          ),
        },
    )
);
