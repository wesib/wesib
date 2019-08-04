import { noop } from 'call-thru';
import { ContextValues, ContextValueSpec } from 'context-values';
import { EventEmitter, OnEvent, onEventBy, receiveEventsBy } from 'fun-events';
import { ArraySet, Class, mergeFunctions } from '../../common';
import {
  ComponentClass,
  ComponentContext as ComponentContext_,
  ComponentContext__symbol,
  ComponentDef,
  ComponentEvent,
  ComponentMount as ComponentMount_,
} from '../../component';
import {
  ComponentFactory as ComponentFactory_,
  DefinitionContext as DefinitionContext_,
  ElementDef,
} from '../../component/definition';
import { ComponentValueRegistry } from './component-value-registry.impl';
import { DefinitionValueRegistry } from './definition-value-registry.impl';

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

const connected__symbol = /*#__PURE__*/ Symbol('connected');
const connect__symbol = /*#__PURE__*/ Symbol('connect');

/**
 * @internal
 */
export class ElementBuilder {

  private readonly _definitionValueRegistry: DefinitionValueRegistry;
  private readonly _componentValueRegistry: ComponentValueRegistry;
  readonly definitions = new EventEmitter<[DefinitionContext_]>();
  readonly components = new EventEmitter<[ComponentContext_]>();

  static create(opts: {
    definitionValueRegistry: DefinitionValueRegistry;
    componentValueRegistry: ComponentValueRegistry;
  }): ElementBuilder {
    return new ElementBuilder(opts);
  }

  private constructor(
      {
        definitionValueRegistry,
        componentValueRegistry,
      }: {
        definitionValueRegistry: DefinitionValueRegistry;
        componentValueRegistry: ComponentValueRegistry;
      }) {
    this._definitionValueRegistry = definitionValueRegistry;
    this._componentValueRegistry = componentValueRegistry;
  }

