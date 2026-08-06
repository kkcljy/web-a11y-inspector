const searchInput = document.querySelector("[data-guide-search]");
const categorySelect = document.querySelector("[data-guide-category]");
const countLabel = document.querySelector("[data-guide-count]");
const emptyState = document.querySelector("[data-guide-empty]");
const rules = Array.from(document.querySelectorAll(".lens-guide-rule"));
const codeBlocks = Array.from(document.querySelectorAll(".lens-guide-code pre code"));

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

if (searchInput && categorySelect && countLabel && emptyState) {
  const applyFilters = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    let visibleCount = 0;

    rules.forEach((rule) => {
      const matchesKeyword = !keyword || rule.textContent.toLowerCase().includes(keyword);
      const matchesCategory = category === "all" || rule.dataset.guideCategory === category;
      const visible = matchesKeyword && matchesCategory;
      rule.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    countLabel.textContent = `${visibleCount}개 패턴`;
    emptyState.hidden = visibleCount > 0;
  };

  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);
  applyFilters();
}

enhanceCodeBlocks();
