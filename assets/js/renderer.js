import { findTarget } from "./engine.js";
import { A11Y_STATUS } from "./rules.js";

const DRAWER_TRANSITION_MS = 460;
const DISCLOSURE_TRANSITION_MS = 240;

export function renderSummary(container, result) {
  const { summary } = result;
  if (!summary.totalNodes) {
    container.innerHTML = `
      <strong>자동 검사 오류 없음</strong>
      <p>자동 검사에서 문제를 찾지 못했습니다. 수동 점검 결과는 포함되지 않습니다.</p>
    `;
    return;
  }
  container.innerHTML = `
    <strong>문제 요소 총 ${summary.totalNodes}건</strong>
    <p>수정 또는 확인이 필요한 요소가 발견되었습니다.</p>
    <div class="a11y-summary-meta">
      <span>필수 수정 <strong>${summary.required}</strong></span>
      <span>확인 필요 <strong>${summary.review}</strong></span>
    </div>
  `;
}

export function renderResults({ container, result, frameContext }) {
  container.innerHTML = "";
  const filter = createFilter(result.summary);
  const search = createSearch();
  const list = document.createElement("div");
  list.className = "a11y-result-list";
  list.dataset.a11yResultList = "true";
  const actionableItems = result.items.filter((item) => item.status !== "pass");
  actionableItems.forEach((item, index) => list.appendChild(createResultItem({ item, frameContext, index })));
  if (!actionableItems.length) list.appendChild(createEmpty("자동 검사에서 발견된 오류가 없습니다", "키보드 탐색, 포커스 이동, 스크린리더 안내 등은 별도로 점검해야 합니다."));
  container.append(filter, search, list);
  bindFiltering({ container, list });
}

function createFilter(summary) {
  const filter = document.createElement("div");
  filter.className = "a11y-result-filter";
  filter.setAttribute("aria-label", "검사 결과 필터");
  filter.innerHTML = `
    ${filterButton("all", "전체", summary.totalNodes, true)}
    ${filterButton("required", "필수 수정", summary.required)}
    ${filterButton("review", "확인 필요", summary.review)}
  `;
  return filter;
}

function filterButton(value, label, count, active = false) {
  return `<button type="button" class="a11y-result-filter-button${active ? " is-active" : ""}" data-a11y-result-filter="${value}" aria-pressed="${active ? "true" : "false"}">${label}<span>${count}</span></button>`;
}

function createSearch() {
  const wrapper = document.createElement("label");
  wrapper.className = "a11y-result-search";
  wrapper.innerHTML = `
    <span class="sr-only">결과 검색</span>
    <input type="search" placeholder="제목, 선택자, HTML, 가이드 검색" data-a11y-result-search>
  `;
  return wrapper;
}

function bindFiltering({ container, list }) {
  const buttons = Array.from(container.querySelectorAll("[data-a11y-result-filter]"));
  const searchInput = container.querySelector("[data-a11y-result-search]");
  const finishEntranceAnimations = () => {
    list.querySelectorAll(".is-entering").forEach((item) => item.classList.remove("is-entering"));
  };
  const apply = () => {
    const active = container.querySelector("[data-a11y-result-filter].is-active")?.dataset.a11yResultFilter || "all";
    const keyword = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;
    list.querySelectorAll("[data-a11y-result-status]").forEach((item) => {
      const status = item.dataset.a11yResultStatus;
      const text = item.dataset.a11ySearchText || item.textContent || "";
      const visible = (active === "all" || active === status) && (!keyword || text.includes(keyword));
      item.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    renderFilterEmpty(list, visibleCount);
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      finishEntranceAnimations();
      buttons.forEach((current) => {
        const active = current === button;
        current.classList.toggle("is-active", active);
        current.setAttribute("aria-pressed", String(active));
      });
      apply();
    });
  });
  searchInput.addEventListener("input", () => {
    finishEntranceAnimations();
    apply();
  });
}

