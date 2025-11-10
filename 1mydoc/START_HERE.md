# 🚀 시작 가이드

## 📌 이 프로젝트는?

React의 **eslint-plugin-react-hooks** 버그를 발견하고 문서화한 프로젝트입니다.

---

## 🐛 발견한 버그

**`eslint-disable-next-line react-hooks/exhaustive-deps`를 사용하면**  
**함수 전체의 모든 `react-hooks` 규칙이 무시됩니다!**

---

## 🎯 빠른 재현

### 1. 설치 및 실행
```bash
npm install
npm run dev
```

### 2. 버그 확인
```bash
npm run lint
```

**결과:**
```
src/hooks/useIncompatibleMovieList.ts:13:23 - ✅ 경고 나타남 (정상)
src/hooks/useIncompatibleMovieList.ts:47:26 - ❌ 경고 안 나타남 (버그!)
```

### 3. 브라우저 확인
http://localhost:5173/custom-hook

---

## 📚 문서 읽기 순서

1. **README.md** ← 프로젝트 전체 개요
2. **ESLINT_DISABLE_BUG.md** ← 버그 상세 분석
3. **HOW_TO_REPORT_ISSUE.md** ← 이슈 리포트 방법
4. **EDGE_CASE_TEST_RESULTS.md** ← 테스트 결과

---

## 🔍 핵심 코드

### src/hooks/useIncompatibleMovieList.ts

```typescript
// ✅ 정상 - 경고 나타남
export function useIncompatibleMovieList(count: number) {
  const virtualizer = useVirtualizer({...});  // 13줄
  return { virtualizer, parentRef };
}

// ❌ 버그 - 경고 안 나타남!
export const useVirtualScroll = <T>({...}) => {
  const rowVirtualizer = useVirtualizer({...});  // 47줄
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {...}, [...]);  // ← 이것 때문에 47줄도 무시됨!
};
```

---

## 📤 이슈 제출 준비

### 체크리스트
- [x] 버그 재현 코드 ✅
- [x] 15개 테스트 케이스 ✅
- [x] 상세 문서 ✅
- [x] 이슈 템플릿 ✅
- [ ] GitHub 저장소 생성
- [ ] React 팀에 이슈 제출

### 이슈 제출 방법
**[HOW_TO_REPORT_ISSUE.md](./HOW_TO_REPORT_ISSUE.md)** 파일 참고

---

## 🎬 다음 단계

1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: ESLint react-hooks bug reproduction"
   git remote add origin [your-repo-url]
   git push -u origin main
   ```

2. **이슈 제출**
   - https://github.com/facebook/react/issues
   - HOW_TO_REPORT_ISSUE.md의 템플릿 사용
   - 이 저장소 URL 포함

3. **커뮤니티 공유**
   - Twitter/X
   - Reddit (r/reactjs)
   - Dev.to

---

## ✅ 완료!

모든 문서와 코드가 준비되었습니다.  
이슈를 제출하시면 됩니다! 🎉

---

**궁금한 점이 있으면 각 문서를 참고하세요!**
