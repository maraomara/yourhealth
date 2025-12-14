/* main.js — ЛР4: DOM, Events, Validation, LocalStorage */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // зміна стилю елементам
    highlightElements(".diet-card");
    highlightElements(".home-section");

    appendNoteToMain();

    // Дата та рік у футері
    setCurrentDateAndYear();

    // Тема
    initThemeToggle();

    // Меню
    initNavHover(".sidebar-nav .sidebar-btn");

    // Клавіші ArrowUp/ArrowDown -> розмір шрифту
    initFontResizeOnArrows();

    initAccordion();

    initContactFormValidation();

    // Tooltip
    initTooltips();
  });

  // Маніпуляція елементами
  function highlightElements(selector) {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return;

    nodes.forEach((el) => {
      el.style.borderLeft = "4px solid rgba(0,0,0,0.15)";
      el.style.paddingLeft = "12px";
    });
  }

  function appendNoteToMain() {
    const main = document.querySelector("main");
    if (!main) return;

    if (main.querySelector(".js-added-note")) return;

    const p = document.createElement("p");
    p.className = "js-added-note";

    p.style.marginTop = "16px";
    p.style.opacity = "0.85";

    main.appendChild(p);
  }

  //Дата та рік у футері
  function setCurrentDateAndYear() {
    const yearEl = document.getElementById("current-year");
    const dateEl = document.getElementById("current-date");

    const now = new Date();

    if (yearEl) yearEl.textContent = String(now.getFullYear());
    if (dateEl) dateEl.textContent = now.toLocaleDateString("uk-UA");
  }

  // Тема
  function initThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    const body = document.body;
    const html = document.documentElement;

    const KEY = "yh_theme";

    // застосувати збережену тему
    const saved = localStorage.getItem(KEY);
    if (saved === "dark") {
      body.classList.add("dark-theme");
      html.classList.add("dark-theme");
    } else {
      body.classList.remove("dark-theme");
      html.classList.remove("dark-theme");
    }

    if (!btn) return;

    btn.addEventListener("click", () => {
      body.classList.toggle("dark-theme");
      html.classList.toggle("dark-theme");

      const isDark = body.classList.contains("dark-theme") || html.classList.contains("dark-theme");
      localStorage.setItem(KEY, isDark ? "dark" : "light");
    });
  }

  // Підсвітка меню
  function initNavHover(linkSelector) {
    const links = document.querySelectorAll(linkSelector);
    if (!links.length) return;

    links.forEach((a) => {
      a.addEventListener("mouseenter", () => {
        a.classList.add("is-hover");
        a.style.transform = "translateX(2px)";
      });

      a.addEventListener("mouseleave", () => {
        a.classList.remove("is-hover");
        a.style.transform = "";
      });
    });
  }

  // ArrowUp / ArrowDown
  function initFontResizeOnArrows() {
    const root = document.documentElement;

    const MIN = 12;
    const MAX = 22;
    const STEP = 1;

    function currentSize() {
      const val = parseFloat(getComputedStyle(root).fontSize);
      return Number.isFinite(val) ? val : 16;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();

      const cur = currentSize();
      const next = e.key === "ArrowUp" ? Math.min(MAX, cur + STEP) : Math.max(MIN, cur - STEP);
      root.style.fontSize = `${next}px`;
    });
  }

  function initAccordion() {
    const toggles = document.querySelectorAll("[data-accordion-toggle]");
    if (!toggles.length) return;

    toggles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSel = btn.getAttribute("data-target");
        if (!targetSel) return;

        const target = document.querySelector(targetSel);
        if (!target) return;

        const willOpen = target.hasAttribute("hidden");
        if (willOpen) target.removeAttribute("hidden");
        else target.setAttribute("hidden", "");

        btn.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }

  function initContactFormValidation() {
    const form = document.querySelector("form.contact-form");
    if (!form) return;

    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const messageInput = form.querySelector("#message");

    // блок повідомлень
    let msgBox = document.getElementById("form-messages");
    if (!msgBox) {
      msgBox = document.createElement("div");
      msgBox.id = "form-messages";
      msgBox.style.marginTop = "12px";
      form.appendChild(msgBox);
    }

    const fields = [
      { el: nameInput, key: "name" },
      { el: emailInput, key: "email" },
      { el: messageInput, key: "message" },
    ].filter((x) => x.el);

    fields.forEach(({ el, key }) => ensureErrorNode(el, key));

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearMessage(msgBox);

      const data = {
        name: nameInput ? nameInput.value.trim() : "",
        email: emailInput ? emailInput.value.trim() : "",
        message: messageInput ? messageInput.value.trim() : "",
      };

      //Вивід у консоль
      console.log("Form data:", data);

      const errors = validateContactForm(data);

      fields.forEach(({ el, key }) => {
        setFieldError(el, key, errors[key] || "");
      });

      if (Object.keys(errors).length > 0) {
        showMessage(msgBox, "Будь ласка, виправте помилки у формі.", "error");
        return;
      }

      // Збереження імені
      if (data.name) localStorage.setItem("yh_user_name", data.name);

      form.reset();
      showMessage(msgBox, "Форма успішно надіслана!", "success");
    });
  }

  function validateContactForm(data) {
    const errors = {};

    if (!data.name || data.name.length < 3) {
      errors.name = "Ім'я повинно містити мінімум 3 символи.";
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!data.email || !emailOk) {
      errors.email = "Введіть коректний email (наприклад, name@example.com).";
    }

    if (!data.message || data.message.length < 10) {
      errors.message = "Повідомлення повинно містити мінімум 10 символів.";
    }

    return errors;
  }

  function ensureErrorNode(fieldEl, key) {
    const id = `error-${key}`;
    if (document.getElementById(id)) return;

    const node = document.createElement("small");
    node.id = id;
    node.className = "field-error-text";
    node.style.display = "block";
    node.style.marginTop = "6px";
    node.style.fontSize = "0.9em";
    node.style.opacity = "0.9";

    fieldEl.insertAdjacentElement("afterend", node);
  }

  function setFieldError(fieldEl, key, message) {
    const node = document.getElementById(`error-${key}`);
    if (!node) return;

    if (message) {
      fieldEl.style.outline = "2px solid rgba(220,0,0,0.65)";
      fieldEl.style.outlineOffset = "2px";
      node.textContent = message;
      node.style.color = "rgba(220,0,0,0.85)";
    } else {
      fieldEl.style.outline = "";
      fieldEl.style.outlineOffset = "";
      node.textContent = "";
    }
  }

  function showMessage(box, text, type) {
    box.textContent = text;
    box.style.padding = "10px 12px";
    box.style.borderRadius = "10px";
    box.style.border =
      type === "success"
        ? "1px solid rgba(0, 140, 0, 0.35)"
        : "1px solid rgba(220, 0, 0, 0.35)";
  }

  function clearMessage(box) {
    box.textContent = "";
    box.style.padding = "";
    box.style.border = "";
    box.style.borderRadius = "";
  }

  //Tooltip
  function initTooltips() {
    const targets = document.querySelectorAll("[data-tooltip]");
    if (!targets.length) return;

    let tip = document.getElementById("js-tooltip");
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "js-tooltip";
      tip.style.position = "fixed";
      tip.style.zIndex = "9999";
      tip.style.maxWidth = "280px";
      tip.style.padding = "10px 12px";
      tip.style.borderRadius = "12px";
      tip.style.border = "1px solid rgba(0,0,0,0.15)";
      tip.style.background = "white";
      tip.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
      tip.style.fontSize = "14px";
      tip.style.lineHeight = "1.25";
      tip.style.opacity = "0";
      tip.style.pointerEvents = "none";
      tip.style.transition = "opacity 120ms ease";
      document.body.appendChild(tip);
    }

    function show(text) {
      tip.textContent = text;
      tip.style.opacity = "1";
    }

    function hide() {
      tip.style.opacity = "0";
    }

    function move(e) {
      const offset = 14;
      let x = e.clientX + offset;
      let y = e.clientY + offset;

      const rect = tip.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - 8;
      const maxY = window.innerHeight - rect.height - 8;

      if (x > maxX) x = maxX;
      if (y > maxY) y = maxY;

      tip.style.left = `${x}px`;
      tip.style.top = `${y}px`;
    }

    targets.forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        show(el.getAttribute("data-tooltip") || "");
        move(e);
      });
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", hide);
    });
  }
})();
