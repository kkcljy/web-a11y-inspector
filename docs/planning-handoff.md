# Web A11Y Inspector 기획 인수인계

이 문서는 현재까지 작업한 접근성 검사기 프로젝트의 제품 방향, 구현된 기능, 디자인 결정, 남은 기획 과제를 정리한 인수인계 문서입니다.

앞으로 역할은 다음처럼 나눕니다.

- Codex: 코드 생성, 리팩터링, UI 구현, 테스트, GitHub 반영
- GPT: 기능 기획, 화면 정책, 문구 정리, 사용자 흐름 설계, 우선순위 정리

## 1. 프로젝트 목적

axe-core 기반 웹 접근성 검사기를 만든다. 단순 개발자용 검사기가 아니라, 실무자가 실제 화면에서 문제 위치와 수정 방향을 빠르게 파악할 수 있는 내부 업무 도구를 목표로 한다.

현재 버전은 정적 파일 기반이다. 별도 DB나 서버 없이 `a11y` 폴더만 내부 서버에 올려 사용할 수 있다.

중요한 제약은 iframe 보안 정책이다. 검사기와 검사 대상 페이지가 같은 출처여야 iframe 내부 DOM 접근과 axe 검사가 가능하다. 외부 사이트를 임의로 검사하는 도구가 아니라, 내부망/동일 서버에 올린 페이지를 검사하는 형태에 가깝다.

## 2. 현재 저장소

GitHub 저장소:

```text
https://github.com/kkcljy/web-a11y-inspector
```

로컬 위치:

```text
/Users/chocokwak/Desktop/work/a11y
```

브랜드명은 `A11Y Inspector`로 정리했다. 제품 설명은 "웹 접근성 검사 및 자동화 도구"이며, 헤더에는 기본적으로 심볼과 브랜드명만 노출한다. 저장소명은 기존 공유 흐름을 유지하기 위해 `web-a11y-inspector`를 사용한다.

## 3. 현재 파일 구조

```text
a11y/
├─ index.html
├─ guide.html
├─ lab.html
├─ api.html
├─ README.md
├─ docs/
│  └─ planning-handoff.md
├─ assets/
│  ├─ css/
│  │  └─ style.css
│  ├─ scss/
│  │  └─ style.scss
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ engine.js
│  │  ├─ renderer.js
│  │  ├─ rules.js
│  │  ├─ storage.js
│  │  └─ guide.js
│  ├─ fonts/
│  │  ├─ PretendardVariable.woff2
│  │  └─ Pretendard-LICENSE.txt
│  └─ vendor/
│     └─ axe.min.js
└─ samples/
   ├─ mixed.html
   ├─ contrast.html
   ├─ forms.html
   ├─ structure.html
   ├─ interactive.html
   ├─ frames.html
   ├─ frame-child.html
   ├─ mobile.html
   ├─ data.html
   ├─ pass.html
   └─ assets/
```

## 4. 주요 화면

### 메인 검사 화면

파일: `index.html`

주요 기능:

- 검사 URL 입력
- 검사 시작
- PC/Mobile 검사 모드 전환
- 최근 검사 이력 표시
- 테스트 Lab, 접근성 가이드, 내부 공유/확장 안내로 이동
- iframe 안에 대상 페이지 로딩
- 결과 Drawer 표시

현재 메인은 단순 관리자 페이지 느낌을 줄이고, 제품/프로모션 페이지처럼 첫인상이 좋도록 개선했다. 다만 과도한 설명형 랜딩이 아니라 실제 검사 도구가 첫 화면에서 바로 보이도록 유지한다.

### 검사 결과 Drawer

파일: `renderer.js`, `style.scss`

현재 방향:

- 검사 결과는 페이지 이동이 아니라 오른쪽 Drawer로 표시한다.
- 사용자가 문제 요소를 보면서 원본 화면도 함께 확인해야 하므로, Drawer를 닫지 않고 iframe 영역을 가로 스크롤하여 대상 요소가 보이도록 했다.
- 대상 요소 이동 버튼은 `화면에서 확인`으로 변경했다.
- 버튼 클릭 시 focus를 iframe 내부 대상 요소로 강제로 옮기지 않는다. Drawer 뒤쪽 요소에 포커스가 숨어버리는 문제를 막기 위해 현재는 버튼 포커스를 유지한다.

기획상 검토할 점:

- 낮은 해상도 PC에서 Drawer와 대상 요소를 함께 보는 경험이 충분히 좋은지 확인 필요
- Drawer 폭, 결과 카드 간격, 문제 요소 영역 밀도는 계속 조정 여지 있음
- 검사 결과 상세와 나중의 HTML 리포트는 정보량 기준이 달라야 함

### 접근성 가이드

파일: `guide.html`, `guide.js`

목적:

- 실무자가 구글 검색 없이 접근성 구현 기준을 빠르게 확인하는 내부 정의서
- 단순 백과사전이 아니라 실제 UI 컴포넌트를 어떻게 접근성 맞게 구현해야 하는지 알려주는 가이드

현재 방향:

- 명도 대비, 대체 텍스트, 폼 레이블, 버튼 이름, 탭, 아코디언 등 실무 케이스 중심
- 외부 링크와 내부 실페이지 링크는 제거했다. 회사 내부로 파일을 가져가면 링크가 깨질 수 있기 때문이다.
- 자동/수동 같은 분류 표현은 제거하거나 축소하는 방향이 맞다. 가이드는 검사 결과가 아니라 정의서 성격이다.
- 코드 예제는 기존 worklist 쪽 코드 정렬/테마 느낌을 참고해 문법 하이라이트를 적용했다.

추가 기획 필요:

- 컴포넌트별 권장 마크업 패턴
- aria 사용 기준
- 키보드 조작 기준
- 스크린리더 확인 포인트
- 디자인 산출물에서 확인해야 할 기준
- 개발 QA 체크리스트

### 테스트 Lab

파일: `lab.html`, `samples/`

목적:

- 외부 사이트 검사가 제한되는 상황에서 내부 샘플 페이지로 기능을 테스트하기 위함
- 다양한 접근성 케이스를 의도적으로 포함한 샘플 제공

샘플 방향:

- 명도 대비
- 폼 레이블
- 버튼 이름
- 테이블 caption
- iframe
- 모바일/PC 클래스 전환
- 통과 케이스

주의:

- 테스트 Lab 링크는 메인에서 연결하지 않는 방향으로 조정된 적이 있다. 파일은 유지하되, 내부 사용 시 노출 범위는 별도 판단한다.

### 공통 레이아웃

현재 정적 멀티 페이지 구조를 유지한다. SPA로 전환하지 않고, 반복되는 공통 영역만 include 방식으로 분리한다.

공통 파일 위치:

- `assets/includes/skip-navigation.html`
- `assets/includes/header.html`
- `assets/includes/footer.html`
- `assets/js/common/include.js`
- `assets/js/common/navigation.js`
- `assets/css/common/layout.css`
- `assets/css/common/header.css`
- `assets/css/common/footer.css`

적용 페이지:

- `index.html`
- `guide.html`
- `lab.html`
- `api.html`

각 페이지는 `body[data-page]`로 현재 페이지를 구분한다. `navigation.js`는 `data-nav-page`와 `data-page`를 비교해 현재 메뉴에 `aria-current="page"`를 적용한다.

공통 헤더 메뉴는 `화면 검사`, `접근성 가이드`, `Test Lab` 3개만 노출하며 `api.html`은 직접 URL 접근만 유지한다.

공통화 범위는 건너뛰기 링크, 헤더, 주요 내비게이션, 푸터, toast root까지로 제한한다. 검사 결과 Drawer, 검사 엔진, Guide 본문, Test Lab 본문, API 본문은 공통 레이아웃에 포함하지 않는다.

