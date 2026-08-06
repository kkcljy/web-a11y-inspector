export const A11Y_STATUS = {
  required: {
    label: "필수 수정",
    description: "자동 검사로 명확한 접근성 오류가 확인되었습니다.",
  },
  review: {
    label: "확인 필요",
    description: "자동 검사만으로 최종 판단하기 어려워 화면의 목적과 동작을 확인해야 합니다.",
  },
  pass: {
    label: "통과",
    description: "자동 검사에서 통과한 항목입니다.",
  },
};

export const A11Y_RULES = {
  "document-title": rule("브라우저 탭에 페이지 제목이 없습니다", "현재 페이지를 구분할 제목이 비어 있습니다.", "여러 페이지를 열었을 때 어떤 페이지인지 구분하기 어렵습니다.", "페이지 내용을 대표하는 제목을 브라우저 탭에 표시하세요. 개발 시 title 태그에 작성합니다.", "WCAG 2.2 AA · 2.4.2", "<title>자동차보험 가입 - 삼성화재 다이렉트</title>"),
  "html-has-lang": rule("페이지에서 사용하는 언어를 알 수 없습니다", "이 페이지가 한국어인지 다른 언어인지 설정되어 있지 않습니다.", "화면 읽기 프로그램이 글자를 잘못된 발음으로 읽을 수 있습니다.", '한국어 페이지라면 페이지 전체 언어를 한국어로 설정하세요. 개발 시 html에 lang="ko"를 작성합니다.', "WCAG 2.2 AA · 3.1.1", '<html lang="ko">'),
  "html-lang-valid": rule("페이지 언어 설정이 올바르지 않습니다", "페이지에 입력된 언어값을 인식할 수 없습니다.", "화면 읽기 프로그램이 글자를 올바르게 읽지 못할 수 있습니다.", '실제 페이지 언어에 맞는 값을 사용하세요. 한국어는 lang="ko", 영어는 lang="en"입니다.', "WCAG 2.2 AA · 3.1.1", '<html lang="ko">'),
  "image-alt": rule("이미지를 대신 설명할 글이 없습니다", "이미지를 볼 수 없을 때 대신 전달할 설명이 없습니다.", "이미지를 볼 수 없는 사용자는 이미지가 전달하는 정보를 알 수 없습니다.", '정보를 전달하는 이미지에는 설명을 작성하세요. 개발 시 alt에 설명을 넣고, 장식 이미지는 alt=""로 처리합니다.', "WCAG 2.2 AA · 1.1.1", '<img src="car.png" alt="자동차보험 가입 안내">'),
  "button-name": rule("버튼의 용도를 알 수 없습니다", "버튼을 설명하는 글자나 이름이 없습니다.", "화면 읽기 프로그램 사용자는 이 버튼이 무엇을 하는지 구분할 수 없습니다.", "버튼에 기능을 설명하는 글자를 넣으세요. 아이콘 버튼은 개발 시 aria-label에 기능을 작성합니다.", "WCAG 2.2 AA · 4.1.2", '<button type="button" aria-label="닫기"></button>'),
  "link-name": rule("링크의 이동 위치를 알 수 없습니다", "링크에 이동할 위치나 기능을 설명하는 글자가 없습니다.", "사용자는 링크를 눌렀을 때 어디로 이동하는지 알 수 없습니다.", "링크에 이동할 페이지나 실행할 기능을 알 수 있는 글자를 작성하세요.", "WCAG 2.2 AA · 2.4.4, 4.1.2", '<a href="/insurance">자동차보험 안내 보기</a>'),
  label: rule("입력칸의 항목명을 알 수 없습니다", "이름, 이메일처럼 무엇을 입력해야 하는지 알려주는 항목명이 연결되지 않았습니다.", "사용자는 이 입력칸에 어떤 값을 입력해야 하는지 알기 어렵습니다.", "입력칸 가까이에 항목명을 표시하고 입력칸과 연결하세요. 개발 시 label의 for와 입력칸의 id를 같은 값으로 맞춥니다.", "WCAG 2.2 AA · 1.3.1, 3.3.2, 4.1.2", '<label for="user-name">이름</label>\n<input id="user-name" type="text">'),
  "select-name": rule("선택 상자의 항목명을 알 수 없습니다", "지역, 카드 종류처럼 무엇을 선택해야 하는지 알려주는 항목명이 없습니다.", "사용자는 이 선택 상자의 용도를 알기 어렵습니다.", "선택 상자 가까이에 항목명을 표시하고 서로 연결하세요. 개발 시 label을 select와 연결합니다.", "WCAG 2.2 AA · 1.3.1, 3.3.2, 4.1.2", '<label for="region">지역</label>\n<select id="region"></select>'),
  "aria-valid-attr": rule("화면 읽기용 정보의 이름이 잘못되었습니다", "화면 읽기 프로그램에 전달할 정보의 속성 이름이 올바르지 않습니다.", "요소의 기능이나 상태가 사용자에게 전달되지 않을 수 있습니다.", "개발자는 aria로 시작하는 속성 이름의 철자를 확인하고 지원되는 속성으로 수정하세요.", "WCAG 2.2 AA · 4.1.2", '<button aria-labelledby="button-title">확인</button>'),
  "aria-valid-attr-value": rule("화면 읽기용 정보에 잘못된 값이 있습니다", "화면 읽기 프로그램에 전달할 상태값을 인식할 수 없습니다.", "요소의 현재 상태가 사용자에게 잘못 전달될 수 있습니다.", "개발자는 해당 ARIA 속성에서 사용할 수 있는 값으로 수정하세요.", "WCAG 2.2 AA · 4.1.2", '<button aria-expanded="false">메뉴 열기</button>'),
  "aria-allowed-attr": rule("요소의 기능과 맞지 않는 상태 정보가 있습니다", "현재 요소에서 사용할 수 없는 화면 읽기용 정보가 적용되어 있습니다.", "요소의 기능이나 상태가 사용자에게 잘못 전달될 수 있습니다.", "요소의 실제 기능을 먼저 확인한 뒤 개발자는 role과 ARIA 속성을 맞게 수정하세요.", "WCAG 2.2 AA · 4.1.2", '<div role="checkbox" aria-checked="false">선택</div>'),
  "aria-required-attr": rule("요소의 상태 정보가 빠져 있습니다", "이 요소가 현재 선택됐는지, 펼쳐졌는지 같은 필수 상태를 알 수 없습니다.", "화면 읽기 프로그램 사용자는 요소의 현재 상태를 알 수 없습니다.", "요소가 가진 기능과 상태를 확인한 뒤 개발자는 필요한 ARIA 상태값을 추가하세요.", "WCAG 2.2 AA · 4.1.2", '<div role="checkbox" aria-checked="false">동의</div>'),
  "aria-roles": rule("요소의 기능 정보가 올바르지 않습니다", "버튼, 체크박스처럼 요소의 기능을 알려주는 값이 잘못되었습니다.", "화면 읽기 프로그램이 이 요소의 기능을 올바르게 알 수 없습니다.", "실제 기능에 맞는 HTML 요소를 사용하세요. 필요한 경우 개발자는 올바른 role로 수정합니다.", "WCAG 2.2 AA · 4.1.2", '<button type="button">확인</button>'),
  "color-contrast": rule("글자와 배경의 색상 차이를 확인해 주세요", "글자가 배경과 충분히 구분되는지 확인이 필요합니다.", "배경 이미지나 투명 효과가 있으면 자동으로 정확한 값을 계산하기 어려울 수 있습니다.", "글자색이나 배경색을 조정해 일반 글자는 4.5:1, 큰 글자는 3:1 이상의 명도 대비를 확보하세요.", "WCAG 2.2 AA · 1.4.3"),
  "heading-order": rule("제목 순서가 건너뛰었습니다", "큰 제목 다음에 중간 제목 없이 더 작은 단계의 제목이 사용됐습니다.", "페이지의 내용 구조와 상하 관계를 이해하기 어렵습니다.", "화면의 글자 크기가 아니라 내용 구조에 맞춰 제목 순서를 구성하세요. 개발 시 h1, h2, h3 순서로 사용합니다.", "WCAG 2.2 AA · 1.3.1, 2.4.6", "<h1>페이지 제목</h1>\n<h2>가입 정보</h2>\n<h3>계약자 정보</h3>"),
  "empty-heading": rule("글자가 없는 제목이 있습니다", "제목 영역이 비어 있어 어떤 내용의 제목인지 알 수 없습니다.", "빈 제목은 페이지 구조를 이해하는 데 방해가 됩니다.", "제목에 내용을 설명하는 글자를 작성하세요. 제목이 필요 없다면 빈 제목을 제거하세요.", "WCAG 2.2 AA · 1.3.1, 2.4.6"),
  list: rule("목록 구성이 올바르지 않습니다", "목록 안에 목록 항목이 아닌 내용이 섞여 있습니다.", "화면 읽기 프로그램이 항목 수와 목록 관계를 정확히 전달하기 어렵습니다.", "모든 목록 내용을 같은 목록 항목 형식으로 구성하세요. 개발 시 ul 또는 ol 바로 아래에는 li만 배치합니다.", "WCAG 2.2 AA · 1.3.1"),
  listitem: rule("목록 항목이 목록 밖에 있습니다", "목록 항목으로 만든 내용이 실제 목록 안에 포함되지 않았습니다.", "화면 읽기 프로그램이 올바른 목록으로 전달하지 못합니다.", "목록 항목을 하나의 목록 안에 배치하세요. 개발 시 li를 ul, ol 또는 menu 안에 넣습니다.", "WCAG 2.2 AA · 1.3.1"),
  "page-has-heading-one": rule("페이지를 대표하는 제목이 없습니다", "페이지 전체의 내용을 한눈에 알려주는 대표 제목을 찾지 못했습니다.", "대표 제목이 없으면 현재 페이지의 목적과 구조를 빠르게 파악하기 어렵습니다.", "페이지 내용을 대표하는 제목을 하나 작성하세요. 개발 시 가장 중요한 제목에 h1을 사용합니다.", "WCAG 2.2 AA · 1.3.1, 2.4.6", "<h1>자동차보험 가입</h1>"),
  "landmark-one-main": rule("페이지의 주요 내용 영역이 명확하지 않습니다", "페이지의 핵심 내용을 담은 영역이 없거나 여러 개 있습니다.", "화면 읽기 프로그램 사용자가 주요 내용으로 바로 이동하기 어렵습니다.", "페이지의 핵심 내용은 하나의 주요 영역으로 묶으세요. 개발 시 하나의 main을 사용합니다.", "WCAG 2.2 AA · 1.3.1, 2.4.1", "<main>\n  <h1>자동차보험 가입</h1>\n</main>"),
  region: rule("일부 내용이 페이지 영역으로 구분되지 않았습니다", "주요 내용이 머리말, 메뉴, 본문, 보조 내용, 꼬리말 중 어디에 속하는지 알기 어렵습니다.", "화면 읽기 프로그램 사용자가 페이지 구조를 파악하고 원하는 영역으로 이동하기 어렵습니다.", "콘텐츠의 목적에 맞는 페이지 영역 안에 배치하세요. 핵심 내용은 본문 영역에 넣습니다.", "WCAG 2.2 AA · 1.3.1, 2.4.1"),
  "landmark-unique": rule("같은 종류의 페이지 영역을 구분할 수 없습니다", "메뉴나 보조 영역이 여러 개 있지만 각각의 이름이 없습니다.", "사용자가 원하는 영역을 구분해 이동하기 어렵습니다.", "같은 종류의 영역이 여러 개라면 '주요 메뉴', '관련 메뉴'처럼 서로 다른 이름을 제공하세요.", "WCAG 2.2 AA · 1.3.1, 2.4.1"),
  "duplicate-id": rule("같은 요소 식별값이 여러 번 사용됐습니다", "페이지 안에서 서로 다른 요소가 같은 식별값을 사용하고 있습니다.", "항목명이나 도움말이 엉뚱한 요소에 연결될 수 있습니다.", "각 요소를 구분할 수 있도록 식별값을 다르게 지정하세요. 개발 시 id를 중복 사용하지 않습니다.", "WCAG 2.2 AA · 1.3.1, 4.1.2"),
  "duplicate-id-aria": rule("이름이나 설명의 연결 대상을 구분할 수 없습니다", "이름이나 설명으로 연결된 요소의 식별값이 여러 번 사용됐습니다.", "화면 읽기 프로그램이 어떤 요소를 이름이나 설명으로 사용해야 할지 알 수 없습니다.", "연결되는 요소마다 서로 다른 식별값을 사용하고 연결 정보도 함께 수정하세요.", "WCAG 2.2 AA · 1.3.1, 4.1.2"),
  "form-field-multiple-labels": rule("입력칸 하나에 항목명이 여러 개 연결됐습니다", "하나의 입력칸에 서로 다른 항목명이 함께 연결되어 있습니다.", "사용자가 어떤 항목명으로 이해해야 하는지 혼란스러울 수 있습니다.", "입력칸을 대표하는 항목명 하나만 연결하고 나머지 중복 연결은 제거하세요.", "WCAG 2.2 AA · 1.3.1, 3.3.2, 4.1.2"),
  "label-title-only": rule("입력칸의 항목명이 화면에 보이지 않습니다", "입력칸의 항목명이 마우스를 올렸을 때만 나타나는 정보로 제공됩니다.", "모바일이나 화면 읽기 프로그램에서는 항목명을 일관되게 확인하기 어렵습니다.", "입력칸 가까이에 항목명을 항상 보이게 표시하고 서로 연결하세요.", "WCAG 2.2 AA · 1.3.1, 3.3.2"),
  tabindex: rule("키보드 이동 순서가 화면 순서와 다릅니다", "키보드로 이동할 순서가 별도로 지정되어 있습니다.", "화면에 보이는 순서와 실제 이동 순서가 달라 다음 위치를 예측하기 어렵습니다.", "화면에 보이는 순서와 키보드 이동 순서를 같게 구성하세요. 개발자는 HTML 순서를 조정하고 양수 tabindex를 제거합니다.", "WCAG 2.2 AA · 2.4.3"),
  "meta-viewport": rule("사용자가 화면을 확대할 수 없습니다", "페이지 설정이 모바일 화면 확대를 막고 있습니다.", "글자가 잘 보이지 않는 사용자가 콘텐츠를 충분히 키워 읽기 어렵습니다.", "사용자가 화면을 자유롭게 확대할 수 있도록 제한을 제거하세요. 개발자는 viewport의 user-scalable=no, maximum-scale=1 같은 값을 확인합니다.", "WCAG 2.2 AA · 1.4.4"),
  "meta-viewport-large": rule("화면을 충분히 확대할 수 없습니다", "모바일 화면에서 허용된 최대 확대 크기가 너무 작습니다.", "글자가 잘 보이지 않는 사용자가 필요한 크기까지 콘텐츠를 확대할 수 없습니다.", "화면 확대 제한을 제거하거나 충분한 확대 크기를 허용하세요. 개발자는 viewport의 maximum-scale 값을 확인합니다.", "WCAG 2.2 AA · 1.4.4"),
};

