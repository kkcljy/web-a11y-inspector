import { runInspection } from "./engine.js";
import { closeDrawer, openDrawer, removeTargetHighlight, renderResults, renderSummary } from "./renderer.js?v=20260730-8";
import { deleteInspection, listInspections, saveInspection } from "./storage.js";

const elements = {};
const INSPECTOR_TRANSITION_MS = 360;
const VIEWPORT_MODES = new Set(["pc", "mobile"]);
let inspectorCloseTimer = 0;
let currentViewportMode = "pc";
let historyItems = [];

init();

function init() {
  const root = document.querySelector("[data-a11y-app]");
  if (!root) return;
  Object.assign(elements, {
    root,
    home: root.querySelector("[data-a11y-home]"),
    brandHome: root.querySelector("[data-a11y-brand-home]"),
    form: root.querySelector("[data-a11y-url-form]"),
    urlInput: root.querySelector("[data-a11y-url]"),
    sampleButtons: Array.from(root.querySelectorAll("[data-a11y-sample-url]")),
    historyList: root.querySelector("[data-a11y-history-list]"),
    inspector: root.querySelector("[data-a11y-inspector]"),
    address: root.querySelector("[data-a11y-address]"),
    viewportButtons: Array.from(root.querySelectorAll("[data-a11y-viewport]")),
    runButton: root.querySelector("[data-a11y-run]"),
    runLabel: root.querySelector("[data-a11y-run-label]"),
    resultToggle: root.querySelector("[data-a11y-result-toggle]"),
    resultCount: root.querySelector("[data-a11y-result-count]"),
    closeButton: root.querySelector("[data-a11y-close]"),
    frameWrap: root.querySelector("[data-a11y-frame-wrap]"),
    frame: root.querySelector("[data-a11y-frame]"),
    loading: root.querySelector("[data-a11y-loading]"),
    drawer: root.querySelector("[data-a11y-result-drawer]"),
    resultClose: root.querySelector("[data-a11y-result-close]"),
    summary: root.querySelector("[data-a11y-summary]"),
    results: root.querySelector("[data-a11y-results]"),
  });
  bindEvents();
  setViewportMode("pc");
  refreshHistory();
  restoreLaunchQuery();
}

function bindEvents() {
  elements.brandHome.addEventListener("click", navigateHome);
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    openPage();
  });
  elements.viewportButtons.forEach((button) => {
    button.addEventListener("click", () => setViewportMode(button.dataset.a11yViewport));
  });
  elements.sampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.urlInput.value = button.dataset.a11ySampleUrl;
      openPage();
    });
  });
  elements.historyList.addEventListener("click", handleHistoryAction);
  elements.frame.addEventListener("load", handleFrameLoad);
  elements.runButton.addEventListener("click", runCurrentInspection);
  elements.resultToggle.addEventListener("click", toggleResultDrawer);
  elements.resultClose.addEventListener("click", closeResultDrawer);
  elements.closeButton.addEventListener("click", closeInspector);
}

function navigateHome() {
  const target = document.querySelector("#a11y-scan");
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => elements.urlInput.focus({ preventScroll: true }), 420);
}

function setViewportMode(mode) {
  const nextMode = normalizeViewportMode(mode);
  currentViewportMode = nextMode;
  elements.viewportButtons.forEach((button) => {
    const value = button.dataset.a11yViewport;
    const active = value === nextMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  commitFrameDeviceMode();
}

function normalizeViewportMode(mode) {
  return VIEWPORT_MODES.has(mode) ? mode : "pc";
}

function applyFrameDeviceMode() {
  const frameContext = getFrameContextSafely();
  const body = frameContext?.frameDocument?.body;
  if (!body) return false;
  body.classList.remove("pc", "mo", "mobile");
  body.classList.add(currentViewportMode === "mobile" ? "mo" : "pc");
  return true;
}

function commitFrameDeviceMode() {
  elements.frameWrap.dataset.viewport = currentViewportMode;
  applyFrameDeviceMode();
}

function waitForFrameMode() {
  applyFrameDeviceMode();
  const frameWindow = elements.frame.contentWindow || window;
  return new Promise((resolve) => {
    frameWindow.requestAnimationFrame(() => {
      applyFrameDeviceMode();
      frameWindow.requestAnimationFrame(() => {
        applyFrameDeviceMode();
        resolve();
      });
    });
  });
}

function openPage(inputValue = elements.urlInput.value) {
  const url = normalizeUrl(inputValue);
  if (!url) {
    elements.urlInput.focus();
    return;
  }
  elements.urlInput.value = inputValue;
  elements.runButton.disabled = true;
  elements.loading.hidden = false;
  elements.address.textContent = url;
  elements.address.title = url;
  elements.summary.innerHTML = "<strong>화면 불러오는 중</strong><p>검사 대상 화면이 준비될 때까지 기다려 주세요.</p>";
  elements.results.innerHTML = "";
  elements.resultCount.hidden = true;
  closeResultDrawer(false);
  window.clearTimeout(inspectorCloseTimer);
  elements.inspector.hidden = false;
  elements.home.hidden = true;
  elements.home.inert = true;
  elements.home.setAttribute("aria-hidden", "true");
  document.body.classList.add("is-a11y-inspector-open");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => elements.inspector.classList.add("is-open"));
  });
  elements.frame.src = url;
}

