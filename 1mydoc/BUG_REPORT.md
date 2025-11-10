# ESLint React Hooks Bug Report

## 🐛 Bug Summary

`eslint-disable-next-line react-hooks/exhaustive-deps` disables **ALL** react-hooks rules for the entire function, not just the next line.

**Critical Impact:** Silent failure with unpredictable component behavior.

---

## 🔍 Bug Details

### Expected Behavior
```typescript
function useCustomHook() {
  const api = useVirtualizer({...});  // Should show warning
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);  // Only this line disabled
}
```
**Expected:** Only `exhaustive-deps` rule disabled for useEffect line.

### Actual Behavior
```typescript
function useCustomHook() {
  const api = useVirtualizer({...});  // ❌ NO WARNING!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
}
```
**Actual:** ALL react-hooks rules (including `incompatible-library`) disabled for entire function.

---

## 💥 Why This Is Critical

### 1. Silent Failure
- No ESLint warnings
- Build succeeds
- Looks correct

### 2. Unpredictable Behavior
```typescript
// Component IS memoized by React Compiler
function MovieList() {
  const $ = useMemoCache(10);  // ✅ Memoized
  
  const { rowVirtualizer } = useCustomHook();
  // rowVirtualizer = new object every render!
  
  // Memo cache check
  if ($[1] !== rowVirtualizer) {  // ← Always true!
    // Re-calculate every render 💥
  }
}
```

**Result:**
- Component: ✅ Memoized (looks OK)
- Internal object: ❌ New reference every render
- Memo cache: ❌ Invalidated every render
- Behavior: ❌ Unpredictable

### 3. Comparison

| Scenario | ESLint Warning | Developer Knows | Predictable |
|----------|----------------|-----------------|-------------|
| Direct use | ✅ Shows | ✅ Yes | ✅ Yes |
| Custom hook + eslint-disable | ❌ Hidden | ❌ No | ❌ No |

---

## 📋 Reproduction

### Step 1: Setup
```bash
git clone https://github.com/[your-repo]/react-compiler-test
cd react-compiler-test
npm install
```

### Step 2: Run Lint
```bash
npm run lint
```

### Step 3: Check Results

**File:** `src/hooks/useIncompatibleMovieList.ts`

**Line 13:** ✅ Warning shown (no eslint-disable)
```typescript
export function useIncompatibleMovieList(count: number) {
  const virtualizer = useVirtualizer({...});  // ← Warning!
  return { virtualizer, parentRef };
}
```

**Line 61:** ❌ Warning hidden (eslint-disable on line 83)
```typescript
export const useVirtualScroll = <T>({...}) => {
  const rowVirtualizer = useVirtualizer({...});  // ← No warning!
  
  // ... 22 lines later ...
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, [...]);  // Line 83
};
```

### Step 4: Remove eslint-disable
Comment out line 83 and run lint again → Warning appears on line 61!

---

## 🔬 Technical Analysis

### ESLint Scope Issue

```typescript
function myHook() {
  const api = useIncompatibleAPI();  // Line 10
  
  // Line 20: eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
  
  return api;
}
```

**Intended scope:** Line 21 (useEffect only)  
**Actual scope:** Lines 10-23 (entire function)

### Affected Rules

When `react-hooks/exhaustive-deps` is disabled:
- ✅ `exhaustive-deps` → Disabled (intended)
- ❌ `rules-of-hooks` → Also disabled (unintended)
- ❌ `incompatible-library` → Also disabled (unintended)

### React Compiler Impact

```json
{
  "kind": "CompileError",
  "detail": {
    "reason": "React Compiler has skipped optimizing because one or more React ESLint rules were disabled"
  }
}
```

- Hook: ❌ Not memoized (eslint-disable detected)
- Component: ✅ Memoized (separate analysis)
- Result: Memo cache invalidated by new object references

---

## 🎯 Real-World Impact

### User Experience
> "useVirtualScroll을 직접 박으면 작동하고, 커스텀 훅으로 분리하면 작동을 안하더라고"

Translation: "Direct use works (shows warning), custom hook doesn't work (no warning)"

