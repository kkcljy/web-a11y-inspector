const searchInput = document.querySelector("[data-guide-search]");
const categorySelect = document.querySelector("[data-guide-category]");
const countLabel = document.querySelector("[data-guide-count]");
const emptyState = document.querySelector("[data-guide-empty]");
const rules = Array.from(document.querySelectorAll(".lens-guide-rule"));
const codeBlocks = Array.from(document.querySelectorAll(".lens-guide-code pre code"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let guideGroups = [];
let selectedGuideGroup = "ui-components";
let guideGroupButtons = [];
let guideGroupSelect = null;

const GUIDE_IDS = new Map([
  ["탭", "guide-tabs"],
  ["아코디언", "guide-accordion"],
  ["모달과 레이어", "guide-modal"],
  ["버튼과 링크", "guide-buttons-links"],
  ["입력 항목명, 도움말과 오류", "guide-form-labels-errors"],
  ["체크박스와 라디오 그룹", "guide-checkbox-radio"],
  ["선택창과 자동완성", "guide-select-combobox"],
  ["이미지 대체 텍스트", "guide-image-alt"],
  ["글자와 UI 명도 대비", "guide-color-contrast"],
  ["데이터 표", "guide-data-table"],
  ["제목과 페이지 영역", "guide-headings-landmarks"],
  ["키보드 포커스", "guide-keyboard-focus"],
  ["상태 메시지와 알림", "guide-status-message"],
  ["메뉴 버튼과 드롭다운", "guide-menu-button"],
  ["툴팁과 도움말", "guide-tooltip"],
  ["캐러셀과 슬라이드", "guide-carousel"],
  ["페이지네이션", "guide-pagination"],
  ["현재 위치와 브레드크럼", "guide-breadcrumb"],
  ["날짜 입력과 달력", "guide-date-picker"],
  ["파일 업로드", "guide-file-upload"],
  ["동영상과 음성", "guide-media"],
  ["iframe과 외부 콘텐츠", "guide-iframe"],
  ["움직임과 시간 제한", "guide-motion-timeout"],
  ["드래그와 복잡한 제스처", "guide-drag-gesture"],
  ["스위치와 토글 버튼", "guide-switch-toggle"],
  ["로딩과 진행률", "guide-loading-progress"],
  ["단계형 폼과 스테퍼", "guide-stepper"],
  ["전체 클릭 카드", "guide-clickable-card"],
  ["개인정보 입력과 자동완성", "guide-personal-autocomplete"],
  ["본문 바로가기", "guide-skip-link"],
  ["페이지 제목과 언어", "guide-title-language"],
  ["숨김 콘텐츠", "guide-hidden-content"],
  ["차트와 데이터 시각화", "guide-chart"],
  ["무한 스크롤과 더보기", "guide-infinite-scroll"],
  ["오류 요약과 제출 후 포커스", "guide-form-error-summary"],
  ["포커스 관리와 동적 화면 전환", "guide-focus-transition"],
  ["확대·리플로우·반응형 레이아웃", "guide-reflow"],
  ["터치 대상과 포인터 입력", "guide-touch-pointer"],
  ["인증과 비밀번호 입력", "guide-auth-password"],
]);

const GUIDE_BADGES = new Map([
  ["탭", ["ARIA 필요", "키보드 필수", "상태 알림"]],
  ["아코디언", ["기본 HTML", "ARIA 필요", "키보드 필수"]],
  ["모달과 레이어", ["기본 HTML", "키보드 필수", "수동 확인 필요"]],
  ["버튼과 링크", ["기본 HTML", "키보드 필수"]],
  ["입력 항목명, 도움말과 오류", ["기본 HTML", "ARIA 필요", "상태 알림"]],
  ["체크박스와 라디오 그룹", ["기본 HTML", "키보드 필수"]],
  ["선택창과 자동완성", ["기본 HTML", "ARIA 필요", "키보드 필수"]],
  ["이미지 대체 텍스트", ["기본 HTML", "수동 확인 필요"]],
  ["글자와 UI 명도 대비", ["수동 확인 필요"]],
  ["데이터 표", ["기본 HTML", "수동 확인 필요"]],
  ["키보드 포커스", ["키보드 필수", "수동 확인 필요"]],
  ["상태 메시지와 알림", ["ARIA 필요", "상태 알림"]],
  ["메뉴 버튼과 드롭다운", ["ARIA 필요", "키보드 필수"]],
  ["툴팁과 도움말", ["ARIA 필요", "키보드 필수"]],
  ["캐러셀과 슬라이드", ["ARIA 필요", "키보드 필수", "수동 확인 필요"]],
  ["파일 업로드", ["기본 HTML", "상태 알림"]],
  ["동영상과 음성", ["기본 HTML", "수동 확인 필요"]],
  ["움직임과 시간 제한", ["수동 확인 필요"]],
  ["스위치와 토글 버튼", ["ARIA 필요", "키보드 필수"]],
  ["로딩과 진행률", ["기본 HTML", "ARIA 필요", "상태 알림"]],
  ["단계형 폼과 스테퍼", ["ARIA 필요", "상태 알림"]],
  ["본문 바로가기", ["기본 HTML", "키보드 필수"]],
  ["페이지 제목과 언어", ["기본 HTML"]],
  ["차트와 데이터 시각화", ["ARIA 필요", "수동 확인 필요"]],
  ["무한 스크롤과 더보기", ["기본 HTML", "상태 알림", "키보드 필수"]],
  ["오류 요약과 제출 후 포커스", ["기본 HTML", "ARIA 필요", "상태 알림"]],
  ["포커스 관리와 동적 화면 전환", ["키보드 필수", "수동 확인 필요"]],
  ["확대·리플로우·반응형 레이아웃", ["수동 확인 필요"]],
  ["터치 대상과 포인터 입력", ["키보드 필수", "수동 확인 필요"]],
  ["인증과 비밀번호 입력", ["기본 HTML", "ARIA 필요", "수동 확인 필요"]],
]);

const GUIDE_GROUPS = [
  {
    id: "ui-components",
    title: "UI 컴포넌트",
    items: ["탭", "아코디언", "모달과 레이어", "버튼과 링크", "메뉴 버튼과 드롭다운", "툴팁과 도움말", "캐러셀과 슬라이드", "스위치와 토글 버튼", "전체 클릭 카드"],
  },
  {
    id: "forms-inputs",
    title: "폼 & 입력",
    items: ["입력 항목명, 도움말과 오류", "체크박스와 라디오 그룹", "선택창과 자동완성", "날짜 입력과 달력", "파일 업로드", "개인정보 입력과 자동완성", "인증과 비밀번호 입력", "오류 요약과 제출 후 포커스"],
  },
  {
    id: "keyboard-focus",
    title: "키보드 & 포커스",
    items: ["키보드 포커스", "포커스 관리와 동적 화면 전환", "드래그와 복잡한 제스처"],
  },
  {
    id: "content-structure",
    title: "콘텐츠 & 구조",
    items: ["이미지 대체 텍스트", "데이터 표", "제목과 페이지 영역", "페이지네이션", "현재 위치와 브레드크럼", "iframe과 외부 콘텐츠", "본문 바로가기", "페이지 제목과 언어", "숨김 콘텐츠", "차트와 데이터 시각화", "단계형 폼과 스테퍼"],
  },
  {
    id: "visual-responsive",
    title: "시각 & 반응형",
    items: ["글자와 UI 명도 대비", "확대·리플로우·반응형 레이아웃", "터치 대상과 포인터 입력", "움직임과 시간 제한"],
  },
  {
    id: "state-dynamic",
    title: "상태 & 동적 UI",
    items: ["상태 메시지와 알림", "로딩과 진행률", "무한 스크롤과 더보기"],
  },
  {
    id: "media",
    title: "미디어",
    items: ["동영상과 음성"],
  },
];

const GUIDE_GROUP_BY_TITLE = new Map(
  GUIDE_GROUPS.flatMap((group) => group.items.map((title) => [title, group.id])),
);

const escapeCode = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const formatHtml = (source) => {
  const voidElements = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
  const tokens = source
    .trim()
    .replace(/>\s+</g, "><")
    .split(/(?=<)|(?<=>)/)
    .map((token) => token.trim())
    .filter(Boolean);
  const lines = [];
  let depth = 0;

  tokens.forEach((token) => {
    const isClosing = /^<\//.test(token);
    const openingMatch = token.match(/^<([a-z][\w:-]*)\b/i);
    const isComment = /^<!--/.test(token);
    const isSelfClosing = /\/>$/.test(token);

    if (isClosing) depth = Math.max(0, depth - 1);
    lines.push(`${"  ".repeat(depth)}${token}`);

    if (openingMatch && !isComment && !isSelfClosing && !voidElements.test(openingMatch[1])) {
      depth += 1;
    }
  });

  return lines.join("\n");
};

const formatCss = (source) => {
  const lines = [];
  let depth = 0;

  source
    .trim()
    .replace(/\s*{\s*/g, " {\n")
    .replace(/;\s*/g, ";\n")
    .replace(/\s*}\s*/g, "\n}\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line === "}") depth = Math.max(0, depth - 1);
      lines.push(`${"  ".repeat(depth)}${line}`);
      if (line.endsWith("{")) depth += 1;
    });

  return lines.join("\n");
};

