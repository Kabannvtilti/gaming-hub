// Native <details>/<summary> handles Enter/Space and exposes expanded state.
const mobileMenu = document.getElementById("mobile-menu");
const desktopQuery = window.matchMedia("(min-width: 768px)");
function closeMenus(returnFocus = false) {
  const focusTarget = document.activeElement.closest('header details[open]');
  const outerMenu = focusTarget?.closest('#mobile-menu') || focusTarget;
  document.querySelectorAll("header details[open]").forEach((menu) => {
    menu.open = false;
  });
  if (returnFocus && outerMenu) outerMenu.querySelector('summary').focus();
}
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenus(true);
});
document.querySelectorAll("header nav a").forEach((link) => {
  link.addEventListener("click", () => closeMenus());
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("header details")) closeMenus();
});
desktopQuery.addEventListener("change", () => {
  if (desktopQuery.matches) {
    const focusWasInside = mobileMenu.contains(document.activeElement);
    mobileMenu.open = false;
    if (focusWasInside)
      document.querySelector('nav[aria-label="Головна навігація"] a').focus();
  }
  const activeHeader = document.activeElement.closest('header');
  if (!desktopQuery.matches && activeHeader && !mobileMenu.contains(document.activeElement) && document.activeElement.getClientRects().length === 0) {
    mobileMenu.querySelector('summary').focus();
  }
});