const REVIEW_RULE_IDS = new Set(["heading-order", "landmark-one-main", "region", "landmark-unique", "page-has-heading-one"]);

function rule(title, description, reason, guide, standard, example = "") {
  return { title, description, reason, guide, standard, example };
}

export function getRuleDefinition(ruleId) {
  return A11Y_RULES[ruleId] || {
    title: "사용하기 불편할 수 있는 항목이 발견됐습니다",
    description: "자동 검사에서 접근성에 영향을 줄 수 있는 부분을 찾았습니다.",
    reason: "일부 사용자는 이 요소의 내용이나 기능을 이해하기 어려울 수 있습니다.",
    guide: "문제 요소와 현재 값을 확인한 뒤, 모든 사용자가 내용과 기능을 이해할 수 있도록 수정하세요.",
    standard: "WCAG 2.2 AA",
    example: "",
  };
}

export function getActionStatus({ ruleId, sourceType }) {
  if (sourceType === "passes") return "pass";
  if (sourceType === "incomplete") return "review";
  return REVIEW_RULE_IDS.has(ruleId) ? "review" : "required";
}

export function sortInspectionItems(first, second) {
  const statusOrder = { required: 0, review: 1, pass: 2 };
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3, unknown: 4 };
  return (statusOrder[first.status] ?? 9) - (statusOrder[second.status] ?? 9)
    || (impactOrder[first.impact] ?? 9) - (impactOrder[second.impact] ?? 9)
    || String(first.title || first.ruleId).localeCompare(String(second.title || second.ruleId), "ko");
}