const highlightHtml = (source) => {
  const escaped = escapeCode(source);
  const tokenPattern =
    /(&lt;!--[\s\S]*?--&gt;|&lt;\/?[a-z][\w:-]*|[a-z_:][\w:.-]*(?==)|"(?:[^"]*)"|'(?:[^']*)'|\/?&gt;)/gi;

  return escaped.replace(tokenPattern, (token) => {
    let type = "punctuation";

    if (token.startsWith("&lt;!--")) type = "comment";
    else if (token.startsWith("&lt;")) type = "tag";
    else if (token.startsWith('"') || token.startsWith("'")) type = "string";
    else if (!token.includes("&gt;")) type = "attribute";

    return `<span class="code-token code-token--${type}">${token}</span>`;
  });
};

const highlightCss = (source) => {
  const escaped = escapeCode(source);
  const tokenPattern =
    /(\/\*[\s\S]*?\*\/|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|@[a-z-]+|#[0-9a-f]{3,8}\b|(?:--[\w-]+|[a-z-]+)(?=\s*:)|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms)?\b|[{}])/gi;

  return escaped.replace(tokenPattern, (token) => {
    let type = "number";

    if (token.startsWith("/*")) type = "comment";
    else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("#")) type = "string";
    else if (token.startsWith("@")) type = "keyword";
    else if (token === "{" || token === "}") type = "brace";
    else if (/^(?:--[\w-]+|[a-z-]+)$/i.test(token)) type = "property";

    return `<span class="code-token code-token--${type}">${token}</span>`;
  });
};

