/**
 * @packageDocumentation
 * @module @wesib/wesib
 */
import { RenderExecution } from '@proc7ts/render-scheduler';

/**
 * Component's element renderer signature.
 *
 * It has no arguments. It may return either nothing, or a function. In the latter case the returned function will be
 * called immediately to render the element. It may, in turn, return a renderer function, and so on.
 *
 * Renderer execution is controlled by {@link ElementRenderCtl element render control}.
 *
 * @category Feature
 */
export type ElementRenderer =
/**
 * @param execution  Render shot execution context.
 *
 * @returns Either delegated renderer, or nothing.
 */
    (
        this: void,
        execution: RenderExecution,
    ) => void | ElementRenderer;
