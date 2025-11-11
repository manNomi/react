
## Input

```javascript
/* eslint-disable react-hooks/rules-of-hooks */
function lowercasecomponent() {
  'use forget';
  const x = [];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return <div>{x}</div>;
}
/* eslint-enable react-hooks/rules-of-hooks */

```


## Error

```
Found 2 errors:

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

error.invalid-sketchy-code-use-forget.ts:1:0
> 1 | /* eslint-disable react-hooks/rules-of-hooks */
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  2 | function lowercasecomponent() {
  3 |   'use forget';
  4 |   const x = [];

Error: React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled

React Compiler cannot optimize this code due to ESLint suppression.

This suppression may hide critical issues:
• Incompatible API warnings (e.g., useVirtualizer, Framer Motion hooks)
• Hook dependency problems
• Memoization failures in components using this code

To fix:
1. Remove the ESLint suppression and address the underlying issue, or
2. Add "use no memo" directive to explicitly opt out of optimization

Found suppression: `eslint-disable-next-line react-hooks/rules-of-hooks`.

error.invalid-sketchy-code-use-forget.ts:5:2
  3 |   'use forget';
  4 |   const x = [];
> 5 |   // eslint-disable-next-line react-hooks/rules-of-hooks
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  6 |   return <div>{x}</div>;
  7 | }
  8 | /* eslint-enable react-hooks/rules-of-hooks */
```
          
      