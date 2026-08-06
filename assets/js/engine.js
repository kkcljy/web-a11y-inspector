import { analyzeNode, getActionStatus, getRuleDefinition, runCustomRules, sortInspectionItems } from "./rules.js";

const DEFAULT_TIMEOUT = 30000;
const AXE_LOAD_TIMEOUT = 10000;
const AXE_SCRIPT_URL = new URL("../vendor/axe.min.js", import.meta.url).href;

export async function runInspection(frameContext, options = {}) {
  const axe = await ensureAxe(frameContext);
  const axeResult = await runAxeWithTimeout(axe, frameContext.frameDocument, options.timeout || DEFAULT_TIMEOUT);
  const items = buildInspectionItems({ axeResult, frameContext, includePasses: options.includePasses !== false });
  return createInspectionResult({ axeResult, frameContext, items, options });
}

async function ensureAxe({ frameWindow, frameDocument }) {
  if (frameWindow.axe) return frameWindow.axe;
  frameDocument.querySelector("script[data-a11y-axe]")?.remove();
  await new Promise((resolve, reject) => {
    const script = frameDocument.createElement("script");
    const timeoutId = window.setTimeout(() => {
      script.remove();
      reject(new Error("axe.js 로드 시간이 초과되었습니다."));
    }, AXE_LOAD_TIMEOUT);
    script.src = AXE_SCRIPT_URL;
    script.dataset.a11yAxe = "true";
    script.addEventListener("load", () => {
      window.clearTimeout(timeoutId);
      frameWindow.axe ? resolve() : reject(new Error("axe.js는 로드됐지만 axe 객체를 찾지 못했습니다."));
    }, { once: true });
    script.addEventListener("error", () => {
      window.clearTimeout(timeoutId);
      reject(new Error("axe.js를 불러오지 못했습니다."));
    }, { once: true });
    frameDocument.head.appendChild(script);
  });
  return frameWindow.axe;
}

function runAxeWithTimeout(axe, frameDocument, timeout) {
  return Promise.race([
    axe.run(frameDocument, { resultTypes: ["violations", "incomplete", "passes"] }),
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("접근성 검사 시간이 초과되었습니다.")), timeout);
    }),
  ]);
}

function buildInspectionItems({ axeResult, frameContext, includePasses }) {
  const axeItems = [
    ...axeResult.violations.map((item) => buildInspectionItem({ axeItem: item, sourceType: "violations", frameContext })),
    ...axeResult.incomplete.map((item) => buildInspectionItem({ axeItem: item, sourceType: "incomplete", frameContext })),
    ...(includePasses ? axeResult.passes.map((item) => buildInspectionItem({ axeItem: item, sourceType: "passes", frameContext })) : []),
  ].filter(Boolean);
  const customItems = runCustomRules(frameContext).map((item) => normalizeCustomItem({ item, frameContext }));
  return dedupeInspectionItems(mergeColorContrastItems([...axeItems, ...customItems]).sort(sortInspectionItems));
}

function buildInspectionItem({ axeItem, sourceType, frameContext }) {
  const { frameDocument, frameWindow } = frameContext;
  const rule = getRuleDefinition(axeItem.id);
  const status = getActionStatus({ ruleId: axeItem.id, sourceType });
  let nodes = axeItem.nodes.map((node, index) => {
    const target = findTarget(node.target, frameDocument);
    return analyzeNode({
      ruleId: axeItem.id,
      node,
      target,
      index,
      frameDocument,
      frameWindow,
      sourceType,
      rule,
    });
  }).filter(Boolean);

  if (axeItem.id === "color-contrast" && sourceType !== "passes") {
    nodes = nodes.filter((node) => node.contrastStatus !== "pass");
  }
  if (!nodes.length) return null;

  return {
    itemId: createItemId({ ruleId: axeItem.id, status, sourceType }),
    ruleId: axeItem.id,
    id: axeItem.id,
    sourceType: sourceType === "passes" ? "axe" : sourceType === "incomplete" ? "axe" : "axe",
    axeResultType: sourceType,
    status,
    impact: axeItem.impact || "unknown",
    title: rule.title,
    description: rule.description,
    reason: rule.reason,
    guide: rule.guide,
    standard: parseStandard(rule.standard),
    helpUrl: axeItem.helpUrl || "",
    tags: axeItem.tags || [],
    nodes: nodes.map((node, index) => normalizeNode({ node, ruleId: axeItem.id, status, sourceType, index, frameContext })),
  };
}

function normalizeCustomItem({ item, frameContext }) {
  const ruleId = item.ruleId || item.id;
  return {
    itemId: createItemId({ ruleId, status: item.status, sourceType: "custom" }),
    ruleId,
    id: ruleId,
    sourceType: "custom",
    axeResultType: "custom",
    status: item.status,
    impact: item.impact || "unknown",
    title: item.title,
    description: item.description,
    reason: item.reason,
    guide: item.guide,
    standard: parseStandard(item.standard),
    helpUrl: "",
    tags: [],
    nodes: item.nodes.map((node, index) => normalizeNode({ node, ruleId, status: item.status, sourceType: "custom", index, frameContext })),
  };
}

