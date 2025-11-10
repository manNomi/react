# Validate Incompatible APIs in Custom Hooks

## Summary

This PR adds compile-time validation to prevent known incompatible third-party APIs from being used inside custom hooks. While ESLint can warn about these issues, this validation **throws errors at compile time**, preventing silent failures in production.

## Problem

Some third-party libraries implement "interior mutability" - they return functions that change behavior without changing their reference. Examples include:
- `useForm()` from React Hook Form (returns `watch()` function)
- `useReactTable()` from TanStack Table
- `useVirtualizer()` from TanStack Virtual

When these APIs are used directly in components, React Compiler can detect them and bail out safely. However, when wrapped in custom hooks, the warnings are hidden, leading to:
- Silent failures in production
- Stale UI that's difficult to debug
- Components not re-rendering when they should

## Solution

This PR adds a new validation phase (`ValidateNoIncompatibleAPIsInHooks`) that:

1. **Detects custom hooks** (functions starting with `use`, excluding React built-in hooks)
2. **Scans for incompatible API calls** using the existing `knownIncompatible` metadata in function signatures
3. **Throws compile-time errors** with clear error messages guiding developers to use the API directly in components

### Example

**❌ Before: Custom hook wrapping incompatible API (silent failure)**
```javascript
// This would compile but fail silently at runtime
function useMyCustomHook() {
  const { watch } = useForm(); // Incompatible API
  return watch;
}
```

**✅ After: Compile-time error with clear guidance**
```
Compilation Skipped: Incompatible API used in custom hook

Custom hook `useMyCustomHook()` uses an incompatible API. 
React Hook Form's `useForm()` API returns a `watch()` function which cannot be memoized safely.

This API should be used directly in components, not wrapped in custom hooks.
```

## Technical Details

### Implementation

**New File:** `compiler/packages/babel-plugin-react-compiler/src/Validation/ValidateNoIncompatibleAPIsInHooks.ts`

- Validates during the compilation pipeline (early validation phase)
- Uses existing `knownIncompatible` metadata from `TypeSchema` and `DefaultModuleTypeProvider`
- Detects direct function calls (most common case)
- Provides descriptive error messages with actionable guidance

### Test Coverage

New test fixture: `error.incompatible-api-in-custom-hook.js`
- Verifies custom hooks using incompatible APIs are rejected
- Ensures built-in React hooks are not affected
- Tests error message clarity and guidance

### Infrastructure Fix

Also fixes a test environment issue:
- Resolved `NO_COLOR` vs `FORCE_COLOR` environment variable conflict
- All 1785 tests now pass cleanly

## Supported APIs

Currently configured incompatible APIs (defined in `DefaultModuleTypeProvider.ts`):

| Library | API | Reason |
|---------|-----|--------|
| React Hook Form | `useForm()` | Returns `watch()` function with interior mutability |
| TanStack Table | `useReactTable()` | Returns functions that cannot be safely memoized |
| TanStack Virtual | `useVirtualizer()` | Returns functions that cannot be safely memoized |

## Testing

```bash
cd compiler
yarn test
# All 1785 tests pass ✅
```

## Migration Guide

If your code is affected by this validation:

**Option 1: Use the API directly in the component (Recommended)**
```javascript
// ✅ Good: Direct usage in component
function MyComponent() {
  const { watch } = useForm();
  return <div>{watch('fieldName')}</div>;
}
```

**Option 2: Disable validation for specific functions**
```javascript
// Add @validateNoIncompatibleAPIsInHooks:false comment
// @validateNoIncompatibleAPIsInHooks:false
function useMyCustomHook() {
  return useForm();
}
```

## Related

- Addresses issues with React Hook Form, TanStack Table, and TanStack Virtual integration
- Improves developer experience by failing fast at compile time
- Complements existing ESLint rules with enforcement

## Checklist

- [x] Added validation logic
- [x] Added test coverage
- [x] Fixed test infrastructure (NO_COLOR conflict)
- [x] All 1785 tests passing
- [x] Error messages provide clear guidance
- [x] Documentation in code comments