function closeInspector() {
  closeResultDrawer(false);
  removeTargetHighlight(getFrameContextSafely());
  elements.urlInput.value = "";
  elements.address.textContent = "-";
  elements.address.removeAttribute("title");
  elements.home.hidden = false;
  elements.home.inert = false;
  elements.home.removeAttribute("aria-hidden");
  elements.inspector.classList.remove("is-open");
  document.body.classList.remove("is-a11y-inspector-open");
  window.clearTimeout(inspectorCloseTimer);
  inspectorCloseTimer = window.setTimeout(() => {
    elements.inspector.hidden = true;
    elements.frame.src = "about:blank";
    elements.loading.hidden = false;
    elements.runButton.disabled = true;
    setRunState(false);
    elements.urlInput.focus({ preventScroll: true });
  }, INSPECTOR_TRANSITION_MS);
}

function handleFrameLoad() {
  if (elements.frame.getAttribute("src") === "about:blank") return;
  elements.loading.hidden = true;
  try {
    getFrameContext();
    applyFrameDeviceMode();
    elements.runButton.disabled = false;
    elements.summary.innerHTML = "<strong>검사 준비 완료</strong><p>검사할 화면을 원하는 단계까지 진행한 뒤 현재 화면 검사를 실행하세요.</p>";
  } catch (error) {
    elements.runButton.disabled = true;
    elements.summary.innerHTML = "<strong>검사할 수 없는 화면</strong><p>현재 페이지와 출처가 다른 화면은 iframe 내부에 접근할 수 없습니다.</p>";
    openResultDrawer();
    console.warn("[A11Y]", error);
  }
}

async function runCurrentInspection() {
  elements.runButton.disabled = true;
  setRunState(true);
  elements.results.innerHTML = "";
  elements.summary.innerHTML = "<strong>검사 중</strong><p>자동 검사와 요소별 상세 분석을 진행하고 있습니다.</p>";
  openResultDrawer();
  try {
    await waitForFrameMode();
    const frameContext = getFrameContext();
    frameContext.url = elements.frame.src;
    const result = await runInspection(frameContext, {
      viewportMode: currentViewportMode,
      includePasses: true,
    });
    renderSummary(elements.summary, result);
    renderResults({ container: elements.results, result, frameContext });
    updateResultCount(result.summary.totalNodes);
    window.__A11Y_LAST_RESULT__ = result;
    await persistResult(result);
  } catch (error) {
    elements.summary.innerHTML = `<strong>검사 실패</strong><p>${escapeHtml(error.message || "검사 중 오류가 발생했습니다.")}</p>`;
    console.error("[A11Y] 접근성 검사 실패:", error);
  } finally {
    elements.runButton.disabled = false;
    setRunState(false);
  }
}

async function persistResult(result) {
  try {
    await saveInspection(result);
    await refreshHistory();
  } catch (error) {
    console.warn("[A11Y] 검사 이력을 저장하지 못했습니다.", error);
  }
}

async function refreshHistory() {
  try {
    historyItems = await listInspections(8);
    renderHistory();
  } catch (error) {
    historyItems = [];
    renderHistory(error.message);
  }
}

