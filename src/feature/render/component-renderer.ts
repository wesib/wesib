import { RenderExecution } from '@frontmeans/render-scheduler';

/**
 * Component renderer signature.
 *
 * It may return either nothing, or a function. In the latter case the returned function will be called immediately to
 * render the component. It may, in turn, return a renderer function, and so on.
 *
 * Renderer execution is controlled by {@link ComponentRenderCtl component render control}.
 *
 * @category Feature
 * @typeParam TExecution - A type of supported execution context.
 */
export type ComponentRenderer<TExecution extends RenderExecution = RenderExecution> =
/**
 * @param execution - Render shot execution context.
 *
 * @returns Either delegated renderer, or nothing.
 */
    (
        this: void,
        execution: TExecution,
    ) => void | ComponentRenderer<TExecution>;