export function analyzeNode({ ruleId, node, target, index, frameDocument, frameWindow, sourceType, rule: ruleDefinition }) {
  const base = {
    index,
    targetPath: node.target || [],
    targetText: Array.isArray(node.target) ? node.target.join(" ") : String(node.target || ""),
    html: node.html || getElementHtml(target),
    issue: sourceType === "passes" ? "자동 검사에서 통과했습니다." : ruleDefinition.description,
    reason: ruleDefinition.reason,
    guide: ruleDefinition.guide,
    example: ruleDefinition.example || "",
    currentValues: [],
    standard: ruleDefinition.standard || "",
    autoDecision: sourceType === "incomplete" ? "자동 검사에서 정확히 판정하지 못했습니다." : sourceType === "passes" ? "자동 검사에서 통과했습니다." : "자동 검사에서 오류가 확인되었습니다.",
    rawMessage: getAxeNodeMessage(node),
  };
  if (!target) return base;

  switch (ruleId) {
    case "color-contrast":
      return { ...base, ...analyzeColorContrast({ node, target, frameWindow }) };
    case "label":
    case "select-name":
      return { ...base, ...analyzeFormLabel({ target, frameDocument }) };
    case "form-field-multiple-labels": {
      const analysis = analyzeMultipleFormLabels({ target, frameDocument });
      return analysis ? { ...base, ...analysis } : null;
    }
    case "button-name":
    case "link-name":
      return { ...base, ...analyzeAccessibleName({ target, frameDocument, ruleId }) };
    case "image-alt":
      return { ...base, ...analyzeImageAlt(target) };
    case "duplicate-id":
    case "duplicate-id-aria":
      return { ...base, ...analyzeDuplicateId({ target, frameDocument }) };
    case "tabindex":
      return { ...base, currentValues: [createValue("tabindex", target.getAttribute("tabindex") ?? "없음")] };
    case "html-has-lang":
    case "html-lang-valid":
      return { ...base, currentValues: [createValue("html lang", frameDocument.documentElement.getAttribute("lang") || "없음")] };
    case "document-title":
      return { ...base, currentValues: [createValue("현재 title", frameDocument.title || "없음")] };
    case "meta-viewport":
      return { ...base, currentValues: [createValue("viewport", frameDocument.querySelector('meta[name="viewport"]')?.getAttribute("content") || "없음")] };
    case "heading-order":
      return { ...base, ...analyzeHeadingOrder(target) };
    case "label-title-only":
      return { ...base, ...analyzeTitleOnlyLabel({ node, target, frameDocument }) };
    default:
      return { ...base, currentValues: getElementAttributeValues(target) };
  }
}

