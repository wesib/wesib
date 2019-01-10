import { noop } from 'call-thru';
import { ContextKey, ContextValueSpec } from 'context-values';
import { EventEmitter } from 'fun-events';
import { ArraySet, Class, mergeFunctions } from '../../common';
import {
  ComponentClass,
  ComponentContext as ComponentContext_,
  ComponentDef,
  ComponentMount as ComponentMount_,
} from '../../component';
import {
  ComponentFactory as ComponentFactory_,
  DefinitionContext as DefinitionContext_,
  ElementBaseClass,
} from '../../component/definition';
import { ComponentValueRegistry } from './component-value-registry';
import { DefinitionValueRegistry } from './definition-value-registry';

/**
 * Creates new component of the given type.
 *
 * It makes component context available under `[ComponentContext.symbol]` key in constructed component.
 * The component context is also available inside component constructor by temporarily assigning it to component
 * prototype.
 *
 * @param <T> A type of component.
 * @param type Component class constructor.
 * @param context Target component context.
 */
function newComponent<T extends object>(type: ComponentClass<T>, context: ComponentContext_<T>): T {

  const proto = type.prototype as any;
  const prevContext = proto[ComponentContext_.symbol];

  proto[ComponentContext_.symbol] = context;
  try {

    const component = new type(context);

    Object.defineProperty(component, ComponentContext_.symbol, { value: context });

    return component;
  } finally {
    proto[ComponentContext_.symbol] = prevContext;
  }
}

const CONNECTED = Symbol('connected');
const CONNECT = Symbol('connect');

/**
 * @internal
 */
export class ElementBuilder {

  private readonly _definitionValueRegistry: DefinitionValueRegistry;
  private readonly _componentValueRegistry: ComponentValueRegistry;
  readonly definitions = new EventEmitter<[DefinitionContext_<any>]>();
  readonly components = new EventEmitter<[ComponentContext_<any>]>();

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
    const onComponent = new EventEmitter<[ComponentContext_<any>]>();
    let typeValueRegistry!: ComponentValueRegistry;
    let whenReady: (this: DefinitionContext, elementType: Class) => void = noop;
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

      mountTo(element: any): ComponentMount_<T> {
        if (element[ComponentContext_.symbol]) {
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
                return element[CONNECTED];
              }

              set connected(value: boolean) {
                if (this.connected === value) {
                  return;
                }
                element[CONNECT](value);
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

        return mount;
      }

    }

    const componentFactory = new ComponentFactory();

    class DefinitionContext extends DefinitionContext_<T> {

      readonly componentType: ComponentClass<T> = componentType;
      readonly onComponent = onComponent.on;
      readonly get: <V, S>(key: ContextKey<V, S>, defaultValue: V | null | undefined) => V | null | undefined;

      constructor() {
        super();

        const definitionRegistry = DefinitionValueRegistry.create(builder._definitionValueRegistry.bindSources(this));

        definitionRegistry.provide({ a: DefinitionContext_, is: this });
        definitionRegistry.provide({ a: ComponentFactory_, is: componentFactory });
        new ArraySet(def.set).forEach(spec => definitionRegistry.provide(spec));

        typeValueRegistry = ComponentValueRegistry.create(definitionRegistry.bindSources(this));
        new ArraySet(def.forComponents).forEach(spec => typeValueRegistry.provide(spec));

        this.get = definitionRegistry.newValues().get;
      }

      get elementType(): Class {
        throw new Error('Custom element class is not constructed yet. Consider to use a `whenReady()` callback');
      }

      whenReady(callback: (this: DefinitionContext, elementType: Class) => void) {
        whenReady = mergeFunctions<[Class], void, DefinitionContext>(whenReady, callback);
      }

      forComponents<S>(spec: ContextValueSpec<ComponentContext_<any>, any, any[], S>): void {
        typeValueRegistry.provide(spec);
      }

    }

    definitionContext = new DefinitionContext();

    if (def.define) {
      def.define.call(componentType, definitionContext);
    }
    this.definitions.forEach(listener => listener(definitionContext));

    const elementType = this._elementType(definitionContext, onComponent, createValueRegistry());

    Object.defineProperty(definitionContext, 'elementType', {
      configurable: true,
      enumerable: true,
      value: elementType,
    });
    Object.defineProperty(definitionContext, 'whenReady', {
      configurable: true,
      value(callback: (elementType: Class) => void) {
        callback.call(definitionContext, elementType);
      },
    });

    whenReady.call(definitionContext, elementType);

    return componentFactory;
  }

  private _elementType<T extends object>(
      definitionContext: DefinitionContext_<T>,
      onComponent: EventEmitter<[ComponentContext_<T>]>,
      valueRegistry: ComponentValueRegistry) {

    const builder = this;
    const elementBaseClass = definitionContext.get(ElementBaseClass);

    class Element extends elementBaseClass {

      // Component context reference
      [ComponentContext_.symbol]: ComponentContext_<T>;

      private readonly [CONNECT]: ((value: boolean) => void);
      private [CONNECTED]: boolean;

      constructor() {
        super();
        builder._createComponent({
          definitionContext,
          onComponent,
          valueRegistry,
          element: this,
          createMount: noop,
          elementSuper: (key) => {
            // @ts-ignore
            return super[key] as any;
          }
        });
      }

      // noinspection JSUnusedGlobalSymbols
      connectedCallback() {
        this[CONNECT](true);
      }

      // noinspection JSUnusedGlobalSymbols
      disconnectedCallback() {
        this[CONNECT](false);
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

    let whenReady: (this: ComponentContext, component: T) => void = noop;
    const connectEvents = new EventEmitter<[ComponentContext_<any>]>();
    const disconnectEvents = new EventEmitter<[ComponentContext_<any>]>();
    let mount: ComponentMount_<T> | undefined;

    class ComponentContext extends ComponentContext_<T> {

      readonly componentType = definitionContext.componentType;
      readonly element = element;
      readonly elementSuper = elementSuper;
      readonly get = valueRegistry.newValues().get;
      readonly onConnect = connectEvents.on;
      readonly onDisconnect = disconnectEvents.on;

      get component(): T {
        throw new Error('The component is not constructed yet. Consider to use a `whenReady()` callback');
      }

      get mount(): ComponentMount_<T> | undefined {
        if (mount) {
          return mount;
        }
        return mount = createMount(this);
      }

      get connected() {
        return element[CONNECTED];
      }

      whenReady(callback: (this: ComponentContext, component: T) => void) {
        whenReady = mergeFunctions<[T], void, ComponentContext>(whenReady, callback);
      }

    }

    const context = new ComponentContext();

    valueRegistry.provide({ a: ComponentContext_, is: context });

    Object.defineProperty(element, ComponentContext_.symbol, { value: context });
    Object.defineProperty(element, CONNECTED, { writable: true, value: false });
    Object.defineProperty(element, CONNECT, {
      value(value: boolean) {
        this[CONNECTED] = value;
        (value ? connectEvents : disconnectEvents).notify(context);
      },
    });

    this.components.forEach(consumer => consumer(context));
    onComponent.forEach(consumer => consumer(context));

    const component = newComponent(definitionContext.componentType, context);

    Object.defineProperty(context, 'component', {
      configurable: true,
      enumerable: true,
      value: component,
    });
    Object.defineProperty(context, 'whenReady', {
      configurable: true,
      value(callback: (component: T) => void) {
        callback.call(context, component);
      },
    });

    whenReady.call(context, component);

    return context;
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