function normalizeNode({ node, ruleId, status, sourceType, index, frameContext }) {
  const selectors = Array.isArray(node.targetPath) ? node.targetPath : [node.targetPath].filter(Boolean);
  const selector = selectors[0] || "";
  const html = node.html || "";
  const fingerprint = createFingerprint([frameContext.url, ruleId, selector, normalizeHtmlForHash(html), node.issue]);
  return {
    nodeId: fingerprint,
    fingerprint,
    index,
    target: {
      selector,
      selectors,
      text: node.targetText || selector || "대상 요소",
      html,
      snippet: html,
    },
    message: {
      issue: node.issue || "",
      reason: node.reason || "",
      guide: node.guide || "",
      raw: node.rawMessage || "",
      autoDecision: node.autoDecision || (status === "pass" ? "자동 검사에서 통과했습니다." : ""),
    },
    values: (node.currentValues || []).map((value) => ({ name: value.label || "항목", value: String(value.value ?? "없음") })),
    example: node.example || "",
    standard: parseStandard(node.standard || ""),
    location: { path: "", line: null, column: null },
    state: { contrastStatus: node.contrastStatus || "", sourceType },
  };
}

function createInspectionResult({ axeResult, frameContext, items, options }) {
  const visibleItems = items.filter((item) => item.status !== "pass");
  const summary = items.reduce((result, item) => {
    result.totalRules += 1;
    result[item.status] = (result[item.status] || 0) + item.nodes.length;
    result.totalNodes += item.status === "pass" ? 0 : item.nodes.length;
    if (item.axeResultType === "violations") result.violations += item.nodes.length;
    if (item.axeResultType === "incomplete") result.incomplete += item.nodes.length;
    if (item.sourceType === "custom") result.custom += item.nodes.length;
    return result;
  }, { totalNodes: 0, totalRules: 0, required: 0, review: 0, pass: 0, violations: 0, incomplete: 0, custom: 0 });

  return {
    schemaVersion: "1.0.0",
    runId: createRunId(),
    createdAt: new Date().toISOString(),
    tool: {
      name: "a11y-inspector",
      version: "1.0.0",
      engine: "axe-core",
      axeVersion: axeResult.testEngine?.version || frameContext.frameWindow.axe?.version || "",
    },
    target: {
      url: frameContext.url,
      normalizedUrl: frameContext.url,
      title: frameContext.frameDocument.title || "",
      origin: safeOrigin(frameContext.url),
      viewport: {
        mode: options.viewportMode || "responsive",
        width: frameContext.frameWindow.innerWidth || null,
        height: frameContext.frameWindow.innerHeight || null,
      },
    },
    summary,
    filters: {
      statuses: ["all", "required", "review", "pass"],
      sourceTypes: ["axe", "custom", "mixed"],
      impacts: ["critical", "serious", "moderate", "minor", "unknown"],
    },
    items,
    displayItems: visibleItems,
    raw: {
      axe: {
        violationsCount: axeResult.violations?.length || 0,
        incompleteCount: axeResult.incomplete?.length || 0,
        passesCount: axeResult.passes?.length || 0,
      },
    },
  };
}

function mergeColorContrastItems(items) {
  const contrastItems = items.filter((item) => item.ruleId === "color-contrast" && item.status !== "pass");
  if (contrastItems.length <= 1) return items;
  const firstIndex = items.findIndex((item) => item.ruleId === "color-contrast" && item.status !== "pass");
  const merged = {
    ...contrastItems[0],
    itemId: "color-contrast|mixed",
    sourceType: "mixed",
    axeResultType: "mixed",
    status: contrastItems.some((item) => item.status === "required") ? "required" : "review",
    nodes: contrastItems.flatMap((item) => item.nodes || []),
  };
  return items.reduce((result, item, index) => {
    if (item.ruleId !== "color-contrast" || item.status === "pass") result.push(item);
    else if (index === firstIndex) result.push(merged);
    return result;
  }, []);
}

function dedupeInspectionItems(items) {
  return items.map((item) => {
    const seen = new Set();
    return {
      ...item,
      nodes: item.nodes.filter((node) => {
        const key = node.fingerprint || [item.ruleId, node.target.selector, node.target.html].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    };
  }).filter((item) => item.nodes.length);
}

export function findTarget(targetPath, frameDocument) {
  const selectors = Array.isArray(targetPath) ? targetPath : [targetPath];
  for (const selector of selectors) {
    if (typeof selector !== "string" || !selector.trim()) continue;
    try {
      const target = frameDocument.querySelector(selector);
      if (target) return target;
    } catch {}
  }
  return null;
}

function parseStandard(value) {
  const text = String(value || "");
  const criteria = Array.from(text.matchAll(/\b\d\.\d\.\d\b/g)).map((match) => match[0]);
  return { label: text, criteria };
}

function createItemId({ ruleId, status, sourceType }) {
  return [ruleId, status, sourceType].join("|");
}

function createRunId() {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

function normalizeHtmlForHash(html) {
  return String(html || "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function createFingerprint(parts) {
  const input = parts.map((part) => String(part || "")).join("|");
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return `fp-${Math.abs(hash).toString(36)}`;
}