export function runCustomRules({ frameDocument }) {
  const findings = [
    ...inspectBrokenLabelReferences(frameDocument),
    ...inspectAriaReferences(frameDocument),
    ...inspectEmptyAriaLabels(frameDocument),
    ...inspectSuspiciousImageAlts(frameDocument),
    ...inspectUnnamedTables(frameDocument),
  ];
  return groupCustomFindings(findings);
}

function analyzeTitleOnlyLabel({ node, target, frameDocument }) {
  const id = target.getAttribute("id") || "";
  const connectedLabels = id ? Array.from(frameDocument.querySelectorAll("label[for]")).filter((label) => label.getAttribute("for") === id) : [];
  const wrappingLabel = target.closest("label");
  return {
    issue: "입력칸의 항목명이 화면에 항상 보이지 않습니다.",
    reason: "마우스를 올렸을 때만 보이는 설명에 의존하면 모바일이나 화면 읽기 프로그램에서 항목명을 일관되게 확인하기 어렵습니다.",
    guide: "입력칸 가까이에 항목명을 항상 표시하고 서로 연결하세요. 개발 시 label의 for와 입력칸의 id를 같은 값으로 맞추고 title은 보조 설명에만 사용합니다.",
    currentValues: [createValue("input id", id || "없음"), createValue("연결된 label", connectedLabels.length + (wrappingLabel ? 1 : 0) || "없음"), createValue("title", target.getAttribute("title") || "없음")],
  };
}

