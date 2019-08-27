/**
 * @module @wesib/wesib
 */
import { ContextKey, ContextKey__symbol, ContextValueSpec, SingleContextKey } from 'context-values';
import { OnEvent } from 'fun-events';
import { BootstrapContext } from '../boot';
import { ComponentContext } from '../component';
import { ComponentClass, ComponentFactory, DefinitionContext } from '../component/definition';

const FeatureContext_key = new SingleContextKey<FeatureContext>('feature-context');

/**
 * Feature initialization context.
 */
export abstract class FeatureContext extends BootstrapContext {

  /**
   * A key of feature context value containing the feature context itself.
   */
  static get [ContextKey__symbol](): ContextKey<FeatureContext> {
    return FeatureContext_key;
  }

  get onDefinition(): OnEvent<[DefinitionContext]> {
    return this.get(BootstrapContext).onDefinition;
  }

  get onComponent(): OnEvent<[ComponentContext]> {
    return this.get(BootstrapContext).onComponent;
  }

  whenDefined<C extends object>(componentType: ComponentClass<C>): Promise<ComponentFactory<C>> {
    return this.get(BootstrapContext).whenDefined(componentType);
  }

  /**
   * Provides a value available in each component definition context.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component definition context value specifier.
   */
  perDefinition<D extends any[], S>(spec: ContextValueSpec<DefinitionContext, any, D, S>): void {
    this.get(BootstrapContext).perDefinition(spec);
  }

  /**
   * Provides a value available in each component context.
   *
   * @typeparam D  A type of dependencies.
   * @typeparam S  The type of context value sources.
   * @param spec  Component context value specifier.
   */
  perComponent<D extends any[], S>(spec: ContextValueSpec<ComponentContext, any, D, S>): void {
    this.get(BootstrapContext).perComponent(spec);
  }

  /**
   * Registers bootstrap readiness callback.
   *
   * The registered callback function will be called once bootstrap is complete.
   *
   * If bootstrap is complete already, the callback will be notified immediately.
   *
   * @param callback  A callback to notify on bootstrap completion.
   */
  whenReady(callback: (this: this) => void): void {
    this.get(BootstrapContext).whenReady(() => callback.call(this));
  }

  /**
   * Defines a component.
   *
   * Creates a custom element according to component definition, and registers it with custom elements registry.
   *
   * Note that custom element definition will happen only when all features configuration complete.
   *
   * @typeparam T  A type of component.
   * @param componentType  Component class constructor.
   *
   * @return Custom element class constructor registered as custom element.
   *
   * @throws TypeError  If `componentType` does not contain a component definition.
   */
  abstract define<T extends object>(componentType: ComponentClass<T>): void;

}
