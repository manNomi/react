# Improve incompatible library warning message

## Summary

Enhances the warning message for incompatible libraries (like `useVirtualizer`) to be more informative and actionable for developers.

## Problem

When developers use incompatible APIs like `useVirtualizer` from `@tanstack/react-virtual`, the current warning message is unclear:

**Before:**
```
Use of incompatible library

This API returns functions which cannot be memoized without leading to stale UI.
To prevent this, by default React Compiler will skip memoizing this component/hook.
However, you may see issues if values from this API are passed to other
components/hooks that are memoized.
```

This doesn't clearly explain:
- What the actual impact is
- Why it happens
- How to fix it
- That the warning appears even with eslint-disable (which confuses developers)

## Solution

**Single file change:** Improved the warning message in `InferMutationAliasingEffects.ts`

**After:**
```
⚠️  This API returns functions which cannot be memoized without leading to stale UI.

**Impact:**
• This component/hook will NOT be memoized by React Compiler
• Returns new object references on every render
• Breaks memoization of parent components
• May cause performance issues

**Recommended solutions:**
1. List all dependencies correctly in your effect/memo hooks
2. Add "use no memo" directive to explicitly opt-out of memoization
3. Use incompatible APIs directly in components (not in custom hooks)

**Note:** This warning appears even with eslint-disable comments.
This is intentional to ensure you're aware of the memoization impact.
```

## Key Improvements

1. ✅ **Clear Impact**: Bullet points explaining what happens
2. ✅ **Actionable Solutions**: 3 concrete options
3. ✅ **Explains eslint-disable**: Clarifies this is intentional
4. ✅ **Better Formatting**: Easy to read and understand

## Why This Matters

**Real user feedback:**
> "useVirtualScroll을 직접 박으면 작동하고, 커스텀 훅으로 분리하면 작동을 안하더라고"
> 
> Translation: "Direct use works, but custom hook doesn't work"

Developers were confused because:
- They had `eslint-disable-next-line` in their code
- Expected ALL warnings to be suppressed
- Didn't understand why incompatible-library warning still appeared
- Didn't know how to fix it

Now the warning message:
- Explains it always appears (even with eslint-disable)
- Provides clear solutions
- Helps developers understand the impact

## Files Changed

```
compiler/packages/babel-plugin-react-compiler/src/Inference/InferMutationAliasingEffects.ts
  - Enhanced incompatible library warning message (lines 2460-2473)
  - Added clear impact explanation
  - Provided 3 concrete solution options
  - Explained warning appears with eslint-disable
```

## How did you test this change?

1. **Message Verification**
   - Verified the new message format is clear and readable
   - Confirmed all formatting renders correctly in terminal output

2. **Existing Tests**
   - All existing tests pass without modification
   - No behavior changes, only message improvements

3. **Real-World Scenario**
   ```typescript
   function useCustomHook() {
     const api = useVirtualizer({...});
     
     // eslint-disable-next-line react-hooks/exhaustive-deps
     useEffect(() => {...}, []);
   }
   ```
   - Warning still appears (correct)
   - Message is now clearer (improvement)

## Additional Context

This is a **documentation-only change** - no logic modifications:
- ✅ Same warning conditions
- ✅ Same error throwing
- ✅ Same compilation behavior
- ✅ Only message text changed

**Benefits:**
- Developers understand the issue immediately
- Know exactly how to fix it
- Understand why warning appears with eslint-disable
- Better developer experience

## Related Issues

Addresses confusion when incompatible-library warnings appear despite eslint-disable comments in custom hooks.

---

**Ready for review!** 🚀

