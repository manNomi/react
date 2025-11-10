# Show incompatible library warnings even with eslint-disable

## Summary

Ensures developers always see warnings about incompatible libraries (like `useVirtualizer`) even when `eslint-disable` comments are present, while providing context-appropriate messages.

## Problem

When developers use `eslint-disable-next-line react-hooks/exhaustive-deps` in custom hooks:

```typescript
function useCustomHook() {
  const api = useVirtualizer({...});  // ❌ NO WARNING!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
}
```

**Current behavior:**
- React Compiler skips the entire function (safe, but silent)
- No `incompatible-library` warning shown
- Developer doesn't know why their hook isn't memoized
- Returns new object references → breaks parent component memoization

**Impact:**
- Silent performance issues
- Unexpected behavior in production
- Developer confusion

## Solution

Two-mode approach:

### 1. Lint Mode (`noEmit: true` - for ESLint)
- **Ignore** suppressions during analysis
- Still detect incompatible libraries
- Show context-aware warnings

### 2. Build Mode (`noEmit: false` - for compilation)
- **Respect** suppressions (skip compilation for safety)
- Conservative approach maintained

## Changes

### 1. React Compiler Core (`Program.ts`)

```typescript
// Skip suppression check in noEmit mode to allow analysis
const suppressionsInFunction = programContext.opts.noEmit
  ? []
  : filterSuppressionsThatAffectFunction(
      programContext.suppressions,
      fn,
    );
```

**Effect:**
- Lint mode: Analyze all functions regardless of suppressions
- Build mode: Skip functions with suppressions (existing behavior)

### 2. ESLint Plugin (`ReactCompiler.ts`)

```typescript
// Check for eslint-disable comments
const allComments = sourceCode.getAllComments?.() || [];
for (const comment of allComments) {
  // ... check for react-hooks suppressions
}

// Customize message for incompatible-library + eslint-disable
if (rule.category === 'IncompatibleLibrary' && hasESLintDisable) {
  message = '⚠️  Warning: Using incompatible API with eslint-disable\n\n' +
    'This hook will NOT be memoized due to eslint-disable.\n' +
    'Be careful - returns new references on every render.\n\n' +
    '**Recommendations:**\n' +
    '• Use API directly in components (not custom hooks)\n' +
    '• Or remove eslint-disable and fix issues\n' +
    '• Consider "use no memo" directive';
}
```

**Effect:**
- Detects when incompatible library is used with eslint-disable
- Shows warning with context-appropriate message

### 3. Error Messages (`InferMutationAliasingEffects.ts`)

```typescript
// Clearer default message (no eslint-disable)
description: [
  '❌ This component/hook will NOT be memoized by React Compiler.\n\n' +
    'This API returns functions which cannot be memoized without leading to stale UI.\n' +
    'Returns new object references on every render, which breaks memoization.\n\n' +
    '**Recommended solutions:**\n' +
    '1. Add "use no memo" directive to opt-out explicitly\n' +
    '2. Use this API directly in components (not custom hooks)\n' +
    '3. Consider alternative approaches',
].join(''),
```

**Effect:**
- Clearer, more actionable error messages

## Example Scenarios

### Scenario 1: Without eslint-disable

```typescript
function useCustomHook() {
  const api = useVirtualizer({...});  // incompatible API
  return api;
}
```

**Warning shown:**
```
❌ This component/hook will NOT be memoized by React Compiler.

This API returns functions which cannot be memoized without leading to stale UI.
Returns new object references on every render, which breaks memoization.

**Recommended solutions:**
1. Add "use no memo" directive to opt-out explicitly
2. Use this API directly in components (not custom hooks)
3. Consider alternative approaches
```

### Scenario 2: With eslint-disable (ESLint mode)

```typescript
function useCustomHook() {
  const api = useVirtualizer({...});
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
}
```

**Warning shown (via ESLint):**
```
⚠️  Warning: Using incompatible API with eslint-disable

This hook will NOT be memoized by React Compiler due to eslint-disable.
Be careful when using the returned value in components - it will create
new references on every render.

**Recommendations:**
• Use this API directly in components (not in custom hooks)
• Or remove eslint-disable and fix the underlying issues
• Consider adding "use no memo" directive to opt-out explicitly
```

### Scenario 3: With eslint-disable (Build mode)

```typescript
// Same code as Scenario 2
```

**Behavior:**
- Compilation skipped (safe, conservative)
- No code transformation
- Original code remains unchanged

## Benefits

1. ✅ **Developers stay informed**: Always see incompatible library warnings
2. ✅ **Context-aware messages**: Different messages for different scenarios
3. ✅ **Safe builds**: Still skip compilation when suppressions present
4. ✅ **Better DX**: Clear explanations and solutions
5. ✅ **No breaking changes**: Existing behavior preserved in build mode

## Files Changed

```
compiler/packages/babel-plugin-react-compiler/src/Entrypoint/Program.ts
  - Skip suppression check in noEmit mode (lines 707-712)

packages/eslint-plugin-react-hooks/src/shared/ReactCompiler.ts
  - Detect eslint-disable comments (lines 131-154)
  - Customize incompatible-library messages (lines 161-171)

compiler/packages/babel-plugin-react-compiler/src/Inference/InferMutationAliasingEffects.ts
  - Improve default error message (lines 2460-2468)

compiler/packages/babel-plugin-react-compiler/src/__tests__/fixtures/compiler/error.invalid-known-incompatible-*.expect.md
  - Update test expectations
```

## How did you test this change?

1. **Updated existing tests**: All incompatible library tests updated with new messages
2. **Manual verification**: Tested with real `useVirtualizer` code
3. **Two modes verified**:
   - ESLint mode: Warnings appear despite suppressions ✅
   - Build mode: Compilation skipped with suppressions ✅

## Related Issues

Addresses developer confusion when:
- Custom hooks use incompatible APIs
- `eslint-disable` comments hide critical warnings
- Performance issues appear without explanation

---

**Ready for review!** 🚀

This change improves developer experience by ensuring critical warnings are always visible, while maintaining safe, conservative compilation behavior.