function analyzeColorContrast({ node, target, frameWindow }) {
  const style = frameWindow.getComputedStyle(target);
  const axeMessage = getAxeNodeMessage(node);
  const contrastRatio = extractMessageValue(axeMessage, /(?:insufficient\s+)?color contrast of\s*([0-9.]+)(?::1)?/i) || extractMessageValue(axeMessage, /actual contrast ratio(?: is| of)?\s*([0-9.]+):1/i);
  const expectedRatio = extractMessageValue(axeMessage, /expected contrast ratio of\s*([0-9.]+):1/i);
  const foregroundColor = normalizeColorValue(extractMessageValue(axeMessage, /foreground color:\s*([^,;]+)/i) || style.color);
  const effectiveBackgroundColor = getEffectiveBackgroundColor(target, frameWindow);
  const backgroundColor = normalizeColorValue(extractMessageValue(axeMessage, /background color:\s*([^,;]+)/i) || effectiveBackgroundColor || style.backgroundColor);
  const numericFontSize = Number.parseFloat(style.fontSize) || 0;
  const numericFontWeight = Number.parseInt(style.fontWeight, 10) || 400;
  const isLargeText = numericFontSize >= 24 || (numericFontSize >= 18.66 && numericFontWeight >= 700);
  const requiredRatio = expectedRatio || (isLargeText ? "3.0" : "4.5");
  const canCalculate = style.backgroundImage === "none" && Number.parseFloat(style.opacity) === 1 && !isTransparentColor(style.color) && !isTransparentColor(effectiveBackgroundColor);
  const resolvedRatio = contrastRatio || (canCalculate ? calculateContrastRatio(style.color, effectiveBackgroundColor) : "");
  const isFailure = resolvedRatio && Number.parseFloat(resolvedRatio) < Number.parseFloat(requiredRatio);
  return {
    issue: !resolvedRatio ? "글자가 배경과 충분히 구분되는지 직접 확인해야 합니다." : isFailure ? "글자와 배경의 색상 차이가 기준보다 작습니다." : "글자와 배경이 충분히 구분됩니다.",
    reason: resolvedRatio ? (isLargeText ? "큰 글자는 배경과 최소 3:1의 색상 차이가 필요합니다." : "일반 글자는 배경과 최소 4.5:1의 색상 차이가 필요합니다.") : "배경 이미지나 투명 효과 때문에 자동 검사에서 현재 색상 차이를 정확히 계산하지 못했습니다.",
    guide: `글자가 배경에서 또렷하게 보이도록 글자색이나 배경색을 조정하세요. 필요한 명도 대비는 ${requiredRatio}:1 이상입니다.`,
    currentValues: [resolvedRatio ? createValue("현재 대비", `${resolvedRatio}:1`) : null, createValue("필요한 대비", `${requiredRatio}:1`), createValue("글자색", foregroundColor), createValue("배경색", backgroundColor)].filter(Boolean),
    contrastStatus: !resolvedRatio ? "review" : isFailure ? "fail" : "pass",
  };
}

function analyzeFormLabel({ target, frameDocument }) {
  const id = target.getAttribute("id") || "";
  const explicitLabels = id ? Array.from(frameDocument.querySelectorAll(`label[for="${escapeCssIdentifier(id)}"]`)) : [];
  const wrappingLabel = target.closest("label");
  const ariaLabel = target.getAttribute("aria-label");
  const ariaLabelledby = target.getAttribute("aria-labelledby");
  if (ariaLabel !== null && !ariaLabel.trim()) {
    return { issue: "입력칸을 설명하는 항목명이 비어 있습니다.", reason: "화면 읽기 프로그램에 전달되는 이름이 비어 있어 무엇을 입력해야 하는지 알 수 없습니다.", guide: "입력칸 가까이에 항목명을 표시하고 서로 연결하세요. 화면에 표시하기 어렵다면 개발 시 aria-label에 입력칸의 용도를 작성합니다.", currentValues: [createValue("aria-label", '""'), createValue("input id", id || "없음")] };
  }
  if (ariaLabelledby) {
    const missingIds = ariaLabelledby.trim().split(/\s+/).filter((referenceId) => !frameDocument.getElementById(referenceId));
    if (missingIds.length) return { issue: "입력칸과 연결된 항목명을 찾을 수 없습니다.", reason: "입력칸이 가리키는 항목명 요소가 현재 페이지에 없습니다.", guide: "화면의 항목명과 입력칸을 다시 연결하세요. 개발자는 aria-labelledby가 실제 요소의 id를 가리키는지 확인합니다.", currentValues: [createValue("aria-labelledby", ariaLabelledby), createValue("찾을 수 없는 id", missingIds.join(", "))] };
  }
  const labels = Array.from(new Set([...explicitLabels, ...(wrappingLabel ? [wrappingLabel] : [])]));
  if (!labels.length && !ariaLabel?.trim() && !ariaLabelledby) return { issue: "입력칸에 항목명이 연결되지 않았습니다.", reason: "사용자에게 무엇을 입력하거나 선택해야 하는지 알려주는 이름이 없습니다.", guide: "입력칸 가까이에 항목명을 표시하고 서로 연결하세요. 개발 시 label의 for와 입력칸의 id를 같은 값으로 맞춥니다.", currentValues: [createValue("input id", id || "없음"), createValue("label 연결", "없음")] };
  return { currentValues: [createValue("input id", id || "없음"), createValue("연결된 label", labels.length ? `${labels.length}개` : "없음"), createValue("label 내용", labels.map((label) => label.textContent.trim()).filter(Boolean).join(" / ") || "없음")] };
}

