# 현재 검사 아키텍처

현재 프로젝트는 정적 멀티 페이지 UI와 브라우저 내부 검사 엔진으로 구성되어 있다.

- UI 진입점: `index.html`, `assets/js/app.js`
- 현재 실행 방식: 대상 URL을 `iframe`에 로드한 뒤 같은 출처 DOM에 접근
- 검사 엔진: `assets/js/engine.js`
- rule 정의·custom DOM 검사·노드 분석: `assets/js/rules.js`
- 결과 필터·검색·상세 Drawer·화면에서 확인: `assets/js/renderer.js`
- 검사 이력 저장: `assets/js/storage.js`의 IndexedDB
- axe-core: `assets/vendor/axe.min.js`

현재 결과 객체는 `engine.js`의 `createInspectionResult()`에서 생성된다. `schemaVersion`, `runId`, `createdAt`, `tool`, `target`, `summary`, `filters`, `items`, `displayItems`, `raw`를 유지하는 것이 이후 저장·비교·리포트 확장의 핵심이다.

현재 저장 기능은 실제로 IndexedDB 이력 저장만 구현되어 있다. JSON 백업/복원과 HTML 리포트는 `planning-handoff.md`, `automation-storyboard.md`에서 향후 확장 대상으로 언급되어 있지만 현재 소스에 실행 함수나 전용 파일은 없다. Local Runner는 이 미래 기능을 별도 결과 형식으로 만들지 않고 현재 검사 결과 객체를 그대로 공급해야 한다.

# 현재 검사 호출 흐름

| 단계 | 현재 파일 / 함수 | 입력 | 출력 | 다음 단계 | DOM 의존 | iframe 의존 | `window` / `document` 의존 |
|---|---|---|---|---|---|---|---|
| URL 정규화 | `assets/js/app.js` `openPage()`, `normalizeUrl()` | 입력 문자열, 현재 문서 URL | 절대 URL | `iframe.src` 설정 | 앱 문서의 입력·상태 DOM | 간접 | `window.location`, 앱 `document` |
| 대상 화면 로드 | `assets/js/app.js` `openPage()`, `handleFrameLoad()` | 정규화된 URL | 로드 완료 또는 cross-origin 오류 상태 | 검사 버튼 활성화 | 앱 DOM, iframe load 이벤트 | 직접 | 앱 `window`, `document` |
| 검사 컨텍스트 생성 | `assets/js/app.js` `getFrameContext()` | `elements.frame` | `{ frameWindow, frameDocument, url }` | `runCurrentInspection()` | `contentDocument`, `contentWindow` | 직접 | iframe `window/document` |
| PC/Mobile 반영 | `assets/js/app.js` `setViewportMode()`, `applyFrameDeviceMode()`, `waitForFrameMode()` | `pc` 또는 `mobile` | iframe body의 `pc`/`mo` class, iframe 폭 상태 | 검사 실행 | iframe body | 직접 | iframe `requestAnimationFrame` |
| 검사 시작 | `assets/js/app.js` `runCurrentInspection()` | frame context, viewport mode | `runInspection()` Promise | 요약·결과 렌더링, 저장 | 실행 상태 DOM | 직접 | 앱 `window`, `document` |
| axe 로드 | `assets/js/engine.js` `ensureAxe()` | `frameWindow`, `frameDocument` | iframe 안의 `axe` 객체 | `runAxeWithTimeout()` | script 삽입, head | 직접 | 부모 `window` timer |
| axe 실행 | `assets/js/engine.js` `runAxeWithTimeout()` | axe, `frameDocument`, timeout | `violations`, `incomplete`, `passes` | `buildInspectionItems()` | axe가 대상 DOM 검사 | 직접 | 부모 `window.setTimeout` |
| 결과 병합 | `assets/js/engine.js` `buildInspectionItems()` | axe raw 결과, frame context, `includePasses` | axe item + custom item | 색상 대비 병합·정렬·중복 제거 | custom 검사와 node 탐색 | 현재는 직접 | 함수 내부에서 DOM 전달 |
| rule 분석 | `assets/js/engine.js` `buildInspectionItem()` → `assets/js/engine.js` `findTarget()` → `assets/js/rules.js` `analyzeNode()` | axe rule/node, `frameDocument`, `frameWindow`, rule metadata | issue, reason, guide, current values, HTML, target 정보 | `normalizeNode()` | 매우 높음 | 현재는 직접 | `getComputedStyle`, `CSS.escape` 등 대상 window |
| custom 검사 | `assets/js/rules.js` `runCustomRules()` | `{ frameDocument }` | custom finding 그룹 | `normalizeCustomItem()` | 매우 높음 | 현재는 직접 | 대상 document |
| 결과 정규화 | `assets/js/engine.js` `normalizeNode()`, `normalizeCustomItem()`, `createInspectionResult()` | 분석된 item/node, axe raw, frame context | 현재 표준 inspection result | `renderSummary()`, `renderResults()` | 결과 생성 자체는 부분적 | `frameContext.url`에 의존 | axe version, 시간, viewport 정보 |
| 결과 표시 | `assets/js/app.js` `renderSummary()`, `renderResults()` → `assets/js/renderer.js` | inspection result, frame context | 요약·필터·검색·상세 Drawer DOM | 사용자 상호작용 | 결과 DOM | `화면에서 확인`에서 직접 | renderer의 앱 document |
| 저장 | `assets/js/app.js` `persistResult()` → `assets/js/storage.js` `saveInspection()` | inspection result | IndexedDB `a11y-lens/inspections` 저장 | 최근 검사 목록 갱신 | 저장 API | 없음 | IndexedDB와 browser `window` |
| 화면에서 확인 | `assets/js/renderer.js` `revealResultTarget()` → `focusResultTarget()` → `applyTargetHighlight()` | node selector, frame context, drawer | iframe scroll, target highlight | 사용자에게 대상 위치 표시 | target DOM, rect, scroll | 직접 | iframe window/document, `getBoundingClientRect()` |

