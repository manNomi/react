
## Input

```javascript
import {useKnownIncompatibleIndirect} from 'ReactCompilerKnownIncompatibleTest';

function useMyForm() {
  const {incompatibleMethod} = useKnownIncompatibleIndirect();
  return incompatibleMethod;
}

```


## Error

```
Found 1 error:

Compilation Skipped: Use of incompatible library

Custom hook `useMyForm()` accesses an incompatible property. incompatibleMethod cannot be memoized

This property should be accessed directly in components, not in custom hooks.

error.incompatible-property-in-custom-hook.js:4:8
  2 |
  3 | function useMyForm() {
> 4 |   const {incompatibleMethod} = useKnownIncompatibleIndirect();
    |          ^^^^^^^^^^^^^^^^^^^ incompatibleMethod cannot be memoized
  5 |   return incompatibleMethod;
  6 | }
  7 |
```
          
      
