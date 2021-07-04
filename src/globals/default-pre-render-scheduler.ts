import { asyncRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { CxEntry, cxScoped } from '@proc7ts/context-values';
import { BootstrapContext } from '../boot';
import { RenderScheduler$definer } from './render-scheduler.entry.impl';

/**
 * Default pre-rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultPreRenderScheduler = RenderScheduler;

/**
 * Bootstrap context entry containing {@link DefaultPreRenderScheduler} instance.
 *
 * Uses asynchronous `RenderScheduler` (`asyncRenderScheduler`) for {@link BootstrapWindow bootstrap window} by default.
 *
 * @category Core
 */
export const DefaultPreRenderScheduler: CxEntry<DefaultPreRenderScheduler> = {
  perContext: (/*#__PURE__*/ cxScoped(
      BootstrapContext,
      RenderScheduler$definer(asyncRenderScheduler),
  )),
  toString: () => '[DefaultPreRenderScheduler]',
};