## 현재 결과 흐름의 핵심

```text
app.js openPage
  → iframe load / getFrameContext
  → app.js runCurrentInspection
  → engine.js runInspection
  → ensureAxe / axe.run
  → buildInspectionItems
      → buildInspectionItem / analyzeNode
      → runCustomRules / normalizeCustomItem
  → normalizeNode / createInspectionResult
  → renderer.js renderSummary / renderResults
  → storage.js saveInspection
```

`renderer.js`는 Runner 종류를 알 필요가 없다. 현재 renderer가 요구하는 것은 `result`와 `화면에서 확인`에 필요한 대상 컨텍스트뿐이다. Local Runner 전환의 최소 변경 경계는 `runCurrentInspection()`과 `runInspection()` 사이에 두는 것이 가장 안전하다.

# Browser 의존 지점

## 앱 UI 의존

`app.js`는 검사기 자체의 `document`, `window`, iframe 요소, `requestAnimationFrame`, `URL`, IndexedDB를 사용한다. Local Runner가 생겨도 검사 결과를 표시하고 저장하는 앱 UI는 계속 브라우저에서 실행되어야 한다.

## 검사 대상 DOM 의존

`rules.js`의 실제 분석은 대상 페이지의 DOM을 필요로 한다.

- `document.querySelector()` / `querySelectorAll()`
- `element.closest()`
- `element.ownerDocument`
- `element.getAttribute()` / `outerHTML`
- `frameWindow.getComputedStyle()`
- `window.CSS.escape()`를 사용하는 selector 생성 보조 함수
- `document.documentElement`, `body`, `meta[name="viewport"]`

현재 custom 검사도 모두 `frameDocument`에 직접 접근한다. 대상 DOM을 Node.js 객체로 옮겨서 같은 로직을 실행하는 방법은 적합하지 않다. Playwright에서는 대상 page context 안에서 실행해야 한다.

## `iframe` 의존

다음은 Local Runner 전환 때 직접 교체 대상이다.

- `elements.frame.src`
- `elements.frame.contentDocument` / `contentWindow`
- `getFrameContext()`
- `handleFrameLoad()`의 same-origin 접근 확인
- `ensureAxe()`의 iframe head script 삽입
- `renderer.js`의 iframe target 탐색·스크롤·highlight

## `getBoundingClientRect()` 의존

현재 검사 판정 자체보다 `화면에서 확인` 기능에서 사용한다. `renderer.js`는 iframe target의 rect를 읽고 highlight를 만들며, Drawer와 대상 요소가 동시에 보이도록 iframe shell을 가로 스크롤한다. Local Runner에서는 이 좌표가 Playwright page viewport 기준으로 바뀐다.

## `element.matches()`

현재 검사 관련 핵심 코드에서 직접 사용하지 않는다. 향후 selector 검증을 위해 새로 추가할 필요가 없다.

# 유지할 코드

다음은 Runner 종류와 무관하므로 그대로 유지하는 것을 원칙으로 한다.

- `assets/js/rules.js`의 `A11Y_RULES`, `RULE_POLICIES`, `getRuleDefinition()`, 정책 기반 status 계산
- title, reason, guide, standard, example 등 rule metadata
- `status`, `scoreImpact`, `confidence`와 `violations` / `incomplete` / `passes` 의미
- `normalizeNode()`가 만드는 `target`, `message`, `values`, `example`, `state` 구조
- 결과의 `schemaVersion`, `summary`, `items`, `raw` 구조
- `sortInspectionItems()`, color-contrast 병합, 중복 제거 정책
- `renderer.js`의 결과 요약, 필터, 검색, 상세 disclosure, 코드 표시
- `storage.js`의 IndexedDB 이력 저장 형식과 `runId` keyPath
- JSON/HTML 리포트가 나중에 구현될 경우 사용할 표준 결과 객체
- `index.html`의 결과 Drawer UI와 기존 결과 레이어 UX

