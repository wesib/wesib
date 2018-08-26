Web components building blocks
==============================

Example:
```TypeScript
import { AttributeChanged, bootstrapComponents, ComponentContext, WebComponent } from '@webcbb/webcbb';

@WebComponent({
  name: 'greet-text'
})
export class GreetTextComponent {

  constructor(private readonly _context: ComponentContext) {
  }

  @AttributeChanged()
  name(oldValue: string | null, newValue: string) {
    this._context.element.innerText = `Hello, ${newValue}!`;
  }

}

bootstrapComponents(GreetTextComponent);
```

```HTML
<greet-text name="World"></greet-text> 
<script src="path/to/script.js"></script>
```