### Timeline
```
Day 1: Developer writes custom hook
       Adds eslint-disable for deps warning
       ✅ Clean linting
       → PR approved

Day 2: Another developer uses the hook
       😴 No warnings
       → Production deploy

Day 7: User complaints
       "App is slow"
       "Scrolling is janky"

Day 10: Bug found
        "Oh, it was the eslint-disable"
        → 3 days wasted
```

---

## 💊 Solutions

### 1. Fix eslint-disable Scope (Recommended)

```typescript
// Current (broken)
function useHook() {
  const api = useAPI();  // No warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, []);
}

// Fixed
function useHook() {
  const api = useAPI();  // Warning shown!
  useEffect(() => {
    // Logic here
  }, [api, dep1, dep2]);  // All deps listed
}
```

### 2. Use "use no memo" Directive

```typescript
function useHook() {
  "use no memo";  // Explicit opt-out
  const api = useAPI();
  useEffect(() => {...}, []);
  return api;
}
```

### 3. Split Logic

```typescript
// Base hook (incompatible API)
function useAPIBase() {
  "use no memo";
  return useAPI();
}

// Logic hook (clean)
function useAPILogic(api) {
  useEffect(() => {
    // All deps correctly listed
  }, [api, dep1, dep2]);
}
```

---

## 📝 What Needs to Be Fixed

### In eslint-plugin-react-hooks

**Current:**
```
// eslint-disable-next-line react-hooks/exhaustive-deps
→ Disables ALL react-hooks rules for entire function
```

**Expected:**
```
// eslint-disable-next-line react-hooks/exhaustive-deps
→ Disables ONLY exhaustive-deps for next line
```

### Scope Behavior

| Comment | Expected Scope | Actual Scope | Fix Needed |
|---------|---------------|--------------|------------|
| `eslint-disable-next-line` | Next line only | Entire function | ✅ Yes |
| `eslint-disable` | From this line down | From this line down | ✅ Already correct |

---

## 🔗 Related Files

### Key Files
- `src/hooks/useIncompatibleMovieList.ts` - Bug reproduction
  - Line 10-21: Works (shows warning)
  - Line 49-90: Broken (no warning due to eslint-disable on line 83)

### Test Files
- `src/hooks/edgeCaseTests.ts` - 15 test cases
- `src/pages/CustomHookPage.tsx` - Demo page

### Config
- `eslint.config.js` - ESLint flat config
- `vite.config.ts` - React Compiler config
- `package.json` - Dependencies

---

## 📊 Environment

```json
{
  "react": "19.2.0",
  "eslint": "9.0.0",
  "eslint-plugin-react-hooks": "7.0.1",
  "@tanstack/react-virtual": "3.13.12",
  "babel-plugin-react-compiler": "0.0.0-experimental-334f00b-20240725",
  "node": "v20.x",
  "os": "macOS 24.6.0"
}
```

---

## ✅ Action Items

### For React Team

1. **Fix eslint-plugin-react-hooks**
   - Ensure `eslint-disable-next-line` only affects specified rule
   - Ensure scope is limited to next line, not entire function

2. **Add Warning**
   - Warn when `eslint-disable` is detected in hooks
   - Suggest using correct dependency array instead

3. **Documentation**
   - Clarify `eslint-disable` behavior in hooks
   - Provide examples of correct usage

### For Developers (Workaround)

1. **Avoid eslint-disable in hooks**
   - List all dependencies correctly
   - Use `"use no memo"` if needed

2. **Audit existing code**
   ```bash
   grep -r "eslint-disable.*react-hooks" src/
   ```

3. **Use direct approach**
   - Prefer using incompatible APIs directly in components
   - ESLint warnings will be visible

---

## 📍 Repository

**Demo repository:** [Will be provided]

**To test:**
```bash
npm install
npm run lint
# Check src/hooks/useIncompatibleMovieList.ts:61
# No warning shown (bug!)

# Comment out line 83
npm run lint
# Warning now appears (expected behavior)
```

---

## 🔴 Severity

**Critical** - Silent failure with unpredictable behavior

**Impact:**
- All React projects using custom hooks
- All incompatible APIs (TanStack Virtual, etc.)
- Difficult to debug
- Performance degradation
- User experience impact

---

**Reported:** 2025-01-10  
**Status:** Reproducible  
**Priority:** High