특히 Renderer에 `runner === "browser"` 같은 분기를 넣지 않는다. 결과 표시가 실행 방식에 종속되면 이후 Compare·리포트·자동화에서 같은 분기가 반복된다.

# 변경할 코드

## B. 작은 수정 필요

| 영역 | 최소 변경 방향 | 이유 |
|---|---|---|
| `assets/js/app.js` 실행 진입점 | `runCurrentInspection()`에서 직접 `runInspection()`을 호출하지 않고 단일 `inspect()` 경계를 호출 | Browser/Local 결과를 같은 render·save 경로로 합치기 위해 필요 |
| 실행 방식 상태 | `manual`과 runner kind를 요청 옵션으로만 전달 | 결과 renderer가 runner를 알지 않게 하기 위해 필요 |
| 결과 context | Browser의 `frameContext`를 Local의 `evidenceContext`와 분리 | `화면에서 확인`만 별도 처리하고 결과 구조는 유지 |
| URL 상태 | 요청 URL과 최종 redirect URL을 구분할 선택적 metadata 추가 | 자동 검사 host 정책과 이력 표시에서 필요 |
| 오류 처리 | Runner HTTP 오류를 기존 검사 실패·재시도 흐름으로 매핑 | 현재 `runCurrentInspection()`의 retry UX 유지 |
| viewport | 기존 `pc`/`mobile` 의미를 request와 result에 그대로 전달 | 샘플 페이지의 body class 정책 유지 |

## C. Runner용 교체·추가 필요

- iframe URL 로딩 대신 Local Runner HTTP 요청
- Playwright Chromium의 top-level navigation
- Playwright page context 안의 axe 실행
- Playwright page context 안의 custom DOM 검사
- target selector를 Playwright locator 또는 page DOM으로 해석하는 evidence 생성
- Runner health check와 수동/자동 host 정책 검증
- Local Runner 프로세스와 최소 API

기존 `engine.js`의 모든 함수를 Node.js에서 직접 실행하는 방식은 권장하지 않는다. 현재 함수들이 `window`, `frameDocument`, target Element에 결합되어 있기 때문이다. Node는 Playwright page를 조정하고, 대상 DOM 분석은 page context에서 수행해야 한다.

# Local Runner 최소 구조

## 권장 저장소 위치

현재 저장소와 같은 저장소 안에 별도 `runner/` 디렉터리를 둔다.

```text
a11y/
├─ assets/
├─ index.html
├─ docs/
└─ runner/
   ├─ package.json
   ├─ server.js
   ├─ playwright-runner.js
   ├─ page-inspector.js
   ├─ policy.js
   └─ config/
      └─ approved-hosts.json
```

같은 저장소를 권장하는 이유는 axe vendor 버전, rule metadata, 결과 schema, 샘플 fixture를 한 변경 단위로 검증할 수 있기 때문이다. 기존 정적 앱의 package/dependency 실행 환경과 Runner를 분리하려면 `runner/package.json`을 별도로 둔다.

별도 저장소는 배포 독립성은 높지만 `rules.js`와 결과 schema가 서로 다른 버전으로 실행될 위험이 더 크다. 처음부터 별도 저장소로 분리할 필요는 없다.

## 프로세스 구성

- `server.js`: Node native `http`로 `/api/health`, `/api/inspect` 라우팅
- `playwright-runner.js`: Chromium launch/context/page/navigation/viewport 관리
- `page-inspector.js`: 대상 page context에서 axe와 기존 custom 검사 진입점을 실행하고 DOM 분석 snapshot을 수집
- `policy.js`: URL protocol, manual/automation, approvedHosts, redirect 정책
- `config/approved-hosts.json`: host 이름만 저장하는 비밀정보 없는 허용 목록

Express는 현재 규모와 API 수에 비해 필수적이지 않다. native `http`와 `URL`, `crypto.randomUUID`, `AbortController`로 시작하는 것이 의존성과 배포 단위를 줄인다. Playwright만 Runner 전용 dependency로 추가한다.

# Browser ↔ Runner 데이터 계약

## 요청

```json
{
  "url": "https://example.com/page",
  "viewport": "pc",
  "mode": "manual",
  "includePasses": true
}
```