const enhanceCodeBlocks = () => {
  codeBlocks.forEach((codeBlock) => {
    const source = codeBlock.textContent.trim();
    const language = source.startsWith("<") ? "html" : "css";
    const formatted = language === "html" ? formatHtml(source) : formatCss(source);

    codeBlock.innerHTML = language === "html" ? highlightHtml(formatted) : highlightCss(formatted);
    codeBlock.closest("pre")?.setAttribute("data-code-language", language.toUpperCase());
  });
};

function getGuideTitle(rule) {
  return rule.querySelector(".lens-guide-rule__trigger strong")?.textContent.trim() || "";
}

function setupGuideGroups() {
  const container = document.querySelector("[data-guide-rules]");
  if (!container) return;

  const groups = new Map();
  const fragment = document.createDocumentFragment();

  GUIDE_GROUPS.forEach(({ id, title }) => {
    const group = document.createElement("section");
    const heading = document.createElement("h3");
    const items = document.createElement("div");
    group.className = "lens-guide-category";
    group.dataset.guideGroup = id;
    heading.className = "lens-guide-category__title";
    heading.id = `guide-category-${id}`;
    heading.textContent = title;
    items.className = "lens-guide-category__items";
    group.setAttribute("aria-labelledby", heading.id);
    group.append(heading, items);
    groups.set(id, items);
    fragment.append(group);
  });

  rules.forEach((rule) => {
    const groupId = GUIDE_GROUP_BY_TITLE.get(getGuideTitle(rule)) || "content-structure";
    rule.dataset.guideGroup = groupId;
    groups.get(groupId)?.append(rule);
  });

  container.replaceChildren(fragment);
  guideGroups = Array.from(container.querySelectorAll(".lens-guide-category"));
  setupGuideGroupControls(container);
}