function renderHistory(errorMessage = "") {
  if (!historyItems.length) {
    elements.historyList.innerHTML = `
      <div class="lens-history-empty">
        <strong>${errorMessage ? "검사 이력을 사용할 수 없습니다" : "아직 저장된 검사가 없습니다"}</strong>
        <p>${escapeHtml(errorMessage || "첫 검사를 실행하면 URL과 주요 결과가 이곳에 기록됩니다.")}</p>
      </div>
    `;
    return;
  }
  elements.historyList.innerHTML = historyItems.map((result) => {
    const mode = viewportLabel(result.target?.viewport?.mode);
    const title = result.target?.title || hostLabel(result.target?.url);
    return `
      <article class="lens-history-item">
        <button type="button" class="lens-history-item__main" data-a11y-history-open="${escapeHtml(result.runId)}">
          <span class="lens-history-item__status" aria-hidden="true"></span>
          <span class="lens-history-item__content">
            <strong>${escapeHtml(title)}</strong>
            <span>${escapeHtml(result.target?.url || "")}</span>
          </span>
          <span class="lens-history-item__time">${escapeHtml(formatDate(result.createdAt))}</span>
        </button>
        <div class="lens-history-item__metrics">
          <span>${escapeHtml(mode)}</span>
          <span>필수 수정 <strong>${Number(result.summary?.required || 0)}</strong></span>
          <span>확인 필요 <strong>${Number(result.summary?.review || 0)}</strong></span>
          <button type="button" data-a11y-history-delete="${escapeHtml(result.runId)}" aria-label="${escapeHtml(title)} 검사 이력 삭제">삭제</button>
        </div>
      </article>
    `;
  }).join("");
}

async function handleHistoryAction(event) {
  const deleteButton = event.target.closest("[data-a11y-history-delete]");
  if (deleteButton) {
    deleteButton.disabled = true;
    try {
      await deleteInspection(deleteButton.dataset.a11yHistoryDelete);
      await refreshHistory();
    } catch (error) {
      deleteButton.disabled = false;
      console.warn("[A11Y] 검사 이력을 삭제하지 못했습니다.", error);
    }
    return;
  }
  const openButton = event.target.closest("[data-a11y-history-open]");
  if (!openButton) return;
  const result = historyItems.find((item) => item.runId === openButton.dataset.a11yHistoryOpen);
  if (!result?.target?.url) return;
  setViewportMode(result.target.viewport?.mode || "pc");
  elements.urlInput.value = result.target.url;
  openPage(result.target.url);
}

function toggleResultDrawer() {
  const isOpen = elements.drawer.classList.contains("is-open");
  if (isOpen) closeResultDrawer();
  else openResultDrawer();
}

function openResultDrawer() {
  openDrawer(elements.drawer);
  elements.resultToggle.setAttribute("aria-expanded", "true");
}

function closeResultDrawer(returnFocus = true) {
  closeDrawer(elements.drawer);
  elements.resultToggle.setAttribute("aria-expanded", "false");
  if (returnFocus && !elements.resultToggle.disabled) elements.resultToggle.focus({ preventScroll: true });
}

function setRunState(running) {
  elements.runButton.classList.toggle("is-running", running);
  elements.runLabel.textContent = running ? "검사 중" : "현재 화면 검사";
}

function updateResultCount(count) {
  elements.resultCount.textContent = String(count);
  elements.resultCount.hidden = false;
}

function getFrameContext() {
  const frameWindow = elements.frame.contentWindow;
  const frameDocument = elements.frame.contentDocument || frameWindow?.document;
  if (!frameWindow || !frameDocument) throw new Error("iframe 문서에 접근할 수 없습니다.");
  void frameDocument.body;
  return { frameWindow, frameDocument, url: elements.frame.src };
}

function getFrameContextSafely() {
  try {
    return getFrameContext();
  } catch {
    return null;
  }
}

function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    return new URL(url, window.location.href).href;
  } catch (error) {
    console.warn("[A11Y] 올바르지 않은 URL입니다.", error);
    return "";
  }
}

function restoreLaunchQuery() {
  const parameters = new URLSearchParams(window.location.search);
  const url = parameters.get("url");
  if (!url) return;
  setViewportMode(parameters.get("viewport") || "pc");
  elements.urlInput.value = url;
  window.history.replaceState({}, "", window.location.pathname);
  window.requestAnimationFrame(() => openPage(url));
}

function viewportLabel(mode) {
  return normalizeViewportMode(mode) === "mobile" ? "Mobile" : "PC";
}

function hostLabel(url) {
  try {
    return new URL(url).hostname || "검사 결과";
  } catch {
    return "검사 결과";
  }
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