function analyzeAccessibleName({ target, frameDocument, ruleId }) {
  const text = target.textContent.trim();
  const ariaLabel = target.getAttribute("aria-label");
  const ariaLabelledby = target.getAttribute("aria-labelledby");
  const labelledbyText = getReferencedText(ariaLabelledby, frameDocument);
  const imageAlt = Array.from(target.querySelectorAll("img")).map((image) => image.getAttribute("alt") || "").join(" ").trim();
  const accessibleName = text || ariaLabel?.trim() || labelledbyText || imageAlt || target.getAttribute("title")?.trim() || "";
  const elementLabel = ruleId === "button-name" ? "버튼" : "링크";
  const issue = ruleId === "button-name" ? "버튼의 용도를 알 수 없습니다." : "링크의 이동 위치를 알 수 없습니다.";
  return { issue, reason: `${elementLabel}에 기능이나 이동 위치를 알려주는 설명이 없습니다.`, guide: ruleId === "button-name" ? "버튼에 기능을 설명하는 글자를 넣으세요. 아이콘만 있는 버튼은 개발 시 aria-label에 기능을 작성합니다." : "링크에 이동할 페이지나 실행할 기능을 알 수 있는 글자를 작성하세요.", currentValues: [createValue("화면 텍스트", text || "없음"), createValue("aria-label", ariaLabel ?? "없음"), createValue("aria-labelledby", ariaLabelledby ?? "없음"), createValue("계산된 이름", accessibleName || "없음")] };
}

function analyzeImageAlt(target) {
  const alt = target.getAttribute("alt");
  const src = target.getAttribute("src") || "";
  if (alt === null) return { issue: "이미지를 대신 설명할 글이 없습니다.", reason: "이미지를 볼 수 없는 사용자는 이미지의 내용이나 기능을 알 수 없습니다.", guide: '정보를 전달하는 이미지에는 내용을 설명하는 글을 작성하세요. 개발 시 alt에 설명을 넣고, 장식 이미지는 alt=""로 처리합니다.', currentValues: [createValue("alt", "속성 없음"), createValue("src", src || "없음")] };
  if (!alt.trim()) return { issue: "이미지 설명이 비어 있습니다.", reason: "이 이미지가 정보 전달용인지 단순 장식용인지 자동 검사만으로 판단할 수 없습니다.", guide: '정보를 전달하는 이미지라면 alt에 설명을 작성하세요. 장식 이미지라면 alt=""를 유지합니다.', currentValues: [createValue("alt", '""'), createValue("src", src || "없음")] };
  if (looksLikeFileName(alt)) return { issue: "이미지 설명이 파일명으로 되어 있습니다.", reason: "파일명만으로는 이미지가 전달하는 내용이나 기능을 알기 어렵습니다.", guide: "파일명 대신 이미지의 내용이나 기능을 설명하는 문구를 작성하세요. 개발 시 alt 값을 수정합니다.", currentValues: [createValue("alt", alt), createValue("src", src || "없음")] };
  return { currentValues: [createValue("alt", alt), createValue("src", src || "없음")] };
}

function analyzeDuplicateId({ target, frameDocument }) {
  const id = target.getAttribute("id") || "";
  const count = id ? Array.from(frameDocument.querySelectorAll("[id]")).filter((element) => element.getAttribute("id") === id).length : 0;
  return { issue: "같은 요소 식별값이 여러 번 사용됐습니다.", reason: `식별값 "${id}"가 페이지 안의 ${count}개 요소에 사용되어 연결 대상을 구분할 수 없습니다.`, guide: "각 요소를 구분할 수 있도록 식별값을 다르게 지정하세요. 개발 시 id와 이를 가리키는 for, aria-labelledby를 함께 수정합니다.", currentValues: [createValue("중복된 id", id || "없음"), createValue("사용된 요소 수", `${count}개`)] };
}

