
## Input

```javascript
// @enableFlowSuppressions

function Foo(props) {
  // $FlowFixMe[react-rule-hook]
  useX();
  return null;
}

```


## Error

```
Found 1 error:

Error: React Compiler has skipped optimizing this component because one or more React rule violations were reported by Flow

React Compiler cannot optimize this code due to Flow suppression.

This suppression may hide critical issues that could affect memoization.

To fix:
1. Remove the Flow suppression and address the underlying issue, or
2. Add "use no memo" directive to explicitly opt out of optimization

Found suppression: `$FlowFixMe[react-rule-hook]`.

error.bailout-on-flow-suppression.ts:4:2
  2 |
  3 | function Foo(props) {
> 4 |   // $FlowFixMe[react-rule-hook]
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Found React rule suppression
  5 |   useX();
  6 |   return null;
  7 | }
```
          
      