### SPA 전환 판단 기준

현재는 정적 MPA 구조를 유지한다. React, Vue 등 프레임워크는 사용할 수 없으며 Vanilla JS만 사용한다.

자동화 실행 화면, 리포트 화면, Compare 화면 중 하나를 실제 구현하기 시작하는 시점에는 기능 구현 전에 Vanilla JS SPA 전환 필요성을 먼저 검토한다. 해당 시점이 오면 바로 구현하지 말고, 기존 화면 검사·접근성 가이드·Test Lab을 포함한 얇은 Vanilla Router 도입 범위와 위험을 먼저 사용자에게 보고한다.

사용자의 승인 없이 SPA 전환이나 라우터 도입을 진행하지 않는다.

SPA를 도입할 경우 공통 앱 셸은 유지하고 `main` 영역만 전환한다. 페이지별 `mount/unmount`, 브라우저 뒤로 가기, 문서 제목, 포커스 이동을 함께 처리해야 한다.

## 5. 구현된 주요 기능

검사 엔진:

- axe-core 실행
- violations, incomplete, passes 수집
- 커스텀 DOM 검사 실행
- axe 결과와 커스텀 검사 결과 병합
- 동일 결과 및 동일 DOM 중복 제거
- 검사 시간 제한 처리
- color-contrast 결과 가공
- form-field-multiple-labels 오검출 보정
- iframe/frameDocument 접근
- cross-origin 검사 제한 안내

결과 화면:

- 전체 / 필수 수정 / 확인 필요 / 통과 필터
- 결과 검색
- 결과 요약
- 결과 목록
- 결과 상세 Drawer
- 문제 요소 아코디언
- 대상 요소 하이라이트
- 대상 요소 위치로 iframe 스크롤 이동
- PC / Mobile viewport 전환

UI/디자인:

- SCSS 기반 스타일 관리
- Pretendard 웹폰트 적용
- 메인 화면 구성 개선
- 결과 Drawer 디자인 개선
- 문제 요소 영역 밀도 조정
- PC/Mobile 토글 UI
- iframe 내부 body에 `pc`, `mo` 클래스 적용
- 모바일 전환 시 iframe 폭을 부드럽게 전환

저장/확장:

- `storage.js` 기반 최근 검사 이력 구조
- 아직 DB 없이 브라우저 로컬 저장 중심
- 향후 JSON/Excel/HTML 리포트 확장 가능성을 고려한 구조

## 6. 중요한 제품 결정

### 검사 결과는 현재 화면에서는 실무 중심으로 보여준다

현재 검사 화면은 실무자가 "어디를 고쳐야 하는지" 확인하는 화면이다. 그래서 axe 규칙명, 기준 코드, 지나치게 기술적인 문구는 과하게 노출하지 않는 방향이 맞다.

권장:

- 현재 검사 Drawer: 쉬운 문구, 문제 위치, 현재 상태, 수정 방향 중심
- HTML 리포트/결과지: axe rule id, WCAG 기준, 상세 근거 포함
- Dashboard/Compare: 점수, 추세, 페이지별 상태 중심

### 통과 항목은 현재 검사 화면에서 과하게 보이지 않아도 된다

통과는 검사 결과지나 요약 화면에서 보여주는 것이 더 적합하다. 현재 Drawer에서는 작업해야 할 항목과 확인 필요 항목의 가독성이 우선이다.

### DB는 아직 필수 아님

회사 내부에서 `a11y` 폴더만 가져가도 동작해야 한다. 따라서 IndexedDB는 브라우저 내 이력 저장용으로는 가능하지만, 서버 DB처럼 공유되는 기능으로 오해하면 안 된다.

공유가 필요하면 우선순위는 다음이 현실적이다.

1. Excel 내보내기
2. JSON 내보내기/가져오기
3. HTML 공유 리포트 생성
4. 서버 기반 이력/대시보드

