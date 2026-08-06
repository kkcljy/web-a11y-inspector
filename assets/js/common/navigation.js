function normalizePath(pathname) {
  return pathname.split("/").pop() || "index.html";
}

function pageFromPath(pathname) {
  const fileName = normalizePath(pathname);
  if (fileName === "index.html") return "home";
  if (fileName === "guide.html") return "guide";
  if (fileName === "lab.html") return "lab";
  if (fileName === "api.html") return "api";
  return document.body.dataset.page || "";
}

function syncCurrentNavigation() {
  const currentPage = document.body.dataset.page || pageFromPath(window.location.pathname);
  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    const isCurrent = link.dataset.navPage === currentPage;
    link.classList.toggle("is-active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function shouldUseNativeNavigation(event, link, url) {
  if (event.defaultPrevented) return true;
  if (event.button !== 0) return true;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return true;
  if (link.target && link.target !== "_self") return true;
  if (url.origin !== window.location.origin) return true;
  if (url.hash) return true;
  if (url.pathname === window.location.pathname && url.search === window.location.search) return true;
  return false;
}

function handleNavigationClick(event) {
  const link = event.target.closest("[data-a11y-navigation] a[href]");
  if (!link) return;
  const url = new URL(link.getAttribute("href"), window.location.href);
  if (shouldUseNativeNavigation(event, link, url)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  event.preventDefault();
  document.documentElement.classList.add("is-page-leaving");
  window.setTimeout(() => {
    window.location.href = url.href;
  }, 100);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", syncCurrentNavigation, { once: true });
} else {
  syncCurrentNavigation();
}

document.addEventListener("a11y:includes-ready", syncCurrentNavigation);
document.addEventListener("click", handleNavigationClick);
