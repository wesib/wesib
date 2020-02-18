import { nextArgs, nextSkip, noop, valueProvider } from 'call-thru';
import { ContextRegistry, ContextValues, ContextValueSpec, SingleContextKey, SingleContextRef } from 'context-values';
import {
  EventEmitter,
  eventSupply,
  EventSupply,
  EventSupply__symbol, eventSupplyOf,
  OnEvent,
  trackValue,
  ValueTracker,
} from 'fun-events';
import { Class } from '../../common';
import {
  ComponentContext as ComponentContext_,
  ComponentContext__symbol,
  ComponentDef,
  ComponentEvent,
  ComponentMount as ComponentMount_,
} from '../../component';
import {
  ComponentClass,
  ComponentFactory as ComponentFactory_,
  DefinitionContext as DefinitionContext_,
  DefinitionSetup,
  ElementDef,
} from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { ComponentContextRegistry } from './component-context-registry.impl';
import { DefinitionContextRegistry } from './definition-context-registry.impl';
import { postDefSetup } from './post-def-setup.impl';
import { WhenComponent } from './when-component.impl';

/**
 * @internal
 */
export interface ElementBuilder {
  readonly definitions: EventEmitter<[DefinitionContext_]>;
  readonly components: EventEmitter<[ComponentContext_]>;
  buildElement<T extends object>(this: void, componentType: ComponentClass<T>): ComponentFactory_<T>;
}

/**
 * @internal
 */
export const ElementBuilder: SingleContextRef<ElementBuilder> = (/*#__PURE__*/ new SingleContextKey<ElementBuilder>(
    'element-builder',
    {
      byDefault: bootstrapDefault(newElementBuilder),
    },
));

const enum ComponentStatus {
  Building,
  Ready,
  Off,
  On,
}

const ComponentStatus__symbol = (/*#__PURE__*/ Symbol('component-status'));