- `url`: `http` 또는 `https` URL만 허용
- `viewport`: 현재 UI와 같은 `pc` 또는 `mobile`
- `mode`: `manual` 또는 `automation`
- `includePasses`: 현재 `runCurrentInspection()`의 동작을 유지하기 위한 선택값
- timeout, redirect 제한은 서버 기본값으로 두고 외부 입력에서 임의로 늘리지 않는다.

## 응답 권장안

초기 Local Runner는 B 방식, 즉 현재 `inspection result` 형식까지 변환해 반환하는 방식을 권장한다.

```json
{
  "schemaVersion": "1.0.0",
  "runId": "run-...",
  "createdAt": "2026-08-07T00:00:00.000Z",
  "tool": {
    "name": "a11y-inspector",
    "version": "1.0.0",
    "engine": "axe-core",
    "axeVersion": "..."
  },
  "target": {
    "url": "https://example.com/page",
    "normalizedUrl": "https://example.com/page",
    "finalUrl": "https://example.com/page",
    "title": "Example",
    "origin": "https://example.com",
    "viewport": {
      "mode": "pc",
      "width": 1440,
      "height": 900
    }
  },
  "summary": {
    "totalNodes": 0,
    "totalRules": 0,
    "required": 0,
    "review": 0,
    "recommend": 0,
    "pass": 0,
    "violations": 0,
    "incomplete": 0,
    "custom": 0
  },
  "filters": {
    "statuses": ["all", "required", "review", "recommend", "pass"],
    "sourceTypes": ["axe", "custom", "mixed"],
    "impacts": ["critical", "serious", "moderate", "minor", "unknown"]
  },
  "items": [],
  "displayItems": [],
  "raw": {
    "axe": {
      "violationsCount": 0,
      "incompleteCount": 0,
      "passesCount": 0
    }
  },
  "runner": {
    "kind": "local-playwright",
    "requestedUrl": "https://example.com/page",
    "finalUrl": "https://example.com/page"
  }
}
```

`runner`와 `target.finalUrl`은 선택적 확장 필드로 두며, 기존 renderer와 storage가 모르는 상태에서도 동작해야 한다. `items` 내부의 `ruleId`, `sourceType`, `axeResultType`, `status`, `policy`, `scoreImpact`, `confidence`, `title`, `description`, `reason`, `guide`, `standard`, `nodes`는 현재 형식을 그대로 유지한다.

각 node도 현재 구조를 유지한다.

- `target.selector`, `target.selectors`
- `target.text`, `target.html`, `target.snippet`
- `message.issue`, `message.reason`, `message.guide`, `message.raw`
- `values`, `example`, `standard`, `state`
- `nodeId`, `fingerprint`

Local Runner가 selector를 새로 예쁘게 만들거나 HTML whitespace를 정리해서 보내면 기존 dedupe·Compare·상세 표시와 달라질 수 있으므로 원본 selector와 `outerHTML`을 우선 보존한다.

## 방식 비교

| 방식 | 장점 | 위험 / 비용 | 판단 |
|---|---|---|---|
| A. raw axe + raw custom 반환 후 Browser normalize | 기존 normalize를 재사용할 수 있음 | Browser에 대상 DOM이 없으므로 `analyzeNode()`, computed style, selector 탐색을 다시 바꿔야 함. DOM snapshot 계약이 커짐 | 초기 방식으로 부적합 |
| B. Runner가 현재 inspection result까지 변환 | 기존 renderer, filter, storage, 이력 UI를 그대로 사용 가능 | Runner page context에 분석·정규화 진입점을 만들고 rule/schema 버전을 맞춰야 함 | 초기 권장 |
| C. raw + normalized를 모두 반환 | 디버깅과 전환 비교가 쉬움 | payload와 저장 구조가 커지고 두 결과의 불일치가 생길 수 있음 | 개발 검증 기간에만 선택적 사용 |

## 권장 방식의 전제

B 방식은 `rules.js`를 Node에서 복사해 다시 작성한다는 뜻이 아니다. `page-inspector.js`는 Playwright 대상 page context에서 기존 rule metadata와 custom 분석을 실행할 수 있는 얇은 진입점이어야 한다. 초기에는 normalized result를 계약으로 고정하고, 내부 raw axe/custom 값은 로그나 개발 전용 응답으로만 다룬다.

브라우저 Browser Runner와 Local Runner의 결과가 같은 fixture에서 달라지지 않도록 `tool.version`, `axeVersion`, rule metadata 버전을 함께 기록한다.

# custom 검사 이전 전략

현재 `runCustomRules({ frameDocument })`와 `analyzeNode()`는 대상 document/element를 직접 사용한다. 따라서 전체 custom 검사를 Node 코드로 옮겨 새로 작성하지 않는다.

## page.evaluate()에서 실행하기 쉬운 검사

다음은 Playwright `page.evaluate()` 또는 page context entrypoint에서 그대로 실행하기 쉽다.

