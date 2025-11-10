# 🐛 ESLint `react-hooks` Disable 버그

## 🎯 핵심 발견

### ❌ 문제

`eslint-disable-next-line react-hooks/exhaustive-deps`를 사용하면:
- **의도:** useEffect의 dependency array 검사만 건너뛰기
- **실제:** **함수 전체의 모든 react-hooks 검사가 건너뛰어짐!**

---

## 🧪 재현 방법

### 테스트 코드

```typescript
export const useVirtualScroll = <T>({
  itemList,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  settedPrevItemLength = 5,
  settedEstimateSize = 60,
}: UseVirtualScrollProps<T>): UseVirtualScrollReturn => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({  // 47번째 줄
    count: itemList?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => settedEstimateSize,
    overscan: 5,
  });
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // ...복잡한 로직
  }, [itemList?.length, hasNextPage, isFetchingNextPage, fetchNextPage]);
  
  return { parentRef, rowVirtualizer };
};
```

### 결과

```bash
npm run lint
```

**출력:**
```
useIncompatibleMovieList.ts:11:23  ✅ 감지됨
useIncompatibleMovieList.ts:47:26  ❌ 감지 안 됨!
```

47번째 줄의 `useVirtualizer` 경고가 **완전히 무시됩니다!**

---

## 🔬 상세 테스트

### 테스트 1: `react-hooks/exhaustive-deps` disable

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => { ... }, [...]);
```

**결과:**
- ❌ 47줄 (`useVirtualizer`) 안 잡힘
- ❌ `react-hooks/incompatible-library` 무시됨

### 테스트 2: 다른 규칙 disable

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
useEffect(() => { ... }, [...]);
```

**결과:**
- ✅ 47줄 (`useVirtualizer`) 잡힘
- ✅ `react-hooks/incompatible-library` 정상 작동

### 테스트 3: 주석 완전 제거

```typescript
useEffect(() => { ... }, [
  itemList?.length,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rowVirtualizer,
  settedPrevItemLength,
]);
```

**결과:**
- ✅ 47줄 (`useVirtualizer`) 잡힘
- ✅ 모든 검사 정상 작동

---

## 📊 요약 표

| 상황 | `useVirtualizer` 감지 | 이유 |
|------|---------------------|------|
| `react-hooks/exhaustive-deps` disable | ❌ 안 잡힘 | **버그/부작용** |
| 다른 규칙 disable | ✅ 잡힘 | 정상 |
| 주석 없음 | ✅ 잡힘 | 정상 |

---

## 💡 왜 이런 일이 발생하나?

### 가설 1: ESLint 파서의 버그

`react-hooks` 플러그인이 함수 전체를 파싱할 때:
1. `eslint-disable-next-line react-hooks/*` 주석 발견
2. 해당 함수의 **모든 react-hooks 규칙 검사 중단**
3. `incompatible-library` 규칙도 함께 무시됨

### 가설 2: 의도된 동작 (하지만 위험함)

ESLint가 `react-hooks` 관련 규칙을 disable하면:
- 해당 scope의 모든 react-hooks 검사를 건너뛰도록 설계됨
- 문서화가 안 되어 있어서 개발자가 모름
- 의도하지 않은 부작용 발생

---

## ⚠️ 위험성

### 1. 조용한 실패

```typescript
export const useMyHook = () => {
  const problematic = useIncompatibleAPI();  // ❌ 감지 안 됨!
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { ... }, []);
  
  return problematic;
};
```

개발자는 `exhaustive-deps`만 무시하려고 했지만:
- `useIncompatibleAPI` 경고도 함께 무시됨
- 빌드는 성공
- 런타임에서 문제 발생 가능
- 디버깅 어려움

### 2. 대규모 코드베이스에서의 영향

```typescript
// 100줄짜리 복잡한 커스텀 훅
export const useComplexHook = () => {
  const api1 = useIncompatibleAPI();  // ❌ 감지 안 됨
  const api2 = useAnotherBadAPI();    // ❌ 감지 안 됨
  const api3 = useYetAnotherAPI();    // ❌ 감지 안 됨
  
  // 50줄의 로직...
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { ... }, [someDep]);
  
  // 50줄의 로직...
  
  return { api1, api2, api3 };
};
```

**하나의 `eslint-disable` 주석이 전체 함수의 hooks 검사를 무력화시킵니다!**

### 3. 코드 리뷰에서 놓치기 쉬움