function newElementBuilder(bsContext: BootstrapContext): ElementBuilder {

  const definitionContextRegistry$global = bsContext.get(DefinitionContextRegistry);
  const componentContextRegistry$global = bsContext.get(ComponentContextRegistry);
  const definitions = new EventEmitter<[DefinitionContext_]>();
  const components = new EventEmitter<[ComponentContext_]>();

  return {
    definitions,
    components,
    buildElement<T extends object>(componentType: ComponentClass<T>) {

      const def = ComponentDef.of(componentType);
      const whenComponent = new WhenComponent<T>();
      let componentContextRegistry$perType!: ComponentContextRegistry;
      const ready = trackValue(false);
      const whenReady: OnEvent<[]> = ready.read.thru(cls => cls ? nextArgs() : nextSkip());
      // eslint-disable-next-line prefer-const
      let definitionContext: DefinitionContext;

      function createComponentContextRegistry(): ContextRegistry<ComponentContext_<T>> {
        return componentContextRegistry$global.append(componentContextRegistry$perType);
      }

      class ComponentFactory extends ComponentFactory_ < T > {

        get componentType(): ComponentClass<T> {
          return definitionContext.componentType;
        }

        get elementType(): Class {
          return definitionContext.elementType;
        }

        get elementDef(): ElementDef {
          return definitionContext.elementDef;
        }

        mountTo(element: any): ComponentMount_<T> {
          if (element[ComponentContext__symbol]) {
            throw new Error(`Element ${element} already bound to component`);
          }

          const mount = createComponent({
            definitionContext,
            whenComponent,
            registry: createComponentContextRegistry(),
            element,
            elementSuper(key) {
              return element[key];
            },
            createMount(context: ComponentContext_<T>) {

              class ComponentMount extends ComponentMount_<T> {

                get context(): ComponentContext_<T> {
                  return context;
                }

                get connected(): boolean {
                  return elementStatus(element).it === ComponentStatus.On;
                }

                set connected(value: boolean) {
                  elementStatus(element).it = value ? ComponentStatus.On : ComponentStatus.Off;
                }

                checkConnected(): boolean {

                  const el: Element = element;
                  const doc = el.ownerDocument;

                  return this.connected = doc != null && doc.contains(el);
                }

              }

              return new ComponentMount();
            },
          }).mount as ComponentMount_<T>;

          mount.checkConnected();
          componentCreated(mount.context);

          return mount;
        }

      }

      const componentFactory = new ComponentFactory();

      class DefinitionContext extends DefinitionContext_<T> {

        readonly get: ContextValues['get'];
        readonly whenReady: OnEvent<[this]>;

        get componentType(): ComponentClass<T> {
          return componentType;
        }

        get whenComponent(): OnEvent<[ComponentContext_<T>]> {
          return whenComponent.onCreated;
        }

        get elementType(): Class {
          throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
        }

        constructor() {
          super();

          const context = this;

          this.whenReady = whenReady.thru_(valueProvider(this)).once as OnEvent<[this]>;

          const definitionContextRegistry = new DefinitionContextRegistry(
              definitionContextRegistry$global.seedIn(this),
          );

          definitionContextRegistry.provide({ a: DefinitionContext_, is: this });
          definitionContextRegistry.provide({ a: ComponentFactory_, is: componentFactory });
          this.get = definitionContextRegistry.newValues().get;
          componentContextRegistry$perType = new ComponentContextRegistry(definitionContextRegistry.seedIn(this));

          const definitionSetup: DefinitionSetup<T> = {
            get componentType() {
              return componentType;
            },
            get whenReady() {
              return context.whenReady;
            },
            get whenComponent() {
              return context.whenComponent;
            },
            perDefinition(spec) {
              return definitionContextRegistry.provide(spec);
            },
            perComponent(spec) {
              return componentContextRegistry$perType.provide(spec);
            },
          };

          def.setup?.(definitionSetup);
          postDefSetup(componentType).setup(definitionSetup);
        }

        perComponent<Deps extends any[], Src, Seed>(
            spec: ContextValueSpec<ComponentContext_<T>, any, Deps, Src, Seed>,
        ): () => void {
          return componentContextRegistry$perType.provide(spec);
        }

      }

      definitionContext = new DefinitionContext();

      def.define?.(definitionContext);
      definitions.send(definitionContext);

      const elementType = createElementType(definitionContext, whenComponent, createComponentContextRegistry);

      Object.defineProperty(definitionContext, 'elementType', {
        configurable: true,
        enumerable: true,
        value: elementType,
      });

      ready.it = true;

      return componentFactory;
    },
  };

  function createElementType<T extends object>(
      definitionContext: DefinitionContext_<T>,
      whenComponent: WhenComponent<T>,
      createRegistry: () => ContextRegistry<ComponentContext_<T>>,
  ): Class {

    const elementDef = definitionContext.get(ElementDef);

    class Element extends elementDef.extend.type {

      // Component context reference
      [ComponentContext__symbol]: ComponentContext_<T>;

      constructor() {
        super();

        const context = createComponent({
          definitionContext,
          whenComponent,
          registry: createRegistry(),
          element: this,
          createMount: noop,
          elementSuper: key => super[key],
        });

        componentCreated(context);
      }

      connectedCallback(): void {
        elementStatus(this).it = ComponentStatus.On;
      }

      disconnectedCallback(): void {
        elementStatus(this).it = ComponentStatus.Off;
      }

    }

    return Element;
  }

  function createComponent<T extends object>(
      {
        definitionContext,
        whenComponent,
        registry,
        element,
        createMount,
        elementSuper,
      }: {
        definitionContext: DefinitionContext_<T>;
        whenComponent: WhenComponent<T>;
        registry: ComponentContextRegistry;
        element: any;
        elementSuper(name: PropertyKey): any;
        createMount(context: ComponentContext_<T>): ComponentMount_<T> | undefined;
      },
  ): ComponentContext_<T> {

    const status = trackValue<ComponentStatus>(ComponentStatus.Building);
    const destructionReason = trackValue<[any] | undefined>();

    status.on(noop).whenOff(reason => destructionReason.it = [reason]);

    const destroyed: OnEvent<[any]> = destructionReason.read.thru(reason => reason ? nextArgs(reason[0]) : nextSkip());
    const whenDestroyed: OnEvent<[any]> = destroyed.once;

    const whenOff: OnEvent<[]> = status.read.thru_(sts => sts === ComponentStatus.Off ? nextArgs() : nextSkip());
    const whenOn: OnEvent<[EventSupply]> = status.read.thru_(
        sts => {
          if (sts !== ComponentStatus.On) {
            return nextSkip();
          }

          const offSupply = eventSupply();

          whenOff.once(() => offSupply.off());

          return nextArgs(offSupply);
        },
    );

    let mount: ComponentMount_<T> | undefined;
    const values = registry.newValues();

    class ComponentContext extends ComponentContext_<T> {

      readonly get = values.get;
      readonly elementSuper = elementSuper;
      readonly whenReady: OnEvent<[this]>;

      constructor() {
        super();

        const whenReady: OnEvent<[this]> = status.read.thru(sts => sts ? nextArgs(this) : nextSkip());

        this.whenReady = whenReady.once;
      }

      get componentType(): ComponentClass<T> {
        return definitionContext.componentType;
      }

      get element(): any {
        return element;
      }

      get component(): T {
        throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
      }

      get mount(): ComponentMount_<T> | undefined {
        return mount || (mount = createMount(this));
      }

      get connected(): boolean {
        return status.it === ComponentStatus.On;
      }

      get [EventSupply__symbol](): EventSupply {
        return eventSupplyOf(status);
      }

      get whenOn(): OnEvent<[EventSupply]> {
        return whenOn;
      }

      get whenOff(): OnEvent<[]> {
        return whenOff;
      }

      get whenDestroyed(): OnEvent<[any]> {
        return whenDestroyed;
      }

      destroy(reason?: any): void {
        status.done(reason);
      }

    }

    const context = new ComponentContext();
    let lastRev = 0;

    context.whenDestroyed(() => removeElement(context));
    registry.provide({ a: ComponentContext_, is: context });

    augmentElement();

    whenComponent.readNotifier.once(notifier => lastRev = notifier(context, lastRev));
    context.whenOn(supply => {
      whenComponent.readNotifier({
        supply,
        receive(_, notifier) {
          lastRev = notifier(context, lastRev);
        },
      });
    });
    components.send(context);

    const component = newComponent(definitionContext.componentType, context);

    Object.defineProperty(context, 'component', {
      configurable: true,
      enumerable: true,
      value: component,
    });

    status.it = ComponentStatus.Ready;

    return context;

    function augmentElement(): void {
      Object.defineProperty(element, ComponentContext__symbol, { value: context });
      Object.defineProperty(element, ComponentStatus__symbol, { writable: true, value: status });
    }
  }

}

/**
 * Creates new component of the given type.
 *
 * It makes component context available under `[ComponentContext__symbol]` key in constructed component.
 * The component context is also available inside component constructor by temporarily assigning it to component
 * prototype.
 *
 * @typeparam T  A type of component.
 * @param type  Component class constructor.
 * @param context  Target component context.
 */
function newComponent<T extends object>(type: ComponentClass<T>, context: ComponentContext_<T>): T {

  const proto = type.prototype as any;
  const prevContext = proto[ComponentContext__symbol];

  proto[ComponentContext__symbol] = context;
  try {

    const component = new type(context);

    Object.defineProperty(component, ComponentContext__symbol, { value: context });

    return component;
  } finally {
    proto[ComponentContext__symbol] = prevContext;
  }
}

function elementStatus(element: any): ValueTracker<ComponentStatus> {
  return element[ComponentStatus__symbol];
}

function componentCreated(context: ComponentContext_): void {
  context.whenOn.once(
      () => context.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true })),
  );
}

function removeElement(context: ComponentContext_): void {

  const { element, mount } = context;

  if (mount) {
    mount.connected = false; // Disconnect mounted element
  }

  const parentNode: Element = element.parentElement;

  if (parentNode) {
    parentNode.removeChild(element);
  }
}
