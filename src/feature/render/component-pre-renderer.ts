import { RenderShot } from '@frontmeans/render-scheduler';
import { ComponentPreRendererExecution } from './component-pre-renderer-execution';

/**
 * Component pre-renderer signature.
 *
 * Pre-renders component's content offline (e.g. using a [DocumentFragment]). The pre-rendered content can be applied
 * to the document by {@link ComponentPreRendererExecution.renderBy delegate component renderer}. The latter will be
 * used to render the component after pre-rendering completion.
 *
 * Pre-renderer execution is controlled by {@link ComponentRenderCtl.preRenderBy component render control}.
 *
 * [DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
 *
 * @category Feature
 * @typeParam TExecution - A type of supported component pre-renderer execution context.
 */
export type ComponentPreRenderer<TExecution extends ComponentPreRendererExecution = ComponentPreRendererExecution> =
    RenderShot<TExecution>;
