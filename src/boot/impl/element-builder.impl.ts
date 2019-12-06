import { nextArgs, nextSkip, noop } from 'call-thru';
import { ContextKey, ContextKey__symbol, ContextValues, ContextValueSpec, SingleContextKey } from 'context-values';
import { EventEmitter, eventSupply, EventSupply, OnEvent, trackValue, ValueTracker } from 'fun-events';
import { ArraySet, Class } from '../../common';
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
  ElementDef,
} from '../../component/definition';
import { BootstrapContext } from '../bootstrap-context';
import { bootstrapDefault } from '../bootstrap-default';
import { ComponentContextRegistry } from './component-context-registry.impl';
import { DefinitionContextRegistry } from './definition-context-registry.impl';

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

const enum ComponentStatus {
  Building,
  Ready,
  Off,
  On,
}

const ComponentStatus__symbol = /*#__PURE__*/ Symbol('component-status');

function elementStatus(element: any): ValueTracker<ComponentStatus> {
  return element[ComponentStatus__symbol];
}

const ElementBuilder__key = /*#__PURE__*/ new SingleContextKey<ElementBuilder>(
    'element-builder',
    {
      byDefault: bootstrapDefault(context => new ElementBuilder(context)),
    },
);

/**
 * @internal
 */
export class ElementBuilder {

  private readonly _definitionContextRegistry_global: DefinitionContextRegistry;
  private readonly _componentContextRegistry_global: ComponentContextRegistry;
  readonly definitions = new EventEmitter<[DefinitionContext_]>();
  readonly components = new EventEmitter<[ComponentContext_]>();

  static get [ContextKey__symbol](): ContextKey<ElementBuilder> {
    return ElementBuilder__key;
  }

  constructor(context: BootstrapContext) {
    this._definitionContextRegistry_global = context.get(DefinitionContextRegistry);
    this._componentContextRegistry_global = context.get(ComponentContextRegistry);
  }

