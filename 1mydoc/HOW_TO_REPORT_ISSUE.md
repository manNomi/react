# 🐛 이슈 리포트 가이드

## 🎯 어디에 보고하나?

### React 팀에 보고

**Repository:** https://github.com/facebook/react

**Path:** `packages/eslint-plugin-react-hooks`

**이슈 URL:** https://github.com/facebook/react/issues/new/choose

---

## 📝 이슈 제목 (영문)

```
[eslint-plugin-react-hooks] eslint-disable-next-line for exhaustive-deps suppresses incompatible-library warnings
```

또는

```
[Bug] eslint-disable-next-line react-hooks/exhaustive-deps disables all react-hooks rules in the function
```

---

## 📄 이슈 본문 템플릿

### React version
19.2.0

### eslint-plugin-react-hooks version
7.0.1

### Steps To Reproduce

1. Create a custom hook that uses an incompatible API (e.g., `useVirtualizer` from `@tanstack/react-virtual`)
2. Add a `useEffect` with `eslint-disable-next-line react-hooks/exhaustive-deps`
3. Run ESLint

**Code example:**

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect } from "react";

export const useMyHook = <T>({
  items,
  onLoadMore,
}: {
  items: T[];
  onLoadMore: () => void;
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // This should trigger react-hooks/incompatible-library warning
  const virtualizer = useVirtualizer({  // Line 12
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (items.length > 0) {
      onLoadMore();
    }
  }, [items.length]);
  
  return { virtualizer, parentRef };
};
```

**ESLint config:**

```javascript
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
]
```

### The current behavior

**When running `eslint`:**
- ❌ Line 12 (`useVirtualizer`) does NOT trigger `react-hooks/incompatible-library` warning
- The `eslint-disable-next-line` comment on line 20 seems to suppress ALL `react-hooks` warnings in the entire function

**Actual output:**
```
(no warnings)
```

### The expected behavior

**Expected:**
- ✅ Line 12 should trigger `react-hooks/incompatible-library` warning
- ✅ Line 20's `eslint-disable-next-line` should ONLY suppress the `exhaustive-deps` rule for that specific line
- ✅ Other `react-hooks` rules should remain active

**Expected output:**
```
line 12  warning  Compilation Skipped: Use of incompatible library  react-hooks/incompatible-library
```

---

## 🔬 Additional Investigation

### Test Results

I created comprehensive test cases to isolate the issue:

**Test 1: With `react-hooks/exhaustive-deps` disable**
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { ... }, []);
```
Result: `useVirtualizer` warning **NOT shown** ❌

**Test 2: With different rule disable**
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
useEffect(() => { ... }, []);
```
Result: `useVirtualizer` warning **shown** ✅

**Test 3: Without any disable comment**
```typescript
useEffect(() => { ... }, [a, b, c]);
```
Result: `useVirtualizer` warning **shown** ✅

### Root Cause

It appears that when `eslint-disable-next-line react-hooks/*` is used:
- ESLint disables ALL `react-hooks` rules for the entire function scope
- Not just the specific line or specific rule mentioned

This is unexpected behavior and can lead to:
- Silent failures in production
- Missing critical warnings about incompatible APIs
- Difficult debugging

### Workaround

Instead of:
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { ... }, []);
```

Use accurate dependency array:
```typescript
useEffect(() => { ... }, [dep1, dep2, dep3]);
```

---

## 📊 Impact

This bug can have serious consequences:

1. **Silent Failures**
   - Developers think they're only disabling `exhaustive-deps`
   - But `incompatible-library` warnings are also suppressed
   - Production issues may arise

2. **Large Codebases**
   - Hard to detect
   - Can affect many custom hooks
   - Difficult to debug

3. **React Compiler Integration**
   - React Compiler relies on these warnings
   - Silent suppression leads to optimization failures
   - Performance degradation

---

## 🧪 Reproduction Repository

I've created a comprehensive test repository:

**URL:** [Your repository URL if you push to GitHub]

**Key files:**
- `src/hooks/useIncompatibleMovieList.ts` - Demonstrates the bug
- `src/hooks/edgeCaseTests.ts` - 15 edge case tests
- `ESLINT_DISABLE_BUG.md` - Detailed analysis

**To reproduce:**
```bash
git clone [your-repo]
cd react-compiler-test
npm install
npm run lint
```

---

## 🔗 Related

- Package: `eslint-plugin-react-hooks@7.0.1`
- ESLint: `v9.0.0`
- React: `19.2.0`
- React Compiler: `0.0.0-experimental-334f00b-20240725`

---

## 💬 Additional Context

This issue was discovered while testing React Compiler's incompatible API detection. The bug makes it difficult to properly validate code that uses libraries like `@tanstack/react-virtual`, which are known to be incompatible with React Compiler's automatic memoization.

The current behavior contradicts the expected behavior of `eslint-disable-next-line`, which should only affect the next line, not the entire function scope.

---

## ✅ Checklist

- [x] Tested with latest version (7.0.1)
- [x] Created minimal reproduction
- [x] Tested multiple scenarios
- [x] Identified workaround
- [x] Documented impact