- `inspectBrokenLabelReferences()` — `label[for]`, `getElementById()` 사용
- `inspectAriaReferences()` — `querySelectorAll()`, ARIA reference id 확인
- `inspectEmptyAriaLabels()` — `[aria-label]` 탐색과 값 확인
- `inspectSuspiciousImageAlts()` — `img[alt]`, 파일명 heuristic
- `inspectUnnamedTables()` — `table`, `caption`, `aria-label`, `aria-labelledby`
- `analyzeFormLabel()`, `analyzeAccessibleName()`, `analyzeImageAlt()` — 대상 Element와 document reference 필요

## page context가 필요한 검사

- `analyzeColorContrast()`는 `frameWindow.getComputedStyle()`, 배경색 탐색, 투명도·background image 정보가 필요하다.
- `analyzeHeadingOrder()`는 `target.ownerDocument.querySelectorAll()`이 필요하다.
- `getElementHtml()`와 `createUniqueSelector()`는 대상 Element/document가 필요하다.
- `findTarget()`는 axe target selector를 현재 page document에서 해석해야 한다.

## 이전 원칙

1. 먼저 현재 함수의 입력이 `frameDocument/frameWindow`인지 `document/window`인지 추상화하지 말고, Playwright page context에서 동일한 DOM API로 실행한다.
2. 그 다음 중복이 확인되는 작은 보조 함수만 `page-inspector.js`의 공유 진입점으로 추출한다.
3. selector, HTML, currentValues, computed style을 Node로 개별 재구성하지 않는다.
4. `CSS.escape`, `closest`, `querySelectorAll`을 Node용 대체 API로 바꾸지 않는다.
5. iframe 내부 frame 검사는 별도 단계로 둔다. 첫 Runner 범위에서는 top-level page를 우선하고, 기존 `frames.html` 회귀 테스트로 범위를 명확히 한다.

# 화면에서 확인 기능 전환 전략

## 현재 방식

`renderer.js`의 `revealResultTarget()`은 `node.target.selectors`를 `findTarget()`에 전달해 iframe DOM Element를 찾는다. 이후 `scrollIntoView()`, `getBoundingClientRect()`, highlight overlay, iframe shell horizontal scroll을 실행한다. 이 기능은 결과 JSON만으로는 동작하지 않는다.

## Local Runner의 최소 대안

Local Runner 결과의 node에 selector와 `nodeId`를 보존하고, 화면 증거를 필요할 때 요청한다.

```text
결과 상세의 화면에서 확인
  → Local Runner evidence 요청(runId, nodeId, selector)
  → Playwright locator 해석
  → 대상 rect 계산
  → 대상 영역을 표시한 screenshot 반환
  → 기존 Drawer 안의 증거 영역 또는 별도 미리보기에서 표시
```

권장 순서는 다음과 같다.

1. Browser Runner에서는 현재 iframe 동작을 그대로 유지한다.
2. Local Runner에서는 `finalUrl`, selector, viewport screenshot/rect를 on-demand evidence로 제공한다.
3. screenshot은 검사 결과 본문에 항상 base64로 넣지 않고 요청 시 반환한다. IndexedDB 결과 크기와 개인정보 노출을 줄이기 위해서다.
4. highlight는 원본 대상 페이지를 변형한 영구 결과로 저장하지 않고, Playwright context에서 잠시 표시한 화면에만 적용한다.

대상 URL을 새 탭으로 여는 방식은 구현은 단순하지만 외부 페이지의 selector 위치를 강조할 수 없고 사용자의 현재 세션·화면 상태와 다를 수 있다. 따라서 보조 fallback으로만 둔다.

# 수동 검사 / 자동 검사 정책

요청에 `mode`를 명시해 실행 의도를 분리한다.

```text
manual
  - 사용자가 직접 URL 입력
  - http/https 공개 사이트, 내부 사이트, localhost 허용
  - 단일 URL 검사만 기본 제공

automation
  - 반복·예약·여러 URL·시나리오 실행
  - approvedHosts 검증 필수
  - 최초 URL과 redirect 후 최종 URL 모두 검증
```

수동 검사는 공개 외부 사이트도 허용하지만, Runner 서버가 외부 요청을 대행하므로 다음 기본 제한은 공통 적용한다.

- `javascript:`, `data:`, `file:`, `chrome:`, 임의 protocol 거부
- 기본 HTTP method는 GET
- 사용자가 입력한 URL에 credential, cookie, authorization header를 자동으로 붙이지 않음
- redirect 횟수와 검사 시간 제한
- 실제 개인정보·계정·인증번호·토큰을 로그나 결과에 저장하지 않음
- page content와 screenshot을 장기 보관하지 않음

