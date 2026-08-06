const searchInput = document.querySelector("[data-guide-search]");
const categorySelect = document.querySelector("[data-guide-category]");
const countLabel = document.querySelector("[data-guide-count]");
const emptyState = document.querySelector("[data-guide-empty]");
const rules = Array.from(document.querySelectorAll(".lens-guide-rule"));
const codeBlocks = Array.from(document.querySelectorAll(".lens-guide-code pre code"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const DISCLOSURE_OPEN_MS = 420;
const DISCLOSURE_CLOSE_MS = 280;

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
]);

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
  return rule.querySelector("summary strong")?.textContent.trim() || "";
}

function setupGuideMetadata() {
  rules.forEach((rule, index) => {
    const title = getGuideTitle(rule);
    const summary = rule.querySelector("summary");
    const body = rule.querySelector(".lens-guide-rule__body");
    const id = rule.id || GUIDE_IDS.get(title) || `guide-pattern-${index + 1}`;
    const panelId = `${id}-panel`;

    rule.id = id;
    rule.dataset.guideTitle = title;
    rule.dataset.guideIndex = String(index + 1);

    if (summary && body) {
      ensurePanelInner(body);
      summary.id = `${id}-summary`;
      summary.setAttribute("aria-controls", panelId);
      summary.setAttribute("aria-expanded", String(rule.open));
      body.id = panelId;
      body.setAttribute("role", "region");
      body.setAttribute("aria-labelledby", summary.id);
      setPanelInert(body, !rule.open);
    }

    renderBadges(summary, GUIDE_BADGES.get(title));
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
    const summary = rule.querySelector("summary");
    const body = rule.querySelector(".lens-guide-rule__body");
    if (!summary || !body) return;
    syncDisclosureState(rule, body);
    const handleToggleRequest = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleRule(rule);
    };
    const preventNativeToggle = (event) => {
      event.preventDefault();
    };
    summary.addEventListener("pointerdown", preventNativeToggle, true);
    summary.addEventListener("mousedown", preventNativeToggle, true);
    summary.addEventListener("click", handleToggleRequest, true);
    summary.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handleToggleRequest(event);
    });
    rule.addEventListener("toggle", () => {
      if (rule._guideIgnoreToggle) {
        rule._guideIgnoreToggle = false;
        return;
      }
      const isExpanded = summary.getAttribute("aria-expanded") === "true";
      if (rule.classList.contains("is-animating")) {
        if (!rule.open) rule.open = true;
        return;
      }
      if (!rule.open && !isExpanded) {
        rule.open = true;
        collapseRule(rule, body);
        return;
      }
      if (rule.open !== isExpanded) rule.open = isExpanded;
    });
  });
}

function toggleRule(rule, forceOpen = null) {
  if (rule.hidden) rule.hidden = false;
  const body = rule.querySelector(".lens-guide-rule__body");
  if (!body) return;
  const summary = rule.querySelector("summary");
  const isExpanded = summary?.getAttribute("aria-expanded") === "true";
  const shouldOpen = forceOpen ?? !isExpanded;
  if (shouldOpen === isExpanded && !rule.classList.contains("is-animating")) {
    syncDisclosureState(rule, body);
    return;
  }
  if (reduceMotion.matches) {
    clearRuleAnimation(rule, body);
    rule.open = shouldOpen;
    syncDisclosureState(rule, body);
    return;
  }
  if (shouldOpen) expandRule(rule, body);
  else collapseRule(rule, body);
}

function expandRule(rule, body) {
  clearRuleAnimation(rule, body);
  rule.open = true;
  setPanelInert(body, false);
  rule.classList.add("is-animating", "is-expanding");
  rule.classList.remove("is-collapsing");
  body.style.height = "0px";
  body.style.overflow = "hidden";
  body.style.transition = "none";
  void body.offsetHeight;
  body.style.removeProperty("transition");
  body.style.transitionDuration = `${DISCLOSURE_OPEN_MS}ms`;

  window.requestAnimationFrame(() => {
    waitForPanelTransition(rule, body, true);
    body.style.height = `${getPanelContentHeight(body)}px`;
  });
  syncDisclosureState(rule, body);
}

