import { nextArgs, nextSkip, noop, valueProvider } from 'call-thru';
import { ContextRegistry, ContextValues, ContextValueSpec, SingleContextKey, SingleContextRef } from 'context-values';
import {
  EventEmitter,
  EventReceiver,
  eventSupply,
  EventSupply,
  EventSupply__symbol,
  eventSupplyOf,
  OnEvent,
  trackValue,
  ValueTracker,
} from 'fun-events';
import { Class } from '../../common';
import {
  ComponentContext,
  ComponentContext__symbol,
  ComponentDef,
  ComponentEvent,
  ComponentMount,
} from '../../component';
import {
  ComponentClass,
  ComponentFactory,
  DefinitionContext,
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
  readonly definitions: EventEmitter<[DefinitionContext]>;
  readonly components: EventEmitter<[ComponentContext]>;
  buildElement<T extends object>(this: void, componentType: ComponentClass<T>): ComponentFactory<T>;
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
  const definitions = new EventEmitter<[DefinitionContext]>();
  const components = new EventEmitter<[ComponentContext]>();

  return {
    definitions,
    components,
    buildElement<T extends object>(componentType: ComponentClass<T>) {

      const def = ComponentDef.of(componentType);
      const whenComponent = new WhenComponent<T>();
      let componentContextRegistry$perType!: ComponentContextRegistry;
      const ready = trackValue(false);
      const whenReady: OnEvent<[]> = ready.read().thru(cls => cls ? nextArgs() : nextSkip());
      // eslint-disable-next-line prefer-const
      let definitionContext: DefinitionContext$;

      function createComponentContextRegistry(): ContextRegistry<ComponentContext<T>> {
        return componentContextRegistry$global.append(componentContextRegistry$perType);
      }

      class ComponentFactory$ extends ComponentFactory < T > {

        get componentType(): ComponentClass<T> {
          return definitionContext.componentType;
        }

        get elementType(): Class {
          return definitionContext.elementType;
        }

        get elementDef(): ElementDef {
          return definitionContext.elementDef;
        }

        mountTo(element: any): ComponentMount<T> {
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
            createMount(context: ComponentContext<T>) {

              class ComponentMount$ extends ComponentMount<T> {

                get context(): ComponentContext<T> {
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

              return new ComponentMount$();
            },
          }).mount as ComponentMount<T>;

          mount.checkConnected();
          componentCreated(mount.context);

          return mount;
        }

      }

      const componentFactory = new ComponentFactory$();

      class DefinitionContext$ extends DefinitionContext<T> {

        readonly get: ContextValues['get'];

        get componentType(): ComponentClass<T> {
          return componentType;
        }

        get elementType(): Class {
          throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
        }

        constructor() {
          super();

          const definitionContextRegistry = new DefinitionContextRegistry(
              definitionContextRegistry$global.seedIn(this),
          );

          definitionContextRegistry.provide({ a: DefinitionContext, is: this });
          definitionContextRegistry.provide({ a: ComponentFactory, is: componentFactory });
          this.get = definitionContextRegistry.newValues().get;
          componentContextRegistry$perType = new ComponentContextRegistry(definitionContextRegistry.seedIn(this));

          const whenReady = this.whenReady().F;
          const whenComponent = this.whenComponent().F;

          const definitionSetup: DefinitionSetup<T> = {
            get componentType() {
              return componentType;
            },
            get whenReady() {
              return whenReady;
            },
            get whenComponent() {
              return whenComponent;
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

        whenReady(): OnEvent<[this]>;
        whenReady(receiver: EventReceiver<[this]>): EventSupply;
        whenReady(receiver?: EventReceiver<[this]>): EventSupply | OnEvent<[this]> {
          return (this.whenReady = (whenReady.thru_(valueProvider(this)).once() as OnEvent<[this]>).F)(receiver);
        }

        whenComponent(): OnEvent<[ComponentContext<T>]>;
        whenComponent(receiver: EventReceiver<[ComponentContext<T>]>): EventSupply;
        whenComponent(receiver?: EventReceiver<[ComponentContext<T>]>): OnEvent<[ComponentContext<T>]> | EventSupply {
          return (this.whenComponent = whenComponent.onCreated.F)(receiver);
        }

        perComponent<Deps extends any[], Src, Seed>(
            spec: ContextValueSpec<ComponentContext<T>, any, Deps, Src, Seed>,
        ): () => void {
          return componentContextRegistry$perType.provide(spec);
        }

      }

      definitionContext = new DefinitionContext$();

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
      definitionContext: DefinitionContext<T>,
      whenComponent: WhenComponent<T>,
      createRegistry: () => ContextRegistry<ComponentContext<T>>,
  ): Class {

    const elementDef = definitionContext.get(ElementDef);

    class Element extends elementDef.extend.type {

      // Component context reference
      [ComponentContext__symbol]: ComponentContext<T>;

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
        definitionContext: DefinitionContext<T>;
        whenComponent: WhenComponent<T>;
        registry: ComponentContextRegistry;
        element: any;
        elementSuper(name: PropertyKey): any;
        createMount(context: ComponentContext<T>): ComponentMount<T> | undefined;
      },
  ): ComponentContext<T> {

    const status = trackValue<ComponentStatus>(ComponentStatus.Building);
    const destructionReason = trackValue<[any] | undefined>();

    eventSupplyOf(status).whenOff(reason => destructionReason.it = [reason]);

    let mount: ComponentMount<T> | undefined;
    const values = registry.newValues();

    class ComponentContext$ extends ComponentContext<T> {

      readonly get = values.get;
      readonly elementSuper = elementSuper;

      get componentType(): ComponentClass<T> {
        return definitionContext.componentType;
      }

      get element(): any {
        return element;
      }

      get component(): T {
        throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
      }

      get mount(): ComponentMount<T> | undefined {
        return mount || (mount = createMount(this));
      }

      get connected(): boolean {
        return status.it === ComponentStatus.On;
      }

      get [EventSupply__symbol](): EventSupply {
        return eventSupplyOf(status);
      }

      whenReady(): OnEvent<[this]>;
      whenReady(receiver: EventReceiver<[this]>): EventSupply;
      whenReady(receiver?: EventReceiver<[this]>): OnEvent<[this]> | EventSupply {
        return (this.whenReady = status.read().thru(sts => sts ? nextArgs(this) : nextSkip()).once().F)(receiver);
      }

      whenOn(): OnEvent<[EventSupply]>;
      whenOn(receiver: EventReceiver<[EventSupply]>): EventSupply;
      whenOn(receiver?: EventReceiver<[EventSupply]>): OnEvent<[EventSupply]> | EventSupply {
        return (this.whenOn = status.read().thru_(
            sts => {
              if (sts !== ComponentStatus.On) {
                return nextSkip();
              }

              const offSupply = eventSupply();

              this.whenOff().once(() => offSupply.off()).cuts(offSupply);

              return nextArgs(offSupply);
            },
        ).F)(receiver);
      }

      whenOff(): OnEvent<[]>;
      whenOff(receiver: EventReceiver<[]>): EventSupply;
      whenOff(receiver?: EventReceiver<[]>): EventSupply | OnEvent<[]> {
        return (this.whenOff = status.read().thru_(
            sts => sts === ComponentStatus.Off ? nextArgs() : nextSkip(),
        ).F)(receiver);
      }

      whenDestroyed(): OnEvent<[any]>;
      whenDestroyed(receiver: EventReceiver<[any]>): EventSupply;
      whenDestroyed(receiver?: EventReceiver<[any]>): OnEvent<[any]> | EventSupply {
        return (this.whenDestroyed = destructionReason.read().thru(
            reason => reason ? nextArgs(reason[0]) : nextSkip(),
        ).once().F)(receiver);
      }

      destroy(reason?: any): void {
        status.done(reason);
      }

    }

    const context = new ComponentContext$();
    let lastRev = 0;

    context.whenDestroyed(() => removeElement(context));
    registry.provide({ a: ComponentContext, is: context });

    augmentElement();

    whenComponent.readNotifier.once(notifier => lastRev = notifier(context, lastRev));
    context.whenOn(supply => {
      whenComponent.readNotifier.to({
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
function newComponent<T extends object>(type: ComponentClass<T>, context: ComponentContext<T>): T {

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

function componentCreated(context: ComponentContext): void {
  context.whenOn().once(
      () => context.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true })),
  );
}

function removeElement(context: ComponentContext): void {

  const { element, mount } = context;

  if (mount) {
    mount.connected = false; // Disconnect mounted element
  }

  const parentNode: Element = element.parentElement;

  if (parentNode) {
    parentNode.removeChild(element);
  }
}