`localhost`, `127.0.0.1`은 manual에서 허용할 수 있다. automation에서는 명시적으로 approvedHosts에 등록된 경우에만 허용한다. 사내 개발 도메인과 회사 외부 개발계도 host가 승인 목록에 있으면 자동 검사를 허용한다.

http에서 https로 redirect되거나 다른 host로 redirect되는 경우:

- manual: 최종 URL이 http/https이고 기본 네트워크 정책을 통과하면 표시하되, 결과에 `requestedUrl`과 `finalUrl`을 모두 남긴다.
- automation: 최초 host와 최종 host 모두 approvedHosts를 통과해야 한다. 하나라도 벗어나면 검사를 중단한다.

# approvedHosts 정책

`approvedHosts`는 인증정보가 아닌 host 정책만 저장한다.

권장 위치:

```text
runner/config/approved-hosts.json
```

예시:

```json
{
  "hosts": [
    "app.company.example",
    "dev.company.example",
    "localhost"
  ]
}
```

정책 원칙:

- 기본은 exact hostname match
- 서브도메인 허용은 `*.company.example`처럼 명시적인 규칙으로만 허용
- `*`, 빈 문자열, 전체 URL의 path를 host 허용값으로 사용하지 않음
- port가 중요한 개발계는 `hostname:port`를 별도 필드로 관리
- 실제 secret, cookie, bearer token, 계정 정보는 저장하지 않음
- 운영 환경에서는 파일을 배포 설정으로 취급하고 소스에 인증정보를 함께 넣지 않음

# API 최소안

## `GET /api/health`

```json
{
  "ok": true,
  "runner": "local-playwright",
  "playwright": "...",
  "browser": "chromium"
}
```

## `POST /api/inspect`

요청:

```json
{
  "url": "https://example.com/page",
  "viewport": "pc",
  "mode": "manual",
  "includePasses": true
}
```

응답:

- 성공: 현재 `inspection result` JSON
- `400`: URL 형식, protocol, viewport, mode 오류
- `403`: automation인데 approvedHosts 불일치
- `408`: page load 또는 axe timeout
- `422`: top-level navigation은 되었지만 검사 가능한 문서가 아님
- `500`: Runner 내부 오류

향후 화면 증거가 필요할 때만 다음 endpoint를 추가한다.

```text
GET /api/inspect/:runId/evidence/:nodeId
```

첫 구현부터 screenshot endpoint를 만들 필요는 없지만, 결과 node에 `nodeId`, selector, finalUrl을 안정적으로 보존해야 나중에 추가할 수 있다.

# 단계별 마이그레이션

현재 코드 변경량과 회귀 위험이 낮은 순서로 진행한다.

## Phase 0 — 결과 contract fixture 고정

- `samples/mixed.html`, `contrast.html`, `structure.html`, `frames.html`을 golden fixture로 사용
- Browser Runner 결과의 rule id, source type, status, policy, node selector, HTML, currentValues를 저장해 비교 기준화
- 현재 기능은 변경하지 않음

## Phase 1 — Runner skeleton

- `runner/server.js`, `/api/health`만 추가
- Chromium launch와 단일 URL top-level navigation 확인
- 승인 정책은 읽기 전용 검증만 준비
- 앱 UI에는 연결하지 않음

## Phase 2 — page context axe 실행

- `assets/vendor/axe.min.js`의 버전과 Runner의 axe 버전을 고정
- Playwright page에 axe를 주입하고 `violations`, `incomplete`, `passes` 수집
- raw 결과를 개발 전용으로 검증
- 아직 기존 결과 Drawer와 연결하지 않음

## Phase 3 — 기존 rule/custom 분석 연결

- `page-inspector.js`에서 기존 `rules.js` 분석 흐름을 재사용할 수 있는 page-context entrypoint를 만든다.
- custom 검사 전체를 Node 코드로 새로 작성하지 않는다.
- color-contrast, currentValues, HTML, selector 생성부터 fixture로 맞춘다.

## Phase 4 — 현재 inspection result 변환

- Runner 응답을 현재 `createInspectionResult()` 결과와 동일한 구조로 만든다.
- Browser Runner와 Local Runner 결과를 같은 fixture에서 비교한다.
- `renderer.js`와 `storage.js`를 직접 수정하지 않고 결과만 주입한다.

## Phase 5 — 앱 실행 경계 연결

- `app.js`의 `runCurrentInspection()`이 단일 `inspect()` 호출을 사용하도록 작은 수정
- Browser Runner와 Local Runner를 mode/feature flag로 선택
- 실패 시 기존 retry 흐름을 재사용
- 초기 기본값은 Browser Runner로 두고 명시적으로 Local Runner를 선택할 수 있게 검증한다.

## Phase 6 — Local Runner 수동 단일 URL 전환

