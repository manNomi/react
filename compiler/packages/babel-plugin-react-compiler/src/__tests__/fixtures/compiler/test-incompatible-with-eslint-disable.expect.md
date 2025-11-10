
## Input

```javascript
import {useVirtualizer} from '@tanstack/react-virtual';
import {useEffect} from 'react';

function useCustomHook() {
  const parentRef = {current: null};
  
  // This should show a warning
  const virtualizer = useVirtualizer({
    count: 10,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log('effect');
  }, []);
  
  return {virtualizer, parentRef};
}

export default function Component() {
  const {virtualizer} = useCustomHook();
  return <div>{virtualizer}</div>;
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

test-incompatible-with-eslint-disable.ts:8:22
   6 |   
   7 |   // This should show a warning
>  8 |   const virtualizer = useVirtualizer({
     |                       ^^^^^^^^^^^^^^^ TanStack Virtual's `useVirtualizer()` API returns functions that cannot be memoized safely
   9 |     count: 10,
  10 |     getScrollElement: () => parentRef.current,
  11 |     estimateSize: () => 100,
```
          
      