function setupGuideGroupControls(container) {
  const navigation = document.createElement("nav");
  const list = document.createElement("ul");
  navigation.className = "lens-guide-category-nav";
  navigation.setAttribute("aria-label", "접근성 패턴 카테고리");
  list.className = "lens-guide-category-nav__list";

  GUIDE_GROUPS.forEach(({ id, title }) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    item.className = "lens-guide-category-nav__item";
    button.className = "lens-guide-category-nav__button";
    button.type = "button";
    button.textContent = title;
    button.dataset.guideGroup = id;
    button.setAttribute("aria-pressed", String(id === selectedGuideGroup));
    button.addEventListener("click", () => selectGuideGroup(id));
    item.append(button);
    list.append(item);
  });

  const mobileLabel = document.createElement("label");
  mobileLabel.className = "lens-guide-category-select";
  mobileLabel.innerHTML = '<span>패턴 카테고리</span>';
  guideGroupSelect = document.createElement("select");
  guideGroupSelect.setAttribute("aria-label", "패턴 카테고리");
  GUIDE_GROUPS.forEach(({ id, title }) => {
    const option = new Option(title, id, false, id === selectedGuideGroup);
    guideGroupSelect.append(option);
  });
  guideGroupSelect.addEventListener("change", () => selectGuideGroup(guideGroupSelect.value));
  mobileLabel.append(guideGroupSelect);

  navigation.append(list);
  container.before(navigation, mobileLabel);
  guideGroupButtons = Array.from(navigation.querySelectorAll("button"));
}

function selectGuideGroup(groupId) {
  if (!GUIDE_GROUP_BY_TITLE.size || !GUIDE_GROUPS.some(({ id }) => id === groupId)) return;
  selectedGuideGroup = groupId;
  guideGroupButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.guideGroup === groupId));
  });
  if (guideGroupSelect) guideGroupSelect.value = groupId;
  applyFilters();
}

function updateGuideGroups() {
  guideGroups.forEach((group) => {
    const hasVisibleRule = group.querySelector(".lens-guide-rule:not([hidden])");
    const searching = Boolean(searchInput?.value.trim());
    group.hidden = !hasVisibleRule || (!searching && group.dataset.guideGroup !== selectedGuideGroup);
  });
}

function setupGuideMetadata() {
  rules.forEach((rule, index) => {
    const title = getGuideTitle(rule);
    const trigger = rule.querySelector(".lens-guide-rule__trigger");
    const panel = rule.querySelector(".lens-guide-rule__body");
    const id = rule.id || GUIDE_IDS.get(title) || `guide-pattern-${index + 1}`;
    const panelId = `${id}-panel`;

    rule.id = id;
    rule.dataset.guideTitle = title;
    rule.dataset.guideIndex = String(index + 1);

    if (trigger && panel) {
      ensurePanelInner(panel);
      trigger.id = `${id}-trigger`;
      trigger.setAttribute("aria-controls", panelId);
      trigger.setAttribute("aria-expanded", "false");
      panel.id = panelId;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", trigger.id);
      syncDisclosureState(rule, panel, false);
    }

    renderBadges(trigger, GUIDE_BADGES.get(title));
  });
}