## 7. 향후 기능 후보

초기부터 고려한 확장 기능:

- 검사 결과 JSON 저장/복원
- HTML 공유 리포트 생성
- IndexedDB 기반 검사 이력 관리
- 결과 비교 Compare
- Dashboard
- Playwright 자동화 연동
- Excel 내보내기
- URL / 페이지 / 사이트 단위 검사 확장

기획 우선순위 제안:

1. Excel 내보내기: 내부 공유에 가장 실용적
2. HTML 리포트: 비개발자 공유용
3. JSON 저장/복원: Compare와 Dashboard의 기반
4. IndexedDB 검사 이력: 개인 작업 흐름 개선
5. Compare: 동일 페이지 전후 비교
6. Playwright 자동화: 사이트 단위 검사 확장
7. Dashboard: 자동화/이력 데이터가 쌓인 뒤 설계

## 8. 결과 객체 설계 방향

렌더링 전 결과 객체는 하나의 표준 구조를 가져야 한다. 그래야 JSON 저장, HTML Report, Compare, Dashboard, Excel Export에서 같은 데이터를 재사용할 수 있다.

권장 구조 예시:

```js
{
  meta: {
    schemaVersion: "1.0.0",
    scannedAt: "2026-08-06T00:00:00.000Z",
    url: "./samples/mixed.html",
    title: "Sample page",
    viewport: {
      mode: "pc",
      width: 1440,
      height: null,
      bodyClass: "pc"
    },
    engine: {
      axeVersion: "x.x.x",
      customRulesVersion: "local"
    }
  },
  summary: {
    total: 0,
    violations: 0,
    incomplete: 0,
    passes: 0,
    byImpact: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    }
  },
  results: [
    {
      id: "color-contrast",
      source: "axe",
      status: "violation",
      severity: "serious",
      title: "글자와 배경의 명도 대비가 부족합니다",
      userMessage: "텍스트가 배경과 충분히 구분되지 않습니다.",
      help: "명도 대비를 기준 이상으로 조정하세요.",
      wcag: ["1.4.3"],
      tags: ["wcag2aa", "cat.color"],
      nodes: [
        {
          selector: ".price",
          html: "<span class=\"price\">9,900원</span>",
          text: "9,900원",
          target: [".price"],
          framePath: [],
          state: {
            contrastRatio: 2.1,
            requiredRatio: 4.5,
            foreground: "#999999",
            background: "#ffffff"
          },
          fix: {
            summary: "글자 색상을 더 진하게 조정하세요.",
            example: "color: #555;"
          }
        }
      ]
    }
  ]
}
```

기획상 중요한 점:

- 검사 화면용 문구와 원본 axe rule id를 분리해야 한다.
- 하나의 rule에 여러 node가 있을 수 있다.
- 명도 대비처럼 node마다 현재 값이 다른 항목은 rule 단위가 아니라 node 단위 상태값으로 저장해야 한다.
- Compare를 위해 `selector`, `html`, `text`, `framePath`, `rule id`를 안정적으로 보존해야 한다.
- Excel Export를 위해 행 단위로 펼칠 수 있어야 한다.

## 9. 문구 정책

현재 사용자는 개발자뿐 아니라 기획자/디자이너도 이해할 수 있는 쉬운 문구를 원한다.

예:

- 나쁨: `button-name`
- 보통: `버튼에 접근 가능한 이름이 없습니다`
- 선호: `버튼명이 없습니다`

권장 문구 방향:

- "접근 가능한 이름" 같은 기술 용어는 검사 화면에서 줄인다.
- "현재 상태", "처리 방법"도 너무 딱딱하면 더 쉬운 표현을 검토한다.
- 기준, axe 규칙, WCAG 태그는 현재 검사 화면보다 리포트에서 다루는 것이 적합하다.
- 확인 필요 항목은 "자동 검사만으로 판단하기 어려운 항목"이라는 의미가 사용자에게 명확해야 한다.