- manual의 단일 URL 검사부터 연결
- PC/Mobile, axe/custom, 결과 검색·필터·상세·IndexedDB 저장을 확인
- 공개 외부 사이트와 localhost를 실제 허용 정책에 맞춰 검증

## Phase 7 — 화면에서 확인 evidence

- Browser Runner는 현재 iframe highlight를 유지
- Local Runner는 on-demand screenshot/rect evidence를 추가
- 결과 상세의 기존 버튼 의미와 키보드 동작을 유지

## Phase 8 — automation 및 approvedHosts

- approvedHosts 통과 host만 반복·여러 URL·예약 실행 허용
- 최초 URL과 최종 redirect host를 모두 검증
- 결과 저장, 실행 이력, Compare를 기존 result schema 위에서 확장
- 로그인/인증 context는 이 단계 이후 별도 설계

# 회귀 위험

| 영역 | 위험 | 원인 | 검증 기준 |
|---|---|---|---|
| color-contrast 후처리 | 높음 | `getComputedStyle`, 배경 이미지, 투명도는 page context가 아니면 재현되지 않음 | violation/incomplete 각각의 `contrastStatus`, currentValues, scoreImpact 확인 |
| violation / incomplete / passes | 높음 | Runner가 axe result type과 정책 status를 섞을 수 있음 | `axeResultType`, `sourceType`, `status`, pass 숨김 동작 비교 |
| 필수 / 확인 상태 | 높음 | incomplete를 required로 잘못 변환하거나 review rule을 덮어쓸 수 있음 | rule별 policy와 source type 조합 fixture 비교 |
| scoreImpact / confidence | 높음 | 결과를 새로 만들 때 정책 metadata 누락 가능 | 모든 item에 `policy`, `scoreImpact`, `confidence` 존재 확인 |
| targetPath / selectors | 높음 | Playwright locator용 selector를 임의로 바꾸면 dedupe·evidence가 깨짐 | axe target 배열과 `target.selectors` 보존 비교 |
| targetText | 중간 | 현재 값은 실제 text보다 selector path에 가까운 경우가 있음 | 기존 의미를 유지하고 새 text 값을 임의로 대체하지 않음 |
| currentValues | 높음 | label, lang, viewport, contrast 값이 page DOM에서 계산됨 | fixture별 name/value exact 비교 |
| HTML snippet | 높음 | `outerHTML`과 whitespace를 Node에서 재생성하면 상세·Compare가 달라짐 | `target.html` 원본 보존 |
| rule metadata | 높음 | Runner에 별도 rule 문구를 복제하면 Browser와 달라짐 | `rules.js` 정책/문구 버전 고정 |
| 결과 검색 | 낮음 | renderer는 result JSON만 검색함 | 동일 result에서 검색 결과 개수 비교 |
| 결과 필터 | 중간 | recommend/status summary 누락 가능 | required/review/recommend/pass summary와 필터 동작 비교 |
| 상세 Drawer | 중간 | 결과 구조가 달라지면 기존 info block·code block이 깨짐 | 현재 result fixture를 renderer에 그대로 주입 |
| IndexedDB 저장/복원 | 중간 | 새 runner metadata가 순환 참조나 과도한 screenshot을 포함할 수 있음 | `saveInspection()` 후 동일 JSON 재생성 확인 |
| JSON 백업/복원 | 향후 | 현재 실제 구현은 없음. 새 스키마를 임의로 먼저 만들면 충돌 가능 | 현재 result schema를 기준으로 별도 작업에서 정의 |
| HTML 리포트 | 향후 | 현재 실제 생성 코드가 없음 | renderer용 result와 report용 result를 같은 원본으로 사용 |
| iframe/frame 검사 | 높음 | top-level page와 nested frame의 document 경계가 다름 | `frames.html` fixture를 Phase 3 이후 별도 검증 |
| redirect/host 정책 | 높음 | 최초 host만 검사하면 automation이 승인 밖 host로 이동할 수 있음 | initial/final URL 모두 policy 검사 |

# 최초 구현 범위

향후 실제 구현의 최초 범위는 다음으로 제한한다.

- 동일 저장소 `runner/` 추가
- Node native HTTP server
- Playwright Chromium launch
- `GET /api/health`
- `POST /api/inspect`의 manual 단일 URL
- `pc` / `mobile` viewport
- top-level page axe 실행
- 기존 custom rule 실행을 위한 page-context entrypoint
- 현재 inspection result 형식 응답
- Browser 앱의 결과 Drawer·검색·필터·상세·IndexedDB 저장 재사용
- 동일 출처 samples fixture와 공개 URL 수동 검사 검증