```typescript
// 리뷰어가 보기에는 문제없어 보임
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);  // 의도적으로 빈 배열

// 하지만 위에 있는 다른 hooks의 경고도 모두 무시됨!
```

---

## ✅ 해결 방법

### 방법 1: `eslint-disable` 최소화 (권장)

**나쁜 예:**
```typescript
useEffect(() => {
  fetchData(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**좋은 예:**
```typescript
useEffect(() => {
  fetchData(id);
}, [id, fetchData]);  // 모든 dependency 포함
```

### 방법 2: 정말 필요한 경우, 범위 최소화

**나쁜 예:**
```typescript
export const useMyHook = () => {
  const api = useIncompatibleAPI();  // ❌ 영향받음
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { ... }, []);
  
  return api;
};
```

**좋은 예:**
```typescript
export const useMyHook = () => {
  const api = useIncompatibleAPI();  // ✅ 영향 없음
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    doSomething();
  }, []);
  
  return api;
};
```

### 방법 3: 함수 분리

```typescript
// 나쁜 예: 하나의 거대한 함수
export const useBigHook = () => {
  const api = useIncompatibleAPI();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { ... }, []);
  
  return api;
};

// 좋은 예: 함수 분리
export const useIncompatiblePart = () => {
  return useIncompatibleAPI();  // ✅ 별도 함수, 경고 정상
};

export const useEffectPart = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { ... }, []);
};

export const useBigHook = () => {
  const api = useIncompatiblePart();
  useEffectPart();
  return api;
};
```

---

## 🎓 교훈

### 1. `eslint-disable` 주석의 숨은 비용

- 단순히 한 줄만 영향을 준다고 생각하기 쉬움
- 실제로는 예상치 못한 부작용 발생 가능
- 특히 `react-hooks/*` 규칙은 조심해야 함

### 2. 정확한 dependency array 작성의 중요성

```typescript
// 귀찮지만 안전함
useEffect(() => {
  doSomething(a, b, c, d, e);
}, [a, b, c, d, e, doSomething]);
```

vs

```typescript
// 편하지만 위험함
useEffect(() => {
  doSomething(a, b, c, d, e);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);  // ← 이것 때문에 다른 경고도 무시됨!
```

### 3. 린트 규칙 무시의 연쇄 효과

하나의 규칙을 무시하면:
- 같은 카테고리의 다른 규칙들도 영향받을 수 있음
- 특히 플러그인 단위로 동작하는 경우 위험
- 항상 린트 전체 결과를 확인해야 함

---

## 📝 체크리스트

프로젝트에서 확인해야 할 것들:

### 즉시 확인
- [ ] `eslint-disable.*react-hooks` 검색
- [ ] 해당 함수들의 다른 hooks 사용 확인
- [ ] `useVirtualizer`, `useInfiniteQuery` 등 incompatible API 확인

### 장기적 조치
- [ ] `eslint-disable` 사용 최소화 정책
- [ ] 코드 리뷰 시 `eslint-disable` 주석 집중 검토
- [ ] CI/CD에서 lint 경고 개수 모니터링
- [ ] 정기적으로 전체 린트 실행

---

## 🔗 관련 이슈

### ESLint Plugin React Hooks

- **Repository:** https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
- **Version:** 7.0.1
- **Issue:** 이 버그를 리포트해야 할 수도 있음

### React Compiler

- **Repository:** https://github.com/facebook/react/tree/main/compiler
- **Version:** 0.0.0-experimental-334f00b-20240725
- **Note:** React Compiler는 정상 작동, ESLint 플러그인 문제임

---

## 🎯 결론

### 문제 요약

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

이 한 줄이:
- ❌ useEffect의 dependency array만 무시하는 게 아니라
- ❌ **함수 전체의 모든 react-hooks 검사를 무력화**시킵니다!

### 해결책

1. **`eslint-disable` 사용 최소화**
2. **정확한 dependency array 작성**
3. **함수 분리로 영향 범위 최소화**
4. **코드 리뷰 시 주의 깊게 확인**

### 경고

⚠️ **이 버그/동작을 모르면 심각한 문제가 발생할 수 있습니다!**
- 조용한 실패
- 디버깅 어려움
- 프로덕션 이슈

---

**마지막 업데이트:** 2025-01-10  
**발견자:** React Compiler Test Lab  
**재현 환경:** `eslint-plugin-react-hooks@7.0.1`