function ensurePanelInner(body) {
  if (body.querySelector(":scope > .lens-guide-rule__inner")) return;
  const inner = document.createElement("div");
  inner.className = "lens-guide-rule__inner";
  while (body.firstChild) inner.appendChild(body.firstChild);
  body.appendChild(inner);
}

function renderBadges(summary, badges = []) {
  if (!summary || !badges.length || summary.querySelector(".lens-guide-badges")) return;
  const label = summary.querySelector(":scope > span");
  if (!label) return;
  const badgeList = document.createElement("span");
  badgeList.className = "lens-guide-badges";
  badges.slice(0, 3).forEach((badge) => {
    const item = document.createElement("span");
    item.className = "lens-guide-badge";
    item.textContent = badge;
    badgeList.appendChild(item);
  });
  label.appendChild(badgeList);
}

function setupAccordions() {
  rules.forEach((rule) => {
    const trigger = rule.querySelector(".lens-guide-rule__trigger");
    const panel = rule.querySelector(".lens-guide-rule__body");
    if (!trigger || !panel) return;
    trigger.addEventListener("click", () => toggleRule(rule));
  });
}

function toggleRule(rule, forceOpen = null) {
  if (rule.hidden) rule.hidden = false;
  const trigger = rule.querySelector(".lens-guide-rule__trigger");
  const panel = rule.querySelector(".lens-guide-rule__body");
  if (!trigger || !panel) return;
  const shouldOpen = forceOpen ?? trigger.getAttribute("aria-expanded") !== "true";
  syncDisclosureState(rule, panel, shouldOpen);
}

function syncDisclosureState(rule, panel, expanded) {
  const trigger = rule.querySelector(".lens-guide-rule__trigger");
  trigger?.setAttribute("aria-expanded", String(expanded));
  panel.classList.toggle("is-open", expanded);
  setPanelInert(panel, !expanded);
}

function setPanelInert(panel, inert) {
  panel.inert = inert;
  if (inert) panel.setAttribute("inert", "");
  else panel.removeAttribute("inert");
}

function applyFilters() {
  if (!searchInput || !categorySelect || !emptyState) return;
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  let visibleCount = 0;

  rules.forEach((rule) => {
    const searchableText = [rule.dataset.guideTitle, rule.dataset.guideKeywords, rule.textContent]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesKeyword = !keyword || searchableText.includes(keyword);
    const matchesCategory = category === "all" || rule.dataset.guideCategory === category;
    const matchesGuideGroup = keyword || rule.dataset.guideGroup === selectedGuideGroup;
    const visible = matchesKeyword && matchesCategory && matchesGuideGroup;
    if (!visible) clearHiddenRule(rule);
    rule.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (countLabel) countLabel.textContent = `${visibleCount}개 패턴`;
  emptyState.hidden = visibleCount > 0;
  updateGuideGroups();
}

function clearHiddenRule(rule) {
  const panel = rule.querySelector(".lens-guide-rule__body");
  if (!panel) return;
  syncDisclosureState(rule, panel, false);
}

function openHashRule() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  const rule = document.getElementById(id);
  if (!rule?.classList.contains("lens-guide-rule")) return;

  if (rule.dataset.guideGroup) selectGuideGroup(rule.dataset.guideGroup);

  if (rule.hidden) {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "all";
    if (searchInput) searchInput.value = "";
    applyFilters();
  }

  toggleRule(rule, true);
  rule.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
}

setupGuideGroups();
setupGuideMetadata();
setupAccordions();

if (searchInput && categorySelect && emptyState) {
  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);
  applyFilters();
}

enhanceCodeBlocks();
openHashRule();
window.addEventListener("hashchange", openHashRule);