  buildElement<T extends object>(componentType: ComponentClass<T>): ComponentFactory_<T> {

    const def = ComponentDef.of(componentType);
    const builder = this;
    const onComponent = new EventEmitter<[ComponentContext_]>();
    let componentContextRegistry_perType!: ComponentContextRegistry;
    const ready = trackValue(false);
    const whenReady: OnEvent<[]> = ready.read.thru(cls => cls ? nextArgs() : nextSkip());
    let definitionContext: DefinitionContext;

    function createComponentContextRegistry() {
      return builder._componentContextRegistry_global.append(componentContextRegistry_perType);
    }

    class ComponentFactory extends ComponentFactory_<T> {

      get componentType() {
        return definitionContext.componentType;
      }

      get elementType() {
        return definitionContext.elementType;
      }

      get elementDef() {
        return definitionContext.elementDef;
      }

      mountTo(element: any): ComponentMount_<T> {
        if (element[ComponentContext__symbol]) {
          throw new Error(`Element ${element} already bound to component`);
        }

        const mount = builder._createComponent({
          definitionContext,
          onComponent,
          registry: createComponentContextRegistry(),
          element,
          elementSuper(key) {
            return element[key];
          },
          createMount(context: ComponentContext_<T>) {

            class ComponentMount extends ComponentMount_<T> {

              get context() {
                return context;
              }

              get connected() {
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

      get componentType() {
        return componentType;
      }

      get onComponent() {
        return onComponent.on;
      }

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      constructor() {
        super();

        const definitionContextRegistry =
            new DefinitionContextRegistry(builder._definitionContextRegistry_global.seedIn(this));

        definitionContextRegistry.provide({ a: DefinitionContext_, is: this });
        definitionContextRegistry.provide({ a: ComponentFactory_, is: componentFactory });
        this.get = definitionContextRegistry.newValues().get;
        new ArraySet(def.set).forEach(spec => definitionContextRegistry.provide(spec));

        componentContextRegistry_perType = new ComponentContextRegistry(definitionContextRegistry.seedIn(this));
        new ArraySet(def.perComponent).forEach(spec => componentContextRegistry_perType.provide(spec));
      }

      whenReady(callback: (this: void, elementType: Class) => void) {
        whenReady.once(() => callback(this.elementType));
      }

      perComponent<S>(spec: ContextValueSpec<ComponentContext_, any, any[], S>): void {
        componentContextRegistry_perType.provide(spec);
      }

    }

    definitionContext = new DefinitionContext();

    if (def.define) {
      def.define.call(componentType, definitionContext);
    }
    this.definitions.send(definitionContext);

    const elementType = this._elementType(definitionContext, onComponent, createComponentContextRegistry());

    Object.defineProperty(definitionContext, 'elementType', {
      configurable: true,
      enumerable: true,
      value: elementType,
    });

    ready.it = true;

    return componentFactory;
  }

  private _elementType<T extends object>(
      definitionContext: DefinitionContext_<T>,
      onComponent: EventEmitter<[ComponentContext_<T>]>,
      componentContextRegistry: ComponentContextRegistry,
  ) {

    const builder = this;
    const elementDef = definitionContext.get(ElementDef);

    class Element extends elementDef.extend.type {

      // Component context reference
      [ComponentContext__symbol]: ComponentContext_<T>;

      constructor() {
        super();

        const context = builder._createComponent({
          definitionContext,
          onComponent,
          registry: componentContextRegistry,
          element: this,
          createMount: noop,
          elementSuper: (key) => {
            // @ts-ignore
            return super[key] as any;
          },
        });

        componentCreated(context);
      }

      // noinspection JSUnusedGlobalSymbols
      connectedCallback() {
        elementStatus(this).it = ComponentStatus.On;
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        elementStatus(this).it = ComponentStatus.Off;
      }

    }

    return Element;
  }

  private _createComponent<T extends object>(
      {
        definitionContext,
        onComponent,
        registry,
        element,
        createMount,
        elementSuper,
      }: ComponentMeta<T>,
  ): ComponentContext_<T> {

    const status = trackValue<ComponentStatus>(ComponentStatus.Building);
    const aliveSupply = status.on(noop);
    const whenReady: OnEvent<[]> = status.read.thru(sts => sts ? nextArgs() : nextSkip());
    const whenOff: OnEvent<[]> = status.read.thru(sts => sts === ComponentStatus.Off ? nextArgs() : nextSkip());
    const whenOn: OnEvent<[EventSupply]> = status.read.thru(
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

      get componentType() {
        return definitionContext.componentType;
      }

      get element() {
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

      get whenOn(): OnEvent<[EventSupply]> {
        return whenOn;
      }

      get whenOff(): OnEvent<[]> {
        return whenOff;
      }

      whenReady(callback: (this: void, component: T) => void) {
        whenReady.once(() => callback(this.component));
      }

      whenDestroyed(callback: (this: void, reason: any) => void): void {
        aliveSupply.whenOff(callback);
      }

      destroy(reason?: any): void {
        status.done(reason);
      }

    }

    const context = new ComponentContext();

    context.whenDestroyed(() => removeElement(context));
    registry.provide({ a: ComponentContext_, is: context });

    augmentElement();

    this.components.send(context);
    onComponent.send(context);

    const component = newComponent(definitionContext.componentType, context);

    Object.defineProperty(context, 'component', {
      configurable: true,
      enumerable: true,
      value: component,
    });

    status.it = ComponentStatus.Ready;

    return context;

    function augmentElement() {
      Object.defineProperty(element, ComponentContext__symbol, { value: context });
      Object.defineProperty(element, ComponentStatus__symbol, { writable: true, value: status });
    }
  }

}

interface ComponentMeta<T extends object> {
  definitionContext: DefinitionContext_<T>;
  onComponent: EventEmitter<[ComponentContext_<T>]>;
  registry: ComponentContextRegistry;
  element: any;

  elementSuper(name: PropertyKey): any;

  createMount(context: ComponentContext_<T>): ComponentMount_<T> | undefined;
}

function componentCreated(context: ComponentContext_) {
  context.dispatchEvent(new ComponentEvent('wesib:component', { bubbles: true }));
}

function removeElement(context: ComponentContext_) {

  const { element, mount } = context;

  if (mount) {
    mount.connected = false; // Disconnect mounted element
  }

  const parentNode: Element = element.parentElement;

  if (parentNode) {
    parentNode.removeChild(element);
  }
}