function collapseRule(rule, body) {
  clearRuleAnimation(rule, body);
  setPanelInert(body, true);
  rule.classList.add("is-animating", "is-collapsing");
  rule.classList.remove("is-expanding");
  body.style.height = `${getPanelContentHeight(body)}px`;
  body.style.overflow = "hidden";
  body.style.transition = "none";
  void body.offsetHeight;
  body.style.removeProperty("transition");
  body.style.transitionDuration = `${DISCLOSURE_CLOSE_MS}ms`;

  window.requestAnimationFrame(() => {
    waitForPanelTransition(rule, body, false);
    body.style.height = "0px";
  });
  syncDisclosureState(rule, body, false);
}

function finishRuleAnimation(rule, body, open) {
  rule._guideIgnoreToggle = rule.open !== open;
  rule.open = open;
  clearRuleAnimation(rule, body);
  syncDisclosureState(rule, body);
}

function clearRuleAnimation(rule, body) {
  window.clearTimeout(rule._guideTransitionTimer);
  rule._guideTransitionTimer = null;
  if (rule._guideTransitionEnd) {
    body.removeEventListener("transitionend", rule._guideTransitionEnd);
    rule._guideTransitionEnd = null;
  }
  rule.classList.remove("is-animating", "is-expanding", "is-collapsing");
  body.style.removeProperty("height");
  body.style.removeProperty("overflow");
  body.style.removeProperty("transition");
  body.style.removeProperty("transition-duration");
}

function waitForPanelTransition(rule, body, open) {
  const duration = open ? DISCLOSURE_OPEN_MS : DISCLOSURE_CLOSE_MS;
  const startedAt = Date.now();
  const onTransitionEnd = (event) => {
    if (event.target !== body || event.propertyName !== "height") return;
    if (Date.now() - startedAt < duration - 40) return;
    finishRuleAnimation(rule, body, open);
  };
  rule._guideTransitionEnd = onTransitionEnd;
  body.addEventListener("transitionend", onTransitionEnd);
  rule._guideTransitionTimer = window.setTimeout(() => finishRuleAnimation(rule, body, open), duration + 80);
}

function getPanelContentHeight(body) {
  const inner = body.querySelector(":scope > .lens-guide-rule__inner");
  return Math.ceil(inner?.getBoundingClientRect().height || body.scrollHeight || body.getBoundingClientRect().height);
}

function syncDisclosureState(rule, body, expanded = rule.open) {
  const summary = rule.querySelector("summary");
  summary?.setAttribute("aria-expanded", String(expanded));
  setPanelInert(body, !expanded);
}

function setPanelInert(panel, inert) {
  panel.inert = inert;
  if (inert) panel.setAttribute("inert", "");
  else panel.removeAttribute("inert");
}

function nextFrame(callback) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

function applyFilters() {
  if (!searchInput || !categorySelect || !countLabel || !emptyState) return;
  const keyword = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  let visibleCount = 0;

  rules.forEach((rule) => {
    const matchesKeyword = !keyword || rule.textContent.toLowerCase().includes(keyword);
    const matchesCategory = category === "all" || rule.dataset.guideCategory === category;
    const visible = matchesKeyword && matchesCategory;
    if (!visible) clearHiddenRule(rule);
    rule.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  countLabel.textContent = `${visibleCount}개 패턴`;
  emptyState.hidden = visibleCount > 0;
}

function clearHiddenRule(rule) {
  const body = rule.querySelector(".lens-guide-rule__body");
  if (!body) return;
  clearRuleAnimation(rule, body);
  syncDisclosureState(rule, body);
}

function openHashRule() {
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  const rule = document.getElementById(id);
  if (!rule?.classList.contains("lens-guide-rule")) return;

  if (rule.hidden) {
    if (searchInput) searchInput.value = "";
    if (categorySelect) categorySelect.value = "all";
    applyFilters();
  }

  toggleRule(rule, true);
  window.requestAnimationFrame(() => {
    rule.scrollIntoView({ block: "start", behavior: reduceMotion.matches ? "auto" : "smooth" });
  });
}

setupGuideMetadata();
setupAccordions();

if (searchInput && categorySelect && countLabel && emptyState) {
  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);
  applyFilters();
}

enhanceCodeBlocks();
openHashRule();
window.addEventListener("hashchange", openHashRule);
