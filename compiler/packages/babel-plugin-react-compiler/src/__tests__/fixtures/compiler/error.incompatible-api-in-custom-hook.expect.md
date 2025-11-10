
## Input

```javascript
import {useKnownIncompatible} from 'ReactCompilerKnownIncompatibleTest';

function useMyCustomHook() {
  const data = useKnownIncompatible();
  return data;
}

```


## Error

```
Found 1 error:

Compilation Skipped: Use of incompatible library

Custom hook `useMyCustomHook()` uses an incompatible API. useKnownIncompatible is known to be incompatible

This API should be used directly in components, not wrapped in custom hooks. When used in a custom hook, React Compiler cannot optimize it properly, leading to silent failures in production.

error.incompatible-api-in-custom-hook.js:4:15
  2 |
  3 | function useMyCustomHook() {
> 4 |   const data = useKnownIncompatible();
    |                ^^^^^^^^^^^^^^^^^^^^^^ useKnownIncompatible is known to be incompatible
  5 |   return data;
  6 | }
  7 |
```
          
      