function renderFilterEmpty(list, visibleCount) {
  let empty = list.querySelector("[data-a11y-filter-empty]");
  if (visibleCount) {
    if (empty) empty.hidden = true;
    return;
  }
  if (!empty) {
    empty = createEmpty("해당하는 검사 결과가 없습니다", "다른 결과 구분이나 검색어로 확인하세요.");
    empty.dataset.a11yFilterEmpty = "true";
    list.appendChild(empty);
  }
  empty.hidden = false;
}

function createResultItem({ item, frameContext, index }) {
  const section = document.createElement("section");
  section.className = "a11y-result-item is-entering";
  section.dataset.a11yResultStatus = item.status;
  section.dataset.a11yRuleId = item.ruleId;
  section.dataset.a11ySearchText = JSON.stringify(item).toLowerCase();
  const entranceIndex = Math.min(10, index);
  section.style.setProperty("--a11y-item-index", String(entranceIndex));
  window.setTimeout(() => section.classList.remove("is-entering"), 420 + entranceIndex * 22);
  section.append(createResultHeader(item), createResultOverview(item), createNodeList({ item, frameContext }));
  return section;
}

function createResultHeader(item) {
  const header = document.createElement("div");
  const status = A11Y_STATUS[item.status] || A11Y_STATUS.review;
  header.className = "a11y-result-header";
  header.innerHTML = `
    <div class="a11y-result-meta">
      <span class="a11y-status a11y-status--${escapeHtml(item.status)}">${escapeHtml(status.label)}</span>
    </div>
    <div class="a11y-result-title">
      <strong>${escapeHtml(item.ruleId === "color-contrast" && item.status === "required" ? "글자가 배경과 충분히 구분되지 않습니다" : item.title)}</strong>
      <span>${item.nodes.length}건</span>
    </div>
  `;
  return header;
}

function createResultOverview(item) {
  const overview = document.createElement("div");
  overview.className = "a11y-result-overview";
  const firstNode = item.nodes[0];
  overview.innerHTML = `
    ${item.description ? infoBlock(item.status === "review" ? "확인할 내용" : "문제", firstNode?.message.issue || item.description, "issue") : ""}
    ${infoBlock(item.status === "review" ? "확인 방법" : "수정 방법", firstNode?.message.guide || item.guide, "guide")}
  `;
  return overview;
}

function createNodeList({ item, frameContext }) {
  const wrapper = document.createElement("div");
  wrapper.className = "a11y-result-node-section";
  const heading = document.createElement("strong");
  heading.className = "a11y-result-node-heading";
  heading.textContent = `문제 요소 ${item.nodes.length}건`;
  const list = document.createElement("ol");
  list.className = "a11y-result-nodes";
  item.nodes.forEach((node, index) => list.appendChild(createNode({ node, index, item, frameContext })));
  wrapper.append(heading, list);
  return wrapper;
}

function createNode({ node, index, item, frameContext }) {
  const listItem = document.createElement("li");
  const details = document.createElement("details");
  details.className = "a11y-result-node-details";
  const summary = document.createElement("summary");
  summary.className = "a11y-result-node-summary";
  const nodeSummary = createNodePreview(item, node);
  summary.innerHTML = `
    <span class="a11y-result-node-number">${index + 1}</span>
    <span class="a11y-result-node-summary-content">
      <code>${escapeHtml(node.target.text || "대상 요소")}</code>
      ${nodeSummary ? `<span>${escapeHtml(nodeSummary)}</span>` : ""}
    </span>
    <span class="a11y-result-node-toggle" aria-hidden="true"></span>
  `;
  const content = document.createElement("div");
  content.className = "a11y-result-node-detail-content";
  const contentInner = document.createElement("div");
  contentInner.className = "a11y-result-node-detail-inner";
  if (node.values.length) contentInner.appendChild(createValueList("현재 값", node.values));
  if (node.example) contentInner.appendChild(createCodeSection("수정 예시", node.example));
  if (node.target.html) contentInner.appendChild(createCodeSection("현재 HTML", node.target.html));
  const action = document.createElement("button");
  action.type = "button";
  action.className = "a11y-result-node-move";
  action.innerHTML = `
    <span class="a11y-result-node-move-icon" aria-hidden="true"></span>
    <span>화면에서 확인</span>
  `;
  action.addEventListener("click", () => revealResultTarget({ node, frameContext, action }));
  const actions = document.createElement("div");
  actions.className = "a11y-result-node-actions";
  actions.appendChild(action);
  contentInner.appendChild(actions);
  content.appendChild(contentInner);
  details.append(summary, content);
  bindDisclosure({ details, summary, content });
  listItem.appendChild(details);
  return listItem;
}

