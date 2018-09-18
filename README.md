Web components building blocks
==============================

[![CircleCI](https://circleci.com/gh/wesib/wesib.svg?style=shield)](https://circleci.com/gh/wesib/wesib)

Example:
```TypeScript
import { AttributeChanged, bootstrapComponents, ComponentContext, WesComponent } from '@wesib/wesib';

@WesComponent('greet-text')
export class GreetTextComponent {

  constructor(private readonly _context: ComponentContext) {
  }

  @AttributeChanged()
  name(newValue: string) {
    this._context.element.innerText = `Hello, ${newValue}!`;
  }

}

bootstrapComponents(GreetTextComponent);
```

```HTML
<greet-text name="World"></greet-text> 
<script src="path/to/script.js"></script>
```