  buildElement<T extends object>(componentType: ComponentClass<T>): ComponentFactory_<T> {

    const def = ComponentDef.of(componentType);
    const builder = this;
    const onComponent = new EventEmitter<[ComponentContext_]>();
    let typeValueRegistry!: ComponentValueRegistry;
    let whenReady: (this: void, elementType: Class) => void = noop;
    let registerWhenReady = (callback: (this: void, elementType: Class) => void) => {
      whenReady = mergeFunctions(whenReady, callback);
    };
    let definitionContext: DefinitionContext;

    function createValueRegistry() {
      return builder._componentValueRegistry.append(typeValueRegistry);
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
          valueRegistry: createValueRegistry(),
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
                return element[connected__symbol];
              }

              set connected(value: boolean) {
                if (this.connected === value) {
                  return;
                }
                element[connect__symbol](value);
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
    let values: ContextValues;

    class DefinitionContext extends DefinitionContext_<T> {

      get componentType() {
        return componentType;
      }

      get onComponent() {
        return onComponent.on;
      }

      get get() {
        return values.get;
      }

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      constructor() {
        super();

        const definitionRegistry = DefinitionValueRegistry.create(builder._definitionValueRegistry.bindSources(this));

        definitionRegistry.provide({ a: DefinitionContext_, is: this });
        definitionRegistry.provide({ a: ComponentFactory_, is: componentFactory });
        values = definitionRegistry.newValues();
        new ArraySet(def.set).forEach(spec => definitionRegistry.provide(spec));

        typeValueRegistry = ComponentValueRegistry.create(definitionRegistry.bindSources(this));
        new ArraySet(def.perComponent).forEach(spec => typeValueRegistry.provide(spec));
      }

      whenReady(callback: (this: void, elementType: Class) => void) {
        registerWhenReady(callback);
      }

      perComponent<S>(spec: ContextValueSpec<ComponentContext_, any, any[], S>): void {
        typeValueRegistry.provide(spec);
      }

    }

    definitionContext = new DefinitionContext();

    if (def.define) {
      def.define.call(componentType, definitionContext);
    }
    this.definitions.send(definitionContext);

    const elementType = this._elementType(definitionContext, onComponent, createValueRegistry());

    Object.defineProperty(definitionContext, 'elementType', {
      configurable: true,
      enumerable: true,
      value: elementType,
    });

    definitionIsReady();

    return componentFactory;

    function definitionIsReady() {

      const _whenReady = whenReady;

      registerWhenReady = callback => callback(elementType);
      whenReady = noop;
      _whenReady(elementType);
    }
  }

  private _elementType<T extends object>(
      definitionContext: DefinitionContext_<T>,
      onComponent: EventEmitter<[ComponentContext_<T>]>,
      valueRegistry: ComponentValueRegistry) {

    const builder = this;
    const elementDef = definitionContext.get(ElementDef);

    class Element extends elementDef.extend.type {

      // Component context reference
      [ComponentContext__symbol]: ComponentContext_<T>;

      private readonly [connect__symbol]: ((value: boolean) => void);

      constructor() {
        super();

        const context = builder._createComponent({
          definitionContext,
          onComponent,
          valueRegistry,
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
        this[connect__symbol](true);
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        this[connect__symbol](false);
      }

    }

    return Element;
  }

  private _createComponent<T extends object>(
      {
        definitionContext,
        onComponent,
        valueRegistry,
        element,
        createMount,
        elementSuper,
      }: ComponentMeta<T>): ComponentContext_<T> {

    let ready = false;
    let whenReady: (this: void, component: T) => void = noop;
    let registerWhenReady = (callback: (this: void, component: T) => void) => {
      whenReady = mergeFunctions(whenReady, callback);
    };
    const connectEvents = new EventEmitter<[]>();
    const whenOn = onEventBy<[]>(receiver => {

      const interest = connectEvents.on(receiver);

      if (isConnected()) {
        receiveEventsBy(receiver)();
      }

      return interest;
    });
    const disconnectEvents = new EventEmitter<[]>();
    const whenOff = onEventBy<[]>(receiver => {

      const interest = disconnectEvents.on(receiver);

      if (!isConnected() && ready) {
        receiveEventsBy(receiver)();
      }

      return interest;
    });
    let mount: ComponentMount_<T> | undefined;
    const values = valueRegistry.newValues();

    let whenDestroyed = (reason: any) => {
      disconnectEvents.done(reason);
      connectEvents.done(reason);
    };
    let registerWhenDestroyed = (callback: (this: void, reason: any) => void) => {
      whenDestroyed = mergeFunctions(callback, whenDestroyed);
    };
    let destroy = destroyComponent;

    class ComponentContext extends ComponentContext_<T> {

      get componentType() {
        return definitionContext.componentType;
      }

      get element() {
        return element;
      }

      get elementSuper() {
        return elementSuper;
      }

      get get() {
        return values.get;
      }

      get component(): T {
        throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
      }

      get mount(): ComponentMount_<T> | undefined {
        return mount || (mount = createMount(this));
      }

      get connected(): boolean {
        return isConnected();
      }

      get whenOn(): OnEvent<[]> {
        return whenOn;
      }

      get whenOff(): OnEvent<[]> {
        return whenOff;
      }

      whenReady(callback: (this: void, component: T) => void) {
        registerWhenReady(callback);
      }

      whenDestroyed(callback: (this: void, reason: any) => void): void {
        registerWhenDestroyed(callback);
      }

      destroy(reason?: any): void {
        destroy(reason);
      }

    }

    const context = new ComponentContext();

    valueRegistry.provide({ a: ComponentContext_, is: context });

    augmentElement();

    this.components.send(context);
    onComponent.send(context);

    const component = newComponent(definitionContext.componentType, context);

    Object.defineProperty(context, 'component', {
      configurable: true,
      enumerable: true,
      value: component,
    });

    componentIsReady();

    return context;

    function augmentElement() {

      Object.defineProperty(element, ComponentContext__symbol, { value: context });
      Object.defineProperty(element, connected__symbol, { writable: true, value: false });
      Object.defineProperty(element, connect__symbol, {
        value(value: boolean) {
          this[connected__symbol] = value;
          (value ? connectEvents : disconnectEvents).send();
        },
      });
    }

    function isConnected(): boolean {
      return element[connected__symbol];
    }

    function componentIsReady() {

      const _whenReady = whenReady;

      ready = true;
      registerWhenReady = callback => callback(component);
      whenReady = noop;
      _whenReady(component);
    }

    function destroyComponent(reason?: any) {

      const _whenDestroyed = whenDestroyed;

      whenDestroyed = noop;
      destroy = noop;

      registerWhenDestroyed = callback => callback(reason);
      removeElement(context);
      _whenDestroyed(reason);
    }
  }

}

interface ComponentMeta<T extends object> {
  definitionContext: DefinitionContext_<T>;
  onComponent: EventEmitter<[ComponentContext_<T>]>;
  valueRegistry: ComponentValueRegistry;
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
