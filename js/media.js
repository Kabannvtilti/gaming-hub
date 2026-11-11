document.addEventListener("DOMContentLoaded", () => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const toggle = document.getElementById("motion-toggle");
  const sliderElement = document.querySelector(".reviews-swiper");
  const status = document.getElementById("media-status");
  let swiper = null;
  let typed = null;
  let manuallyPaused = false;
  let pointerInside = false;
  let focusInside = false;
  const unavailable = [];

  if (typeof Swiper === "function" && sliderElement) {
    swiper = new Swiper(sliderElement, {
      loop: true, slidesPerView: 1, spaceBetween: 24, speed: 500,
      autoplay: { delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: { el: sliderElement.querySelector(".swiper-pagination"), clickable: true },
      navigation: { nextEl: sliderElement.querySelector(".swiper-button-next"), prevEl: sliderElement.querySelector(".swiper-button-prev") },
      breakpoints: { 320: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { enabled: true, prevSlideMessage: "Попередній відгук", nextSlideMessage: "Наступний відгук", firstSlideMessage: "Перший відгук", lastSlideMessage: "Останній відгук", paginationBulletMessage: "Перейти до відгуку {{index}}", slideLabelMessage: "{{index}} з {{slidesLength}}" },
    });
  } else unavailable.push("слайдер");

  if (typeof Fancybox !== "undefined") {
    Fancybox.bind('[data-fancybox="gaming-gallery"]', {
      Carousel: { transition: "fade", infinite: true },
      Images: { zoom: true, Panzoom: { maxScale: 3 } },
      Thumbs: { autoStart: false },
      Toolbar: { display: { left: ["infobar"], middle: [], right: ["zoomIn", "zoomOut", "toggle1to1", "close"] } },
      l10n: { CLOSE: "Закрити", NEXT: "Наступне зображення", PREV: "Попереднє зображення", MODAL: "Галерея зображень", ZOOMIN: "Збільшити", ZOOMOUT: "Зменшити", TOGGLEZOOM: "Масштаб 1 до 1" },
      on: { init: () => { if (swiper) swiper.autoplay.stop(); }, destroy: () => updateMotion() },
    });
  } else unavailable.push("галерея");

  function createTyped() {
    if (typed || typeof Typed !== "function" || motion.matches) return;
    typed = new Typed("#typed-text", {
      strings: ["Знаходь команду.", "Ділися досвідом.", "Грай українською."],
      typeSpeed: 50, backSpeed: 30, backDelay: 1800, loop: true,
      contentType: "null", showCursor: true,
    });
  }
  if (typeof Typed !== "function") unavailable.push("ефект друку");
  createTyped();

  function updateMotion() {
    const paused = manuallyPaused || motion.matches || document.hidden;
    const galleryOpen = typeof Fancybox !== "undefined" && Boolean(Fancybox.getInstance());
    if (swiper) {
      swiper.params.speed = motion.matches ? 0 : 500;
      if (paused || pointerInside || focusInside || galleryOpen) swiper.autoplay.stop();
      else if (!swiper.autoplay.running) swiper.autoplay.start();
    }
    if (motion.matches && typed) {
      typed.destroy(); typed = null;
      document.getElementById("typed-text").textContent = "Знаходь команду.";
    } else if (!motion.matches) {
      createTyped();
      if (typed) { if (paused || galleryOpen) typed.stop(); else typed.start(); }
    }
    if (toggle) {
      toggle.disabled = !(swiper || typed) || motion.matches;
      toggle.setAttribute("aria-pressed", String(manuallyPaused || motion.matches));
      toggle.textContent = motion.matches ? "Анімацію вимкнено системою" : manuallyPaused ? "Відновити анімацію" : "Зупинити анімацію";
    }
  }
  toggle?.addEventListener("click", () => { manuallyPaused = !manuallyPaused; updateMotion(); });
  sliderElement?.addEventListener("mouseenter", () => { pointerInside = true; updateMotion(); });
  sliderElement?.addEventListener("mouseleave", () => { pointerInside = false; updateMotion(); });
  sliderElement?.addEventListener("focusin", () => { focusInside = true; updateMotion(); });
  sliderElement?.addEventListener("focusout", () => { queueMicrotask(() => { focusInside = sliderElement.contains(document.activeElement); updateMotion(); }); });
  document.addEventListener("visibilitychange", updateMotion);
  motion.addEventListener("change", updateMotion);
  updateMotion();
  if (unavailable.length && status) {
    status.hidden = false;
    status.textContent = `Не завантажилися: ${unavailable.join(", ")}. Відгуки доступні як картки, зображення — за посиланнями.`;
  }
});
