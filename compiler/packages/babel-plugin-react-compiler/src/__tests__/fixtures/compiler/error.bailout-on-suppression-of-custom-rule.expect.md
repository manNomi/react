
## Input

```javascript
// @eslintSuppressionRules:["my-app","react-rule"]

/* eslint-disable my-app/react-rule */
function lowercasecomponent() {
  'use forget';
  const x = [];
  // eslint-disable-next-line my-app/react-rule
  return <div>{x}</div>;
}
/* eslint-enable my-app/react-rule */

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

Found suppression: `eslint-disable my-app/react-rule`.

error.bailout-on-suppression-of-custom-rule.ts:3:0
  1 | // @eslintSuppressionRules:["my-app","react-rule"]
  2 |
> 3 | /* eslint-disable my-app/react-rule */
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  4 | function lowercasecomponent() {
  5 |   'use forget';
  6 |   const x = [];

Error: React Compiler has skipped optimizing this component because one or more React ESLint rules were disabled

React Compiler cannot optimize this code due to ESLint suppression.

This suppression may hide critical issues:
• Incompatible API warnings (e.g., useVirtualizer, Framer Motion hooks)
• Hook dependency problems
• Memoization failures in components using this code

To fix:
1. Remove the ESLint suppression and address the underlying issue, or
2. Add "use no memo" directive to explicitly opt out of optimization

Found suppression: `eslint-disable-next-line my-app/react-rule`.

error.bailout-on-suppression-of-custom-rule.ts:7:2
   5 |   'use forget';
   6 |   const x = [];
>  7 |   // eslint-disable-next-line my-app/react-rule
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
   8 |   return <div>{x}</div>;
   9 | }
  10 | /* eslint-enable my-app/react-rule */
```
          
      