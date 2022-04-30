# Wesib: Web Components Building Blocks

[![NPM][npm-image]][npm-url]
[![Build Status][build-status-img]][build-status-link]
[![Code Quality][quality-img]][quality-link]
[![Coverage][coverage-img]][coverage-link]
[![GitHub Project][github-image]][github-url]
[![API Documentation][api-docs-image]][api-docs-url]

[Wesib] is a base for web components definition.

It provides a way to define custom elements. But instead of extending `HTMLElement`, it supports arbitrary component
classes, and defines custom elements for them programmatically.

Wesib provides an IoC container, a component definition and lifecycle callbacks, and an infrastructure for opt-in
features that can involve in component definition process and thus alter the resulting components in very flexible way.

This package provides a core API.

The [@wesib/generic] package provides generic web components and features.

The examples can be found in [@wesib/examples].

[wesib]: https://github.com/wesib/wesib
[@wesib/generic]: https://github.com/wesib/generic
[@wesib/examples]: https://github.com/wesib/examples
[npm-image]: https://img.shields.io/npm/v/@wesib/wesib.svg?logo=npm
[npm-url]: https://www.npmjs.com/package/@wesib/wesib
[build-status-img]: https://github.com/wesib/wesib/workflows/Build/badge.svg
[build-status-link]: https://github.com/wesib/wesib/actions?query=workflow:Build
[quality-img]: https://app.codacy.com/project/badge/Grade/0c3bc9bce2024d7ba37566073d3f29f6
[quality-link]: https://www.codacy.com/gh/wesib/wesib/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wesib/wesib&utm_campaign=Badge_Grade
[coverage-img]: https://app.codacy.com/project/badge/Coverage/0c3bc9bce2024d7ba37566073d3f29f6
[coverage-link]: https://www.codacy.com/gh/wesib/wesib/dashboard?utm_source=github.com&utm_medium=referral&utm_content=wesib/wesib&utm_campaign=Badge_Coverage
[github-image]: https://img.shields.io/static/v1?logo=github&label=GitHub&message=project&color=informational
[github-url]: https://github.com/wesib/wesib
[api-docs-image]: https://img.shields.io/static/v1?logo=typescript&label=API&message=docs&color=informational
[api-docs-url]: https://wesib.github.io/wesib/

## Components

Wesib allows defining custom element by decorating a component class with `@Component` decorator:

```typescript
import { Component } from '@wesib/wesib';

@Component('my-component') // Custom element name
export class MyComponent {
  // ...component definition
}
```

No need to extend `HTMLElement` or any other class. Instead, Wesib creates a custom element accordingly to its
definition built either programmatically or using component decorators.

To register custom component(s) call `bootstrapComponents()` function like this:

```typescript
import { bootstrapComponents } from '@wesib/wesib';

bootstrapComponents(MyComponent);
```

After that the custom element can be used anywhere in the document:

```html
<my-component></my-component>
```

The component instance created along with a custom element and bound to it. All the logic of custom element delegated
to the bound component instance.

## Element Attributes

To define custom element attributes use `@Attribute` or `@AttributeChanged` component property decorators,
or `@Attributes` component class decorator.

```typescript
import { Attribute, AttributeChanged, Attributes, Component } from '@wesib/wesib';

@Component('my-component') // Custom element name
@Attributes('attribute-one', 'another-attribute')
export class MyComponent {
  @Attribute('attribute-two') // Attribute name. When omitted the property name is used
  attribute2!: string | null; // Attribute value is accessed instead.

  @AttributeChanged('attribute-three') // Attribute name. When omitted the method name is used
  setAttribute3(newValue: string, oldValue: string | null) {
    // This is called on attribute value modification with new and old values
  }
}
```

```html
<my-component
    attribute-one="1"  <!-- Can be accessed with element's `element.getAttribute("attribute-one")` -->
    attribute-two="2"  <!-- Can be accessed as `attribute2` property of `MyComponent` -->
    attribute-three"3" <!-- Triggers `setAttribute3()` method call -->
></my-component>
```

## Element Properties

To define the properties of custom element use a `@DomProperty` component property decorator.

```typescript
import { Component, DomProperty } from '@wesib/wesib';

@Component('my-component') // Custom element name
export class MyComponent {
  @DomProperty('elementProperty') // Element property name. The decorated property name is used if omitted.
  customProperty = 12; // Element's `elementProperty` is backed by this one.
}
```

The same can be done for element methods with `@DomMethod` decorator, which is just a convenient alias for
`@DomProperty`.

## IoC Container

Wesib provides contexts for each component and feature (see below). This context can be used to access provided values.

For example, each component class constructor accepts a `ComponentContext` instance as its only argument.

```typescript
import { Component, ComponentContext } from '@wesib/wesib';

@Component('my-component') // Custom element name
export class MyComponent {
  private readonly _service: MyService;

  constructor(context: ComponentContext) {
    this._service = context.get(MyService); // Obtain a `MyService` instance provided by some feature elsewhere.
  }
}
```

