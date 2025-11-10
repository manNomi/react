
## Input

```javascript
import {knownIncompatible} from 'ReactCompilerKnownIncompatibleTest';

function Component() {
  const data = knownIncompatible();
  return <div>Error</div>;
}

```


## Error

```
Found 1 error:

Compilation Skipped: Use of incompatible library

❌ This component/hook will NOT be memoized by React Compiler.

This API returns functions which cannot be memoized without leading to stale UI.
Returns new object references on every render, which breaks memoization of parent components.

**Recommended solutions:**
1. Add "use no memo" directive to explicitly opt-out of memoization
2. Use this API directly in components (not in custom hooks)
3. Consider alternative approaches that don't return functions

error.invalid-known-incompatible-function.ts:4:15
  2 |
  3 | function Component() {
> 4 |   const data = knownIncompatible();
   |                ^^^^^^^^^^^^^^^^^ useKnownIncompatible is known to be incompatible
  5 |   return <div>Error</div>;
  6 | }
  7 |
```
          
      