function bindDisclosure({ details, summary, content }) {
  let isAnimating = false;
  let finishTimer = 0;

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    if (isAnimating) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      details.open = !details.open;
      return;
    }

    if (details.open) collapseDisclosure();
    else expandDisclosure();
  });

  function expandDisclosure() {
    isAnimating = true;
    details.open = true;
    details.classList.add("is-animating", "is-expanding");
    Object.assign(content.style, {
      height: "0px",
      opacity: "0",
      transform: "translateY(-6px)",
    });

    nextPaint(() => {
      content.style.height = `${content.scrollHeight}px`;
      content.style.opacity = "1";
      content.style.transform = "translateY(0)";
      finishTimer = window.setTimeout(() => finishDisclosure(true), DISCLOSURE_TRANSITION_MS);
    });
  }

  function collapseDisclosure() {
    isAnimating = true;
    details.classList.add("is-animating", "is-collapsing");
    Object.assign(content.style, {
      height: `${content.scrollHeight}px`,
      opacity: "1",
      transform: "translateY(0)",
    });

    nextPaint(() => {
      content.style.height = "0px";
      content.style.opacity = "0";
      content.style.transform = "translateY(-6px)";
      finishTimer = window.setTimeout(() => finishDisclosure(false), DISCLOSURE_TRANSITION_MS);
    });
  }

  function finishDisclosure(open) {
    window.clearTimeout(finishTimer);
    details.open = open;
    details.classList.remove("is-animating", "is-expanding", "is-collapsing");
    content.style.removeProperty("height");
    content.style.removeProperty("opacity");
    content.style.removeProperty("transform");
    isAnimating = false;
  }
}

function createValueList(title, values) {
  const wrapper = document.createElement("div");
  wrapper.className = "a11y-result-values";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const list = document.createElement("dl");
  values.forEach((value) => {
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = value.name || "항목";
    description.textContent = String(value.value ?? "없음");
    list.append(term, description);
  });
  wrapper.append(heading, list);
  return wrapper;
}

function createCodeSection(title, code) {
  const wrapper = document.createElement("div");
  wrapper.className = "a11y-code";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.textContent = code;
  pre.appendChild(codeElement);
  wrapper.append(heading, pre);
  return wrapper;
}

export function openDrawer(drawer) {
  drawer.hidden = false;
  nextPaint(() => drawer.classList.add("is-open"));
  drawer.setAttribute("aria-hidden", "false");
}

export function closeDrawer(drawer) {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!drawer.classList.contains("is-open")) drawer.hidden = true;
  }, DRAWER_TRANSITION_MS);
}

function nextPaint(callback) {
  window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
}

export function removeTargetHighlight(frameContext) {
  const frameDocument = frameContext?.frameDocument || frameContext?.contentDocument;
  if (!frameDocument) return;
  frameDocument.querySelectorAll("[data-a11y-highlight]").forEach((highlight) => {
    if (typeof highlight._a11yCleanup === "function") highlight._a11yCleanup();
    else highlight.remove();
  });
}

function revealResultTarget({ node, frameContext, action }) {
  const target = findTarget(node.target.selectors, frameContext.frameDocument);
  if (!target) return;
  const drawer = action.closest("[data-a11y-result-drawer]");
  focusResultTarget({ target, frameContext, drawer });
}

