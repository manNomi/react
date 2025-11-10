
## Input

```javascript
// @validateNoIncompatibleAPIsInHooks
import {useKnownIncompatible} from 'ReactCompilerKnownIncompatibleTest';

function useMyCustomHook() {
  const data = useKnownIncompatible();
  return data;
}

```


## Error

```
Found 1 error:

Compilation Skipped: Incompatible API used in custom hook

Custom hook `useMyCustomHook()` uses an incompatible API. useKnownIncompatible is known to be incompatible

This API should be used directly in components, not wrapped in custom hooks. When used in a custom hook, React Compiler cannot optimize it properly, leading to silent failures in production..

error.incompatible-api-in-custom-hook.ts:5:15
  3 |
  4 | function useMyCustomHook() {
> 5 |   const data = useKnownIncompatible();
    |                ^^^^^^^^^^^^^^^^^^^^^^ Incompatible API used in custom hook
  6 |   return data;
  7 | }
  8 |
```
          
      
