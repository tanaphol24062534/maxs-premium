(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};

  function trim(v) {
    return String(v || "").trim();
  }

  function phoneHref(raw) {
    if (!raw) return "";
    if (/^tel:/i.test(raw)) return raw;
    var digits = raw.replace(/[^\d+]/g, "");
    return digits ? "tel:" + digits : "";
  }

  function prettyPhone(raw) {
    var d = raw.replace(/[^\d]/g, "");
    if (d.length === 10) return d.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    if (d.length === 9) return d.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
    return raw;
  }

  function track(eventName) {
    if (window.fbq) {
      window.fbq("track", eventName);
    }
  }

  function wire(selector, href) {
    document.querySelectorAll(selector).forEach(function (el) {
      if (href) {
        el.setAttribute("href", href);
        el.classList.remove("is-soon", "is-hidden");
        el.removeAttribute("hidden");
        el.removeAttribute("aria-disabled");
        if (!/^tel:/i.test(href)) {
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener noreferrer");
        } else {
          el.removeAttribute("target");
          el.removeAttribute("rel");
        }
      } else {
        el.setAttribute("href", "#");
        el.classList.add("is-hidden");
        el.setAttribute("hidden", "");
        el.classList.remove("is-soon");
        el.setAttribute("aria-disabled", "true");
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    });
  }

  var entry = trim(cfg.ENTRY_URL);
  var line = trim(cfg.LINE_URL);
  var facebook = trim(cfg.FACEBOOK_URL);
  var phone = trim(cfg.PHONE);
  var telegram = trim(cfg.TELEGRAM_URL);

  wire('[data-link="entry"]', entry);
  wire('[data-link="line"]', line);
  wire('[data-link="facebook"]', facebook);
  wire('[data-link="phone"]', phoneHref(phone));
  wire('[data-link="telegram"]', telegram);

  if (phone) {
    document.querySelectorAll("[data-phone-text]").forEach(function (el) {
      el.textContent = prettyPhone(phone);
    });
  }

  document.querySelectorAll('[data-link="entry"]').forEach(function (el) {
    el.addEventListener("click", function () {
      if (el.hasAttribute("hidden") || el.getAttribute("aria-disabled") === "true") return;
      track("Lead");
    });
  });

  ["line", "facebook", "phone", "telegram"].forEach(function (kind) {
    document.querySelectorAll('[data-link="' + kind + '"]').forEach(function (el) {
      el.addEventListener("click", function () {
        if (el.hasAttribute("hidden") || el.getAttribute("aria-disabled") === "true") return;
        track("Contact");
      });
    });
  });

  /* Sticky nav shadow + mobile menu */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".nav-menu");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      });
    });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* Floating contact */
  var fab = document.querySelector(".fab");
  var fabBtn = document.querySelector(".fab-toggle");
  if (fab) {
    var visibleFabItems = fab.querySelectorAll(".fab-item:not(.is-hidden)");
    if (visibleFabItems.length === 0) {
      fab.classList.add("is-hidden");
      fab.setAttribute("hidden", "");
    }
  }
  if (fab && fabBtn && !fab.hasAttribute("hidden")) {
    fabBtn.addEventListener("click", function () {
      var open = !fab.classList.contains("is-open");
      fab.classList.toggle("is-open", open);
      fabBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (fab.classList.contains("is-open") && !fab.contains(e.target)) {
        fab.classList.remove("is-open");
        fabBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Current year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