function focusResultTarget({ target, frameContext, drawer }) {
  removeTargetHighlight(frameContext);
  target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  applyTargetHighlight({ target, frameContext });
  nextPaint(() => positionTargetBesideDrawer({ target, frameContext, drawer }));
}

function positionTargetBesideDrawer({ target, frameContext, drawer }) {
  if (!drawer?.classList.contains("is-open")) return;
  const frame = frameContext.frameWindow.frameElement;
  const frameShell = frame?.closest("[data-a11y-frame-wrap]");
  if (!frame || !frameShell) return;
  const shellRect = frameShell.getBoundingClientRect();
  const drawerRect = drawer.getBoundingClientRect();
  const visibleLeft = shellRect.left + 16;
  const visibleRight = Math.min(shellRect.right - 16, drawerRect.left - 14);
  if (visibleRight - visibleLeft < 160) return;
  const frameRect = frame.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const targetCenter = frameRect.left + targetRect.left + targetRect.width / 2;
  const visibleCenter = visibleLeft + (visibleRight - visibleLeft) / 2;
  frameShell.scrollBy({ left: targetCenter - visibleCenter, behavior: "smooth" });
}

function applyTargetHighlight({ target, frameContext }) {
  const { frameDocument, frameWindow } = frameContext;
  const highlight = frameDocument.createElement("div");
  highlight.dataset.a11yHighlight = "true";
  highlight.setAttribute("aria-hidden", "true");
  Object.assign(highlight.style, {
    position: "absolute",
    zIndex: "2147483647",
    pointerEvents: "none",
    border: "3px solid #ff2d55",
    borderRadius: "4px",
    background: "rgba(255, 45, 85, 0.12)",
    boxSizing: "border-box",
    transition: "opacity 0.2s ease",
  });
  frameDocument.body.appendChild(highlight);
  const update = () => {
    if (!target.isConnected || !highlight.isConnected) return;
    const rect = target.getBoundingClientRect();
    const offset = 4;
    highlight.style.left = `${rect.left + frameWindow.scrollX - offset}px`;
    highlight.style.top = `${rect.top + frameWindow.scrollY - offset}px`;
    highlight.style.width = `${Math.max(rect.width + offset * 2, 8)}px`;
    highlight.style.height = `${Math.max(rect.height + offset * 2, 8)}px`;
  };
  const cleanup = () => {
    frameWindow.removeEventListener("scroll", update, true);
    frameWindow.removeEventListener("resize", update);
    highlight.style.opacity = "0";
    window.setTimeout(() => highlight.remove(), 200);
  };
  update();
  frameWindow.requestAnimationFrame(update);
  frameWindow.addEventListener("scroll", update, true);
  frameWindow.addEventListener("resize", update);
  highlight._a11yCleanup = cleanup;
  window.setTimeout(() => {
    if (highlight.isConnected) cleanup();
  }, 3000);
}

function infoBlock(title, content, type) {
  if (!content) return "";
  return `<div class="a11y-info a11y-info--${escapeHtml(type)}"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(content)}</p></div>`;
}

function createNodeContrastSummary(values) {
  const current = findValue(values, "현재 대비");
  const required = findValue(values, "필요한 대비");
  if (current && required) return `${current} · 기준 ${required}`;
  if (required) return `색상 차이 확인 필요 · 기준 ${required}`;
  return "글자와 배경의 색상 차이를 확인하세요.";
}

