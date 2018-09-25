Wesib: Web Components Building Blocks
=====================================

[![NPM][npm-image]][npm-url]
[![CircleCI][ci-image]][ci-url]
[![codecov][codecov-image]][codecov-url]


[Wesib] provides a lightweight base for web components definition.

Primarily, it provides a way to define custom elements. But instead of inheriting `HTMLElement`, it allows to define
your own type hierarchy and define custom elements programmatically in a very flexible manner.

Wesib provides an IoC container, a component definition and lifecycle callbacks, and an infrastructure for opt-in
features that can involve in component definition process and thus alter the resulting components in very flexible way.

This package provides a core API.

The [@wesib/generic] package provides generic web components and features.

The examples can be found in [@wesib/examples].  

[Wesib]: https://github.com/wesib/wesib 
[@wesib/generic]: https://github.com/wesib/generic
[@wesib/examples]: https://github.com/wesib/examples
[npm-image]: https://img.shields.io/npm/v/@wesib/wesib.svg
[npm-url]: https://www.npmjs.com/package/@wesib/wesib
[ci-image]:https://circleci.com/gh/wesib/wesib.svg?style=shield
[ci-url]:https://circleci.com/gh/wesib/wesib  
[codecov-image]: https://codecov.io/gh/wesib/wesib/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/wesib/wesib 


Components
----------

Wesib allows to define custom components by decorating a component class with `@WesComponent` decorator:
```TypeScript
import { WesComponent } from '@wesib/wesib';

@WesComponent('my-component') // Custom element name
export class MyComponent {
  // ...component definition
}
```
No need to extend `HTMLElement` or any other class. Instead Wesib creates custom element accordingly to its definition
built either programmatically or using component decorators.

To register custom component(s) call `bootstrapComponents()` function like this:
```TypeScript
import { bootstrapComponents } from '@wesib/wesib';

bootstrapComponents(MyComponent);
``` 

After that the custom element can be used anywhere in the document:
```HTML
<my-component></my-component>
```

The component instance is created along with custom element and bound to it. All the logic of custom element is
delegated to bound component instance.


Element Attributes
------------------

To define custom element attributes use `@Attribute` or `@AttributeChanged` component property decorators,
or `@Attributes` component class decorator.
```TypeScript
import { Attribute, AttributeChanged, Attributes, WesComponent } from '@wesib/wesib';

@WesComponent('my-component') // Custom element name
@Attributes({
  'attribute-one': true, // `true` means the component state is updated when attribute value changes   
})
export class MyComponent {

  @Attribute('attribute-two') // Attribute name. When omitted the property name is used
  attribute2!: string | null; // Attribute value is accesses instead.

  @AttributeChanged('attribute-three') // Attribute name. When omitted the method name is used  
  setAttribute3(newValue: string, oldValue: string | null) {
    // This is called on attribute value modification with new and old values
  }
  
}
```

```HTML
<my-component
  attribute-one="1"  <!-- Can be accessed with element's `element.getAttribute("attribute-one")` -->
  attribute-two="2"  <!-- Can be accessed as `attribute2` property of `MyComponent` -->
  attribute-three"3" <!-- Triggers `setAttribute3()` method call -->
></my-component>
```
 

Element Properties
------------------

To define the properties of custom element use a `@DomProperty` component property decorator.
```TypeScript
import { DomProperty, WesComponent } from '@wesib/wesib';

@WesComponent('my-component') // Custom element name
export class MyComponent {

  @DomProperty('elementProperty') // Element property name. The decorated property name is used if omitted.
  customProperty = 12; // Element's `elementProperty` is backed by this one.

}
```

The same can be done for element methods with `@DomMethod` decorator, which is just a convenient alias for
`@DomProperty`.


IoC Container
-------------

Wesib provides contexts for each component and feature (see below). This context can be used to access provided values.

For example, each component class constructor accepts a `ComponentContext` instance as its only argument.

```TypeScript
import { ComponentContext, WesComponent } from '@wesib/wesib';

@WesComponent('my-component') // Custom element name
export class MyComponent {

  private readonly _service: MyService;
  
  constructor(context: ComponentContext) {
    this._service = context.get(MyService.key); // Obtain a `MyService` instance provided by some feature elsewhere.
  }

}
```


Features
--------

Apart from custom elements definition and IoC container, everything in Wesib is an opt-in feature.

