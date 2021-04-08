import { asyncRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { ContextUpRef } from '@proc7ts/context-values/updatable';
import { RenderScheduler$Key } from './render-scheduler.key.impl';

/**
 * Default pre-rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultPreRenderScheduler = RenderScheduler;

/**
 * A key of bootstrap context value containing {@link DefaultPreRenderScheduler} instance.
 *
 * Uses asynchronous `RenderScheduler` (`asyncRenderScheduler`) for {@link BootstrapWindow bootstrap window} by default.
 *
 * @category Core
 */
export const DefaultPreRenderScheduler: ContextUpRef<DefaultPreRenderScheduler, RenderScheduler> = (
    /*#__PURE__*/ new RenderScheduler$Key('default-pre-render-scheduler', asyncRenderScheduler)
);