function createNodePreview(item, node) {
  const values = node.values || [];
  const ruleId = item.ruleId;
  if (ruleId === "color-contrast") return createNodeContrastSummary(values);

  if (ruleId === "button-name" || ruleId === "link-name") {
    const name = findValue(values, "계산된 이름");
    if (isEmptyValue(name)) return ruleId === "button-name" ? "버튼 설명 없음" : "이동 위치 설명 없음";
    return `사용자에게 전달되는 이름 "${name}"`;
  }

  if (["image-alt", "custom-empty-image-alt", "custom-file-name-alt"].includes(ruleId)) {
    const alt = findValue(values, "alt");
    if (alt === "속성 없음") return "이미지 설명 없음";
    if (alt === '""' || isEmptyValue(alt)) return "이미지 설명 비어 있음";
    return `이미지 설명 "${alt}"`;
  }

  if (["label", "select-name", "label-title-only", "form-field-multiple-labels"].includes(ruleId)) {
    const missingId = findValue(values, "찾을 수 없는 id");
    if (missingId) return `참조 대상 ${formatIdList(missingId)} 없음`;
    const duplicateId = findValue(values, "중복된 id");
    const duplicateCount = findValue(values, "같은 id의 요소");
    if (duplicateId) return [`id="${duplicateId}"`, duplicateCount ? `${duplicateCount} 요소` : ""].filter(Boolean).join(" · ");
    const labelConnection = findValue(values, "label 연결");
    if (labelConnection) return `항목명 연결 ${labelConnection}`;
    const connectedLabels = findValue(values, "연결된 label");
    if (connectedLabels) return `연결된 항목명 ${connectedLabels}`;
  }

  if (ruleId === "duplicate-id" || ruleId === "duplicate-id-aria") {
    const id = findValue(values, "중복된 id");
    const count = findValue(values, "사용된 요소 수");
    return [id ? `id="${id}"` : "", count ? `${count} 요소` : ""].filter(Boolean).join(" · ");
  }

  if (ruleId === "tabindex") {
    const value = findValue(values, "tabindex");
    return value ? `tabindex="${value}"` : "";
  }

  if (ruleId === "heading-order") {
    const previous = findValue(values, "이전 제목");
    const current = findValue(values, "현재 제목");
    return previous && current ? `${previous} 다음에 ${current}` : "";
  }

  if (ruleId === "html-has-lang" || ruleId === "html-lang-valid") {
    const value = findValue(values, "html lang");
    return isEmptyValue(value) ? "페이지 언어 설정 없음" : `페이지 언어 "${value}"`;
  }

  if (ruleId === "document-title") {
    const value = findValue(values, "현재 title");
    return isEmptyValue(value) ? "브라우저 탭 제목 없음" : `브라우저 탭 제목 "${value}"`;
  }

  if (ruleId === "meta-viewport") {
    const value = findValue(values, "viewport");
    return isEmptyValue(value) ? "viewport 설정 없음" : `viewport="${value}"`;
  }

  if (ruleId === "custom-label-reference") {
    const reference = findValue(values, "label for");
    return reference ? `연결값 "${reference}" · 입력칸 없음` : "연결할 입력칸 없음";
  }

  if (ruleId === "custom-aria-reference") {
    const reference = values.find((value) => value.name.startsWith("aria-"));
    const missing = findValue(values, "찾을 수 없는 id");
    if (reference && missing) return `${reference.name}="${reference.value}" · ${formatIdList(missing)} 없음`;
    return missing ? `참조 대상 ${formatIdList(missing)} 없음` : "";
  }

  if (ruleId === "custom-empty-aria-label") return "요소 이름 비어 있음";
  if (ruleId === "custom-table-name") return "표 제목 없음";

  if (ruleId.startsWith("aria-")) {
    const ariaValue = values.find((value) => value.name.startsWith("aria-"));
    if (ariaValue) return `${ariaValue.name}="${ariaValue.value}"`;
    const role = findValue(values, "role");
    if (role) return `role="${role}"`;
  }

  return "";
}

function findValue(values, name) {
  return values.find((value) => value.name === name)?.value || "";
}

function isEmptyValue(value) {
  return !value || value === "없음";
}

function formatIdList(value) {
  return String(value).split(/\s*,\s*/).filter(Boolean).map((id) => `#${id}`).join(", ");
}

function createEmpty(title, description) {
  const empty = document.createElement("div");
  empty.className = "a11y-result-empty";
  empty.innerHTML = `<strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p>`;
  return empty;
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
