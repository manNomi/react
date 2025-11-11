
## Input

```javascript
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


## Error

```
Found 1 error:

Error: React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled

React Compiler cannot optimize this code due to ESLint suppression.

This suppression may hide critical issues:
• Incompatible API warnings (e.g., useVirtualizer, Framer Motion hooks)
• Hook dependency problems
• Memoization failures in components using this code

To fix:
1. Remove the ESLint suppression and address the underlying issue, or
2. Add "use no memo" directive to explicitly opt out of optimization

Found suppression: `eslint-disable-next-line react-hooks/exhaustive-deps`.

error.sketchy-code-exhaustive-deps.ts:6:7
  4 |     () => {
  5 |       item.push(1);
> 6 |     }, // eslint-disable-next-line react-hooks/exhaustive-deps
    |        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  7 |     []
  8 |   );
  9 |
```
          
      