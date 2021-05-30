import { newRenderSchedule, RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextUpRef } from '@proc7ts/context-values/updatable';
import { RenderScheduler$Key } from './render-scheduler.key.impl';

/**
 * Default rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultRenderScheduler = RenderScheduler;

/**
 * A key of bootstrap context value containing {@link DefaultRenderScheduler} instance.
 *
 * Uses the default `RenderScheduler` (`newRenderSchedule()`) for {@link BootstrapWindow bootstrap window} by default.
 *
 * @category Core
 */
export const DefaultRenderScheduler: ContextUpRef<DefaultRenderScheduler, RenderScheduler> = (
    /*#__PURE__*/ new RenderScheduler$Key('default-render-scheduler', newRenderSchedule)
);
