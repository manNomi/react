
## Input

```javascript
/* eslint-disable react-hooks/rules-of-hooks */
function lowercasecomponent() {
  const x = [];
  return <div>{x}</div>;
}
/* eslint-enable react-hooks/rules-of-hooks */

export const FIXTURE_ENTRYPOINT = {
  fn: lowercasecomponent,
  params: [],
  isComponent: false,
};

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

Found suppression: `eslint-disable react-hooks/rules-of-hooks`.

error.sketchy-code-rules-of-hooks.ts:1:0
> 1 | /* eslint-disable react-hooks/rules-of-hooks */
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  2 | function lowercasecomponent() {
  3 |   const x = [];
  4 |   return <div>{x}</div>;
```
          
      