function analyzeHeadingOrder(target) {
  const headings = Array.from(target.ownerDocument.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const previous = headings[headings.indexOf(target) - 1];
  return { issue: "제목 순서가 중간 단계를 건너뛰었습니다.", reason: "제목 순서가 이어지지 않으면 내용의 상하 관계를 이해하기 어렵습니다.", guide: "글자 크기가 아니라 내용 구조에 맞춰 큰 제목부터 작은 제목 순서로 구성하세요. 개발 시 h1, h2, h3 순서를 확인합니다.", currentValues: [createValue("현재 제목", target.tagName.toLowerCase()), createValue("이전 제목", previous ? previous.tagName.toLowerCase() : "찾을 수 없음")] };
}

function analyzeMultipleFormLabels({ target, frameDocument }) {
  const id = target.getAttribute("id") || "";
  const duplicateInputs = id ? Array.from(frameDocument.querySelectorAll("[id]")).filter((element) => element.getAttribute("id") === id) : [];
  if (duplicateInputs.length > 1) return { issue: "여러 입력칸에 같은 식별값이 사용됐습니다.", reason: `${duplicateInputs.length}개의 입력칸이 식별값 "${id}"를 함께 사용해 항목명을 어느 입력칸에 연결해야 할지 알 수 없습니다.`, guide: "각 입력칸을 구분할 수 있도록 식별값을 다르게 지정하세요. 개발 시 입력칸의 id와 항목명의 for를 함께 수정합니다.", currentValues: [createValue("중복된 id", id), createValue("같은 id의 요소", `${duplicateInputs.length}개`), createValue("name", target.getAttribute("name") || "없음")] };
  const connectedLabels = id ? Array.from(frameDocument.querySelectorAll("label[for]")).filter((label) => label.getAttribute("for") === id) : [];
  const wrappingLabels = [];
  let current = target.parentElement;
  while (current) {
    if (current.tagName === "LABEL") wrappingLabels.push(current);
    current = current.parentElement;
  }
  const labels = Array.from(new Set([...connectedLabels, ...wrappingLabels]));
  if (labels.length > 1) return { issue: "입력칸 하나에 항목명이 여러 개 연결됐습니다.", reason: `하나의 입력칸에 ${labels.length}개의 항목명이 연결되어 어떤 이름으로 이해해야 할지 혼란스러울 수 있습니다.`, guide: "입력칸을 대표하는 항목명 하나만 남기세요. 개발 시 중복된 label의 for 또는 감싸는 구조를 수정합니다.", currentValues: [createValue("input id", id || "없음"), createValue("연결된 label", `${labels.length}개`), createValue("label 내용", labels.map((label) => label.textContent.replace(/\s+/g, " ").trim()).filter(Boolean).join(" / ") || "없음")] };
  return null;
}

function inspectBrokenLabelReferences(frameDocument) {
  return Array.from(frameDocument.querySelectorAll("label[for]")).flatMap((label) => {
    const forValue = label.getAttribute("for");
    if (!forValue || frameDocument.getElementById(forValue)) return [];
    return [customFinding("custom-label-reference", "required", "serious", "항목명이 입력칸과 연결되지 않았습니다", "항목명과 연결할 입력칸을 찾을 수 없습니다.", "화면에는 항목명이 있지만 어떤 입력칸을 설명하는지 연결 정보가 끊어져 있습니다.", "항목명과 해당 입력칸을 다시 연결하세요. 개발 시 label의 for와 입력칸의 id를 같은 값으로 맞춥니다.", "WCAG 2.2 AA · 1.3.1, 3.3.2", label, frameDocument, [createValue("label for", forValue), createValue("참조 대상", "찾을 수 없음")])];
  });
}

function inspectAriaReferences(frameDocument) {
  const attrs = ["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-activedescendant"];
  return Array.from(frameDocument.querySelectorAll(attrs.map((attr) => `[${attr}]`).join(","))).flatMap((element) => attrs.flatMap((attr) => {
    const value = element.getAttribute(attr);
    if (!value) return [];
    const missing = value.trim().split(/\s+/).filter((id) => !frameDocument.getElementById(id));
    if (!missing.length) return [];
    return [customFinding("custom-aria-reference", "required", "serious", "화면 읽기용 정보의 연결 대상이 없습니다", "요소의 이름, 설명 또는 상태와 연결할 대상을 찾을 수 없습니다.", "연결 대상으로 지정된 요소가 현재 페이지에 없어 화면 읽기 프로그램에 정보가 제대로 전달되지 않습니다.", "이름이나 설명으로 연결할 요소가 실제로 있는지 확인하세요. 개발자는 해당 ARIA 속성이 실제 요소의 id를 가리키도록 수정합니다.", "WCAG 2.2 AA · 1.3.1, 4.1.2", element, frameDocument, [createValue(attr, value), createValue("찾을 수 없는 id", missing.join(", "))])];
  }));
}

function inspectEmptyAriaLabels(frameDocument) {
  return Array.from(frameDocument.querySelectorAll("[aria-label]")).flatMap((element) => element.getAttribute("aria-label")?.trim() ? [] : [customFinding("custom-empty-aria-label", "required", "serious", "요소의 이름이 비어 있습니다", "화면 읽기 프로그램에 전달할 요소의 이름이 비어 있습니다.", "이름이 없으면 사용자는 이 요소의 기능이나 용도를 알 수 없습니다.", "요소의 기능이나 용도를 알 수 있는 이름을 작성하세요. 개발 시 aria-label에 내용을 넣거나 불필요한 빈 속성을 제거합니다.", "WCAG 2.2 AA · 4.1.2", element, frameDocument, [createValue("aria-label", '""')])]);
}

function inspectSuspiciousImageAlts(frameDocument) {
  return Array.from(frameDocument.querySelectorAll("img[alt]")).flatMap((image) => {
    const alt = image.getAttribute("alt") || "";
    const src = image.getAttribute("src") || "없음";
    if (!alt.trim()) return [customFinding("custom-empty-image-alt", "review", "moderate", "이 이미지에 설명이 필요한지 확인해 주세요", "이미지를 대신 설명할 글이 비어 있습니다.", "이 이미지가 내용을 이해하는 데 필요한지 단순 장식인지 자동 검사만으로 판단할 수 없습니다.", '정보를 전달하는 이미지라면 설명을 작성하세요. 장식 이미지라면 비워 둡니다. 개발 시 alt 값을 확인합니다.', "WCAG 2.2 AA · 1.1.1", image, frameDocument, [createValue("alt", '""'), createValue("src", src)])];
    if (!looksLikeFileName(alt)) return [];
    return [customFinding("custom-file-name-alt", "review", "moderate", "이미지 설명이 파일명으로 되어 있습니다", "이미지를 설명하는 글에 파일명이 입력되어 있습니다.", "파일명만으로는 이미지가 전달하는 내용이나 기능을 알기 어렵습니다.", "파일명 대신 이미지의 내용이나 기능을 설명하는 문구를 작성하세요. 개발 시 alt 값을 수정합니다.", "WCAG 2.2 AA · 1.1.1", image, frameDocument, [createValue("alt", alt), createValue("src", src)])];
  });
}

function inspectUnnamedTables(frameDocument) {
  return Array.from(frameDocument.querySelectorAll("table")).flatMap((table) => {
    const role = table.getAttribute("role");
    if (role === "presentation" || role === "none") return [];
    const caption = Array.from(table.children).find((child) => child.tagName === "CAPTION")?.textContent?.trim() || "";
    const ariaLabel = table.getAttribute("aria-label")?.trim() || "";
    const labelledby = table.getAttribute("aria-labelledby")?.trim() || "";
    const labelledbyText = getReferencedText(labelledby, frameDocument);
    if (caption || ariaLabel || labelledbyText) return [];
    return [customFinding(
      "custom-table-name",
      "review",
      "moderate",
      "표의 제목을 확인해 주세요",
      "표의 내용을 알려주는 제목이 연결되어 있지 않습니다.",
      "표 주변에 제목이 보이더라도 화면 읽기 프로그램은 그 제목이 표를 설명하는지 알지 못할 수 있습니다.",
      "표에 내용을 설명하는 제목을 연결하세요. 개발 시 caption을 넣거나 기존 제목의 id를 table의 aria-labelledby로 연결합니다.",
      "WCAG 2.2 AA · 1.3.1",
      table,
      frameDocument,
      [createValue("caption", "없음"), createValue("aria-label", "없음"), createValue("aria-labelledby", "없음")],
    )];
  });
}

function customFinding(id, status, impact, title, description, reason, guide, standard, target, frameDocument, currentValues) {
  const selector = createUniqueSelector(target, frameDocument);
  return { id, sourceType: "custom", status, impact, title, description, reason, guide, standard, nodes: [{ targetPath: [selector], targetText: selector, html: getElementHtml(target), issue: description, reason, guide, currentValues, standard, rawMessage: "" }] };
}

function groupCustomFindings(findings) {
  const groups = new Map();
  findings.forEach((finding) => {
    const key = [finding.id, finding.status, finding.title].join("::");
    if (!groups.has(key)) groups.set(key, { ...finding, nodes: [] });
    groups.get(key).nodes.push(...finding.nodes);
  });
  return Array.from(groups.values());
}

export function createValue(label, value) {
  return { label, value: value === undefined || value === null || value === "" ? "없음" : String(value) };
}

function getNodeChecks(node) {
  return [...(node.any || []), ...(node.all || []), ...(node.none || [])];
}

function getAxeNodeMessage(node) {
  return getNodeChecks(node).map((check) => check.message).filter(Boolean).join(" ");
}

function getElementHtml(target) {
  try {
    return target?.outerHTML || "";
  } catch {
    return "";
  }
}

function getElementAttributeValues(target) {
  return Array.from(target?.attributes || []).map((attribute) => createValue(attribute.name, attribute.value));
}

function getReferencedText(idReference, frameDocument) {
  return String(idReference || "").trim().split(/\s+/).filter(Boolean).map((id) => frameDocument.getElementById(id)?.textContent?.trim() || "").filter(Boolean).join(" ");
}

function createUniqueSelector(element, frameDocument) {
  if (!element || !frameDocument) return "";
  if (element.id) {
    const selector = `#${escapeCssIdentifier(element.id)}`;
    try {
      if (frameDocument.querySelectorAll(selector).length === 1) return selector;
    } catch {}
  }
  const parts = [];
  let current = element;
  while (current && current.nodeType === 1 && current !== frameDocument.body) {
    let selector = current.tagName.toLowerCase();
    const classNames = Array.from(current.classList || []).filter(Boolean).slice(0, 2);
    if (classNames.length) selector += classNames.map((className) => `.${escapeCssIdentifier(className)}`).join("");
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child) => child.tagName === current.tagName);
      if (siblings.length > 1) selector += `:nth-of-type(${siblings.indexOf(current) + 1})`;
    }
    parts.unshift(selector);
    const fullSelector = parts.join(" > ");
    try {
      if (frameDocument.querySelectorAll(fullSelector).length === 1) return fullSelector;
    } catch {}
    current = parent;
  }
  return parts.join(" > ");
}

