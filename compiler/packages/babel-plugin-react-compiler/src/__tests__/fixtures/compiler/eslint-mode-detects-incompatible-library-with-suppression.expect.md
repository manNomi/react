
## Input

```javascript
// @noEmit
import {useEffect} from 'react';

// Simulating an incompatible library API
function useVirtualizer(config) {
  return {scrollToIndex: () => {}};
}

function MyHook() {
  const virtualizer = useVirtualizer({
    count: 100,
    getScrollElement: () => null,
    estimateSize: () => 35,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return virtualizer;
}

export const FIXTURE_ENTRYPOINT = {
  fn: MyHook,
  params: [],
};

```

## Code

```javascript
// @noEmit
import { useEffect } from "react";

// Simulating an incompatible library API
function useVirtualizer(config) {
  return { scrollToIndex: () => {} };
}

function MyHook() {
  const virtualizer = useVirtualizer({
    count: 100,
    getScrollElement: () => null,
    estimateSize: () => 35,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return virtualizer;
}

export const FIXTURE_ENTRYPOINT = {
  fn: MyHook,
  params: [],
};

```
      
### Eval output
(kind: ok) {"scrollToIndex":"[[ function params=0 ]]"}