import { newRenderSchedule, RenderScheduler } from '@frontmeans/render-scheduler';
import { CxEntry, cxScoped } from '@proc7ts/context-values';
import { BootstrapContext } from '../boot';
import { RenderScheduler$definer } from './render-scheduler.entry.impl';

/**
 * Default rendering tasks scheduler.
 *
 * @category Core
 */
export type DefaultRenderScheduler = RenderScheduler;

/**
 * Bootstrap context entry containing {@link DefaultRenderScheduler} instance.
 *
 * Uses the default `RenderScheduler` (`newRenderSchedule()`) for {@link BootstrapWindow bootstrap window} by default.
 *
 * @category Core
 */
export const DefaultRenderScheduler: CxEntry<DefaultRenderScheduler, RenderScheduler> = {
  perContext: (/*#__PURE__*/ cxScoped(
      BootstrapContext,
      (/*#__PURE__*/ RenderScheduler$definer(newRenderSchedule)),
  )),
  toString: () => '[DefaultRenderScheduler]',
};
