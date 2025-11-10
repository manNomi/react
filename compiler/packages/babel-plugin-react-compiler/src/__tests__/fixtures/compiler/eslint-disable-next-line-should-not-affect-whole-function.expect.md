
## Input

```javascript
// This test verifies that eslint-disable-next-line only affects the next line,
// not the entire function. The component should compile successfully.
function Component() {
  const item = [];
  const foo = useCallback(
    () => {
      item.push(1);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return <Button foo={foo} />;
}

```

## Code

```javascript
import { c as _c } from "react/compiler-runtime"; // This test verifies that eslint-disable-next-line only affects the next line,
// not the entire function. The component should compile successfully.
function Component() {
  const $ = _c(2);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    const item = [];
    t0 = useCallback(() => {
      item.push(1);
    }, []);
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const foo = t0;
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = <Button foo={foo} />;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}

```
      