function escapeCssIdentifier(value) {
  if (window.CSS?.escape) return window.CSS.escape(value);
  return String(value).replace(/([^\w-])/g, "\\$1");
}

function looksLikeFileName(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i.test(normalized) || normalized.includes("/") || normalized.includes("\\");
}

function extractMessageValue(message, pattern) {
  return message?.match(pattern)?.[1]?.trim() || "";
}

function normalizeColorValue(color) {
  const value = String(color || "").trim();
  const match = value.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*([0-9.]+))?\s*\)/i);
  if (!match) return value.startsWith("#") ? value.toUpperCase() : value;
  if (match[4] !== undefined && Number(match[4]) < 1) return value;
  const toHex = (number) => Math.round(Number(number)).toString(16).padStart(2, "0").toUpperCase();
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function isTransparentColor(color) {
  const normalized = String(color || "").replace(/\s+/g, "").toLowerCase();
  return !normalized || normalized === "transparent" || normalized === "rgba(0,0,0,0)" || normalized.endsWith(",0)");
}

function getEffectiveBackgroundColor(element, frameWindow) {
  let current = element;
  while (current) {
    const color = frameWindow.getComputedStyle(current).backgroundColor;
    if (color && !isTransparentColor(color)) return color;
    current = current.parentElement;
  }
  return "";
}

function calculateContrastRatio(foregroundColor, backgroundColor) {
  const fg = parseCssColor(foregroundColor);
  const bg = parseCssColor(backgroundColor);
  if (!fg || !bg) return "";
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
}

function parseCssColor(color) {
  const rgb = String(color || "").match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i);
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  const hex = String(color || "").match(/^#([0-9a-f]{6})$/i);
  if (!hex) return null;
  return { r: Number.parseInt(hex[1].slice(0, 2), 16), g: Number.parseInt(hex[1].slice(2, 4), 16), b: Number.parseInt(hex[1].slice(4, 6), 16) };
}

function luminance({ r, g, b }) {
  const convert = (channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * convert(r) + 0.7152 * convert(g) + 0.0722 * convert(b);
}
