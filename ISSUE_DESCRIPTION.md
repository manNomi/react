# Issue: Incompatible APIs in Custom Hooks Cause Silent Failures

## Problem Description

When third-party APIs with "interior mutability" (like React Hook Form's `useForm()`) are wrapped in custom hooks and compiled with React Compiler, they cause silent failures in production that are extremely difficult to debug.

## Current Behavior

### ESLint Only Warns
Currently, ESLint can detect when incompatible APIs are used, but it only **warns** developers. This means:
- Code compiles successfully
- Tests may pass
- Application deploys to production
- **Silent failures occur at runtime** (stale UI, components not re-rendering)

### Example of Silent Failure

```javascript
// Custom hook that wraps React Hook Form
function useMyForm() {
  const form = useForm(); // Incompatible API
  return form;
}

// Component using the custom hook
function MyComponent() {
  const { watch } = useMyForm();
  
  // ❌ This won't re-render when the form changes
  // The watch() function has interior mutability that React Compiler can't track
  const value = watch('fieldName');
  
  return <div>{value}</div>;
}
```

**Result:** The component shows stale data and doesn't update when the form changes. No error is thrown - it just silently fails.

## Why This Happens

1. **Interior Mutability**: Some APIs return functions that change their behavior without changing their reference
2. **Hidden Warnings**: When wrapped in custom hooks, React Compiler's warnings don't reach the component level
3. **Silent Failures**: The code compiles and runs, but produces incorrect behavior

## Affected Libraries

- **React Hook Form**: `useForm()` returns a `watch()` function with interior mutability
- **TanStack Table**: `useReactTable()` returns functions that can't be safely memoized
- **TanStack Virtual**: `useVirtualizer()` returns functions that can't be safely memoized

## Expected Behavior

The compiler should **fail at compile time** with a clear error message when incompatible APIs are used in custom hooks, preventing the silent failure from reaching production.

## Proposed Solution

Add compile-time validation that:
1. Detects when custom hooks use incompatible APIs
2. Throws a compilation error (not just a warning)
3. Provides clear guidance on how to fix the issue

### Error Message Example

```
❌ Compilation Skipped: Incompatible API used in custom hook

Custom hook `useMyForm()` uses an incompatible API.
React Hook Form's `useForm()` API returns a `watch()` function which cannot be memoized safely.

This API should be used directly in components, not wrapped in custom hooks.
When used in a custom hook, React Compiler cannot optimize it properly, leading to silent failures in production.
```

## Workarounds (Current)

### 1. Use the API directly in components (Recommended)
```javascript
// ✅ Good: Direct usage
function MyComponent() {
  const { watch } = useForm();
  return <div>{watch('fieldName')}</div>;
}
```

### 2. Disable React Compiler for the custom hook
```javascript
"use no memo"; // Disable compiler for this function

function useMyForm() {
  return useForm();
}
```

## Impact

This issue affects any React application using:
- React Compiler
- Custom hooks that wrap third-party libraries
- Libraries with interior mutability (React Hook Form, TanStack, etc.)

The silent nature of the failure makes it particularly dangerous, as it may not be caught during development or testing.

## Related

- React Compiler documentation on incompatible APIs
- ESLint plugin for React Compiler
- Community reports of silent failures with React Hook Form + React Compiler

## Severity

**High** - Silent failures in production are difficult to debug and can affect user experience significantly.