최초 구현에서 결과 레이어를 Runner 전용으로 다시 만들지 않는다. Local Runner는 결과를 만들고, 브라우저는 기존 결과를 표시·저장한다.

# 이번 단계에서 하지 않을 것

- Runner 실제 구현
- 코드 리팩터링 또는 기존 함수 삭제
- iframe 검사 기능 삭제
- axe rule 판정 로직 변경
- custom rule 재작성
- React/Vue 등 프레임워크 도입
- Express 도입
- 로그인, 쿠키, 인증 context, 토큰 저장
- 임의 외부 사이트 자동 순회
- 여러 URL·예약·시나리오 자동화
- Compare, Dashboard, 점수 계산
- JSON 백업/복원 실제 구현
- HTML/Excel 리포트 실제 구현
- screenshot 장기 저장
- `화면에서 확인` UI 리디자인

현재 Browser Runner는 Local Runner가 안정화될 때까지 유지한다. 최소 변경의 기준은 검사 실행 위치만 교체하고, `renderer.js`, `storage.js`, 현재 result schema를 공통 소비자로 남기는 것이다.

# 영역별 변경 요약

| 영역 | 현재 방식 | Runner 전환 후 | 변경 수준 | 주요 파일 |
|---|---|---|---|---|
| URL 입력 | `app.js`가 URL 정규화 후 iframe에 설정 | 입력은 유지하고 `manual`/`automation`을 실행 요청에 추가 | 작은 수정 | `index.html`, `assets/js/app.js` |
| 페이지 로드 | iframe `load`와 same-origin 확인 | Playwright top-level navigation | 교체 | `assets/js/app.js`, `runner/playwright-runner.js` |
| 검사 실행 | `app.js` → `engine.js runInspection()` | 단일 `inspect()` 경계에서 Browser/Local 선택 | 작은 수정 | `assets/js/app.js`, 신규 service/runner |
| axe 실행 | iframe에 `axe.min.js` 삽입 후 `axe.run()` | Playwright page context에 동일 vendor axe 실행 | Runner 추가 | `assets/js/engine.js`, `runner/page-inspector.js` |
| custom 검사 | `runCustomRules({ frameDocument })` | page context에서 기존 규칙 실행 | Runner 추가·최소 추출 | `assets/js/rules.js`, `runner/page-inspector.js` |
| node 탐색 | `findTarget()` + `frameDocument.querySelector()` | page DOM/Playwright locator로 같은 selector 탐색 | Runner 교체 | `assets/js/engine.js`, `runner/page-inspector.js` |
| computed style | `frameWindow.getComputedStyle()` | Playwright page context `getComputedStyle()` | Runner 교체 | `assets/js/rules.js`, `runner/page-inspector.js` |
| HTML 추출 | target `outerHTML` / axe node HTML | page context의 동일 원본 HTML 보존 | 작은 수정 | `assets/js/rules.js`, `runner/page-inspector.js` |
| rule metadata | `A11Y_RULES`, `RULE_POLICIES` | 동일 버전·동일 데이터 사용 | 유지 | `assets/js/rules.js` |
| status/policy | `getResultPolicy()`, `getActionStatus()` | 동일 정책을 result에 저장 | 유지 | `assets/js/rules.js`, `assets/js/engine.js` |
| result normalize | `normalizeNode()`, `createInspectionResult()` | 초기에는 Runner가 동일 result 형식 반환 | 경계 추가 | `assets/js/engine.js`, `runner/page-inspector.js` |
| 결과 검색/필터 | renderer가 result JSON을 필터링 | 동일 result를 그대로 전달 | 유지 | `assets/js/renderer.js` |
| 상세 Drawer | 현재 result와 frame context 사용 | result는 유지, evidence만 runner 방식 분기 | 작은 수정 | `assets/js/renderer.js` |
| 화면에서 확인 | iframe scroll/highlight/rect | Local Runner on-demand screenshot/rect evidence | 후속 교체 | `assets/js/renderer.js`, runner API |
| 저장 | IndexedDB `a11y-lens/inspections` | 동일 result 저장, screenshot은 저장하지 않음 | 유지 | `assets/js/storage.js`, `assets/js/app.js` |
| JSON 백업/복원 | 현재 실제 구현 없음 | 동일 result schema 기반으로 후속 구현 | 보류 | 문서·향후 export 모듈 |
| HTML 리포트 | 현재 실제 생성 코드 없음 | 동일 result를 입력으로 후속 생성 | 보류 | 문서·향후 report 모듈 |
| host 정책 | 현재 없음 | manual과 automation을 server policy로 분리 | 신규 | `runner/policy.js`, `runner/config/approved-hosts.json` |
| 프로세스 | 정적 서버만 필요 | 정적 앱 + 별도 Local Runner 프로세스 | 신규 | `runner/server.js`, `runner/package.json` |