## 10. 디자인 방향

사용자가 원하는 방향:

- 관리자 페이지처럼 보이지 않게
- 기본 프레임워크 버튼처럼 보이지 않게
- 도구지만 쓰고 싶어지는 화면
- Apple 계열처럼 여백, 모션, 정돈감이 있는 UI
- 단, 접근성 검사 도구이므로 글자 크기와 가독성은 희생하지 않음

확정된 기준:

- 본문/결과 텍스트 최소 12px 이상
- Pretendard 사용
- 결과 영역은 가독성 우선
- 과한 라인/블릿/기술 태그 노출은 줄임
- 탭 sticky는 과하게 필요하지 않으면 제거 또는 약화
- 통과 항목은 현재 검사 Drawer에서 우선순위 낮음

추가 검토:

- 문제 요소 카드 활성화 상태 디자인
- 아코디언 열림/닫힘 모션
- Drawer 닫기 버튼과 레이어 닫기 버튼의 시각적 구분
- 작은 노트북 화면에서 Drawer와 iframe 동시 확인 경험

## 11. PC/Mobile 정책

기존 내부 프로젝트는 반응형 CSS만이 아니라 body class 기반으로 PC/Mobile 화면을 분기하는 구조가 있다. 그래서 검사 iframe 내부 body에 다음 클래스를 적용한다.

- PC: `pc`
- Mobile: `mo`

현재 구현은 viewport 선택 시 iframe 폭도 함께 변경한다.

- PC: 1440px
- Mobile: 390px

기획상 중요한 점:

- 단순 브라우저 해상도 기준 responsive와 다르다.
- 내부 원소스 페이지가 `.pc`, `.mo` 클래스로 화면을 바꾸는 경우를 지원해야 한다.
- 전환은 깜빡임 없이 width가 부드럽게 변하는 방식이 선호된다.

## 12. 남은 기획 질문

다음 GPT가 먼저 정리하면 좋은 질문:

1. 제품명은 무엇으로 할 것인가?
2. 메인 화면에서 테스트 Lab, 가이드, 리포트/Excel 기능을 어떤 우선순위로 배치할 것인가?
3. 검사 결과 Drawer와 HTML 리포트의 정보 노출 수준을 어떻게 다르게 할 것인가?
4. "필수 수정", "확인 필요", "통과" 용어를 최종적으로 유지할 것인가?
5. 현재 검사 화면에서 WCAG 기준/axe rule id를 완전히 숨길 것인가, 보조 정보로 남길 것인가?
6. Excel 내보내기의 컬럼은 무엇으로 할 것인가?
7. JSON 저장/복원은 사용자용 기능으로 노출할 것인가, 내부 개발/자동화용으로만 둘 것인가?
8. Dashboard는 점수 기반으로 할 것인가, 항목 수/심각도/페이지별 상태 중심으로 할 것인가?
9. 접근성 가이드는 컴포넌트 사전형, 체크리스트형, 검색형 중 무엇을 중심으로 할 것인가?
10. 내부 공유 시 서버 없이 파일만으로 가능한 범위와 서버가 필요한 범위를 어떻게 설명할 것인가?

## 13. 다음 작업 제안

기획 GPT가 먼저 할 일:

1. 제품명 후보 정리
2. 검사 결과 Drawer 정보 구조 재정의
3. Excel Export 컬럼 정의
4. HTML 리포트 목차 정의
5. 접근성 가이드 IA 재설계
6. Dashboard에서 보여줄 지표 정의

Codex가 이어서 할 일:

1. 위 기획안 기준으로 화면/문구 반영
2. 결과 객체 표준화
3. Excel Export 구현
4. HTML 리포트 생성 구현
5. JSON 저장/복원 구현
6. IndexedDB 이력 구조 구현
7. Compare/Dashboard 기반 코드 분리
