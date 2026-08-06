const includeTargets = Array.from(document.querySelectorAll("[data-include]"));

async function loadInclude(target) {
  const url = target.dataset.include;
  if (!url) return;
  try {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    target.outerHTML = await response.text();
  } catch (error) {
    console.warn(`[A11Y Inspector] include load failed: ${url}`, error);
    target.innerHTML = `<div class="a11y-include-error" role="status">공통 영역을 불러오지 못했습니다.</div>`;
  }
}

await Promise.all(includeTargets.map(loadInclude));
document.documentElement.classList.add("is-include-ready");
document.dispatchEvent(new CustomEvent("a11y:includes-ready"));
