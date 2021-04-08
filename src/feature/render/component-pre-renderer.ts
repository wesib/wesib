import { RenderShot } from '@frontmeans/render-scheduler';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';

/**
 * Component pre-renderer signature.
 *
 * Pre-renderers used to build a `DocumentFragment` that will be placed to the the document. This is faster than
 * direct document manipulations.
 *
 * After placing the rendered content to the document, it is possible to {@link ComponentPreRendererExecution.renderBy
 * delegate} component rendering to another component renderer.
 *
 * Pre-renderer execution is controlled by {@link ComponentRenderCtl.preRenderBy component render control}.
 *
 * @category Feature
 * @typeParam TExecution - A type of supported component pre-renderer execution context.
 */
export type ComponentPreRenderer<TExecution extends ComponentPreRendererExecution = ComponentPreRendererExecution> =
    RenderShot<TExecution>;
