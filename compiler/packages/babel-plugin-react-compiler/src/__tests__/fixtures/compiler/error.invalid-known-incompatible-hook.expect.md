
## Input

```javascript
import {useKnownIncompatible} from 'ReactCompilerKnownIncompatibleTest';

function Component() {
  const data = useKnownIncompatible();
  return <div>Error</div>;
}

```


## Error

```
Found 1 error:

Compilation Skipped: Use of incompatible library

⚠️  This API returns functions which cannot be memoized without leading to stale UI.

**Impact:**
• This component/hook will NOT be memoized by React Compiler
• Returns new object references on every render
• Breaks memoization of parent components
• May cause performance issues

**Recommended solutions:**
1. List all dependencies correctly in your effect/memo hooks
2. Add "use no memo" directive to explicitly opt-out of memoization
3. Use incompatible APIs directly in components (not in custom hooks)

**Note:** This warning appears even with eslint-disable comments. This is intentional to ensure you're aware of the memoization impact.

error.invalid-known-incompatible-hook.ts:4:15
  2 |
  3 | function Component() {
> 4 |   const data = useKnownIncompatible();
    |                ^^^^^^^^^^^^^^^^^^^^ useKnownIncompatible is known to be incompatible
  5 |   return <div>Error</div>;
  6 | }
  7 |
```
          
      