Some features are built-in and enabled when appropriate decorator is used. E.g. `AttributesSupport` feature is enabled
when one of element attribute decorators used, `DomPropertiesSupport` is enabled when one of element property decorators
used, etc.

It is possible to define custom features too to extend Wesib. E.g. to augment the components, extend custom elements
(like `@Attribute` or `@DomProperty` decorators do), or provide some context values.

The feature is a class decorated with `@WesFeature` decorator:
```TypeScript
import { BootstrapContext, ComponentContext, DefinitionContext, WesFeature } from '@wesib/wesib';

@WesFeature({
  require: [
    OtherFeature1, // Requires other features to be enabled.
    MyComponent, // The required component will be defined too.  
  ], 
  prebootstrap: [
    { key: GlobalService.key, provide: () => new GlobalService() }, // Provide a `GlobalService` available globally
                                                                    // in all IoC contexts
  ],
  bootstrap(context: BootstrapContext) {
    // Bootstrap the feature by calling methods of provided context.

    context.forDefinitions(
        DefinitionService.key,
        (definitionContext: DefinitionContext) => {
          // Provide a `DefinitionService` available during component definition.
          // Such service will be provided per component class
          // and will be available during custom element construction,
          // e.g. to `onDefinition()` listeners.
          return new DefinitionService(definitionContext);
        });
    context.onDefinition((definitionContext: DefinitionContext) => {
      // Notified on each component definition.

      // The service provided with `forDefinitions()` method above is available here      
      const definitionService = definitionContext.get(DefinitionService.key);
      
      definitionContext.whenReady(() => {
        // This is called when element class is defined.
        console.log(
          `Define element class ${definitionContext.elementType.name}`
          + ` for component of ${definitionContext.componentType.name} type`)        
      });
    });
    context.forComponents((componentContext: ComponentContext) => {
      // Provide a `MyService` available to component instance.
      // Such service will be provided per component instance
      // and will be available to component instance and `onComponent()` listeners.
      return new MyService(componentContext.component);
    });
    context.onComponent((componentContext: ComponentContext) => {
      // Notified on each component instantiation.
      
      // The service provided with `forComponents()` method above is available here      
      const myService = componentContext.get(MyService.key);
      
      componentContext.whenReady(() => {
        // This is called when component is instantiated,
        // which happens right after custom element instantiation.
        console.log(componentContext.element, ` is instantiated for`, componentContext.component);
      });
    });
  }  
})
export class MyFeature {} 
```  

To enable custom feature just pass it to `bootstrapComponents()` like this:
```TypeScript
import { bootstrapComponents } from '@wesib/wesib';

bootstrapComponents(MyFeature);
```

Note that components are kind of features that, when passed to this function (or enabled with `require` option),
register themselves as components.


Component State
---------------

Whenever a component state changes, e.g. when element attribute or property value changes, a state update notification
is issued.

A state update notification can also be issued by calling a `ComponentContext.updateState()` method:
```TypeScript
import { ComponentContext, WesComponent } from '@wesib/wesib';

@WesComponent('my-component') // Custom element name
export class MyComponent {

  data: any;

  constructor(private readonly _context: ComponentContext) {
  }
  
  async loadData() {
    
    const newData = await fetch('/api/data').then(response => response.json());
    const oldData = this.data;
    
    this.data = newData;
    this._context.updateState('data', newData, oldData); // Update the state
  }

}
```

However, the component state update notification is no-op by default. To enable state tracking changes
a `StateSupport` feature must be enabled. Then a `StateTracker` instance will be available in component context.
The state tracker allows to subscribe for component state updates.


Rendering
---------

Wesib core does not provide any mechanics for component rendering. It is completely up to the developer which rendering
mechanics to use: direct DOM manipulations, template processing, virtual DOM, etc.

However, Wesib is able to notify the renderer on component state updates and trigger its rendering. For that a `@Render`
decorator can be applied to component renderer method:
```TypeScript
import { Attribute, ComponentContext, Render, WesComponent } from '@wesib/wesib';

@WesComponent('greet-text')
export class GreetTextComponent {

  @Attribute()
  name: string | null;

  constructor(private readonly _context: ComponentContext) {
  }

  @Render()
  render() {
    this._context.element.innerText = `Hello, ${this.name}!`;
  }

}
```

The `@Render`-decorated method will be called from `requestAnimationFrame()` callback. So, it won't be called too
frequently.

The `@Render` decorator enables `StateSupport` and `RenderSupport` features. The latter provides a per-component
`RenderScheduler` service that is used to schedule component renderer calls.
