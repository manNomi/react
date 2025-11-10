
## Input

```javascript
function Component() {
  const item = [];
  // eslint-disable react-hooks/exhaustive-deps
  const foo = useCallback(
    () => {
      item.push(1);
    },
    []
  );
  // eslint-enable react-hooks/exhaustive-deps

  return <Button foo={foo} />;
}

```


## Error

```
Found 1 error:

Error: React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled

React Compiler only works when your components follow all the rules of React, disabling them may result in unexpected or incorrect behavior. Found suppression `eslint-disable react-hooks/exhaustive-deps`.

error.sketchy-code-exhaustive-deps.ts:3:2
  1 | function Component() {
  2 |   const item = [];
> 3 |   // eslint-disable react-hooks/exhaustive-deps
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  4 |   const foo = useCallback(
  5 |     () => {
  6 |       item.push(1);
```
          
      