IoC container implementation is based on [@proc7ts/context-values].

[@proc7ts/context-values]: https://npmjs.com/package/@proc7ts/context-values

## Features

Apart from custom elements definition and IoC container, everything in Wesib is an opt-in feature.

It is possible to define custom features to extend Wesib. E.g. to define or augment existing components, extend custom
elements (like `@Attribute` or `@DomProperty` decorators do), or provide some context values.

The feature is a class decorated with `@Feature` decorator:

```typescript
import { cxBuildAsset } from '@proc7ts/context-builder';
import { ComponentContext, DefinitionContext, Feature, FeatureContext, FeatureSetup } from '@wesib/wesib';

@Feature({
  needs: [
    OtherFeature1, // Requires other features to be enabled.
    MyComponent, // The required component will be defined too.
  ],
  setup(setup: FeatureSetup) {
    setup.provide(
      cxBuildAsset(
        GlobalService, // Provide a `GlobalService` available globally
        () => new GlobalService(), // in all IoC contexts
      ),
    );
    setup.perDefinition(
      cxBuildAsset(DefinitionService, ({ context: definitionContext }) => {
        // Provide a `DefinitionService` available during component definition.
        // Such service will be provided per component class
        // and will be available during custom element construction,
        // e.g. to `onDefinition()` listeners.
        return new DefinitionService(definitionContext);
      }),
    );
    setup.perComponent(
      cxBuildAsset(MyService, ({ context: componentContext }) => {
        // Provide a `MyService` available to components.
        // Such service will be provided per component instance
        // and will be available to component instance and `onComponent()` listeners.
        return new MyService(componentContext.component);
      }),
    );
  },
  init(context: FeatureContext) {
    // Bootstrap the feature by calling methods of provided context.

    context.onDefinition((definitionContext: DefinitionContext) => {
      // Notified on each component definition.

      // The service provided with `perDefinition()` method above is available here
      const definitionService = definitionContext.get(DefinitionService);

      definitionContext.whenReady(() => {
        // This is called when element class is defined.
        console.log(
          `Define element class ${definitionContext.elementType.name}` +
            ` for component of ${definitionContext.componentType.name} type`,
        );
      });
    });
    context.onComponent((componentContext: ComponentContext) => {
      // Notified on each component instantiation.

      // The service provided with `perComponent()` method above is available here
      const myService = componentContext.get(MyService);

      componentContext.whenReady(() => {
        // This is called when component is instantiated,
        // which happens right after custom element instantiation.
        console.log(componentContext.element, ` is instantiated for`, componentContext.component);
      });
    });
  },
})
export class MyFeature {}
```

To enable a custom feature just pass it to `bootstrapComponents()` like this:

```typescript
import { bootstrapComponents } from '@wesib/wesib';

bootstrapComponents(MyFeature);
```

Note that components are kind of features that, when passed to this function (or enabled with `needs` option),
register themselves as components.

## Component State

Whenever a component state changes, e.g. when element attribute or property value changes, a state update notification
issued.

A state update notification can also be issued by calling a `ComponentContext.updateState()` method:

```typescript
import { Component, ComponentContext } from '@wesib/wesib';

@Component('my-component') // Custom element name
export class MyComponent {
  data: any;

  constructor(private readonly _context: ComponentContext) {}

  async loadData() {
    const newData = await fetch('/api/data').then(response => response.json());
    const oldData = this.data;

    this.data = newData;
    this._context.updateState('data', newData, oldData); // Update the state
  }
}
```

A `ComponentState` instance available in component context allows to track the component state updates.

## Shadow DOM

It is possible to attach shadow root to custom element by decorating the component with `@AttachShadow` decorator.

If shadow DOM is supported, then a shadow root will be attached to element. Otherwise, an element itself will be used
as shadow root. In both cases the shadow root will be available in component context under `[ShadowContentRoot]` key.

A `ComponentContext.contentRoot` property is always available. It either contains a shadow root, or element itself.
This is a root DOM node component element contents.

## Rendering

Wesib core does not provide any mechanics for component rendering. It is completely up to the developer which rendering
mechanics to use: direct DOM manipulations, template processing, virtual DOM, etc.

However, Wesib is able to notify the renderer on component state updates and trigger its rendering. For that a `@Render`
decorator can be applied to component renderer method:

```typescript
import { Attribute, Component, ComponentContext, Render } from '@wesib/wesib';

@Component('greet-text')
export class GreetTextComponent {
  @Attribute()
  name: string | null;

  constructor(private readonly _context: ComponentContext) {}

  @Render()
  render() {
    this._context.contentRoot.innerText = `Hello, ${this.name}!`;
  }
}
```

The `@Render`-decorated method will be called from `requestAnimationFrame()` callback by default. So, it won't be
called too frequently.
