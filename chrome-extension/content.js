// AI-A1 Bridge — content script (ISOLATED world) for AI sites.

(function () {
  if (window.__ao_content_installed) return;
  window.__ao_content_installed = true;

  const LOG = "[AI-A1 Bridge]";

  const PRESETS_MAP = {
    chatgpt: ["chatgpt.com", "chat.openai.com"],
    deepseek: ["chat.deepseek.com", "deepseek.com"],
    gemini: ["gemini.google.com", "bard.google.com"],
  };

  function hostMatches(host, pattern) {
    return host === pattern || host.endsWith("." + pattern);
  }

  function hostname() {
    try {
      return location.hostname.toLowerCase();
    } catch {
      return "";
    }
  }

  async function isActiveSite() {
    try {
      const { activePresets = [], customSites = [] } =
        await chrome.storage.local.get({
          activePresets: [],
          customSites: [],
        });
      const host = hostname();
      if (!host) return false;
      if (customSites.some((h) => hostMatches(host, h))) return true;
      for (const id of activePresets) {
        const hosts = PRESETS_MAP[id] || [];
        if (hosts.some((h) => hostMatches(host, h))) return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function isEnabled() {
    try {
      const { enabled } = await chrome.storage.local.get({ enabled: false });
      return !!enabled;
    } catch {
      return false;
    }
  }

  // ── Copy trigger logic ──────────────────────────────────────────
  let lastFired = 0;
  async function fireFocus(source, text) {
    const now = Date.now();
    if (now - lastFired < 800) return;
    lastFired = now;
    if (!(await isEnabled())) return;
    if (!(await isActiveSite())) return;
    try {
      await chrome.runtime.sendMessage({
        type: "focus-app",
        text: typeof text === "string" ? text : null,
        source: source,
      });
    } catch (e) {
      console.log(LOG, "sendMessage failed:", e);
    }
  }

  let pendingClickTimeout = null;

  window.addEventListener("message", async (e) => {
    if (e.source !== window) return;
    if (!e.data || !e.data.__ai_a1_copy__) return;
    
    // If we intercepted the text, cancel the fallback timeout
    if (pendingClickTimeout) {
      clearTimeout(pendingClickTimeout);
      pendingClickTimeout = null;
    }
    
    fireFocus(e.data.source || "clipboard", e.data.text);
  });

  function classNameMatches(node) {
    const c = node.className;
    if (!c) return false;
    if (typeof c === "string") return /copy/i.test(c);
    if (typeof c.baseVal === "string") return /copy/i.test(c.baseVal);
    return false;
  }

  function looksLikeCopyButton(target) {
    if (!target || !(target instanceof Element)) return false;
    let node = target;
    for (let i = 0; i < 4 && node && node !== document.body; i++) {
      if (classNameMatches(node)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function matchesSelector(target, sel) {
    if (!sel || !target) return false;
    try {
      if (target instanceof Element && target.closest(sel)) return true;
      const btn = target.closest('button, [role="button"], a');
      if (btn && btn.querySelector(sel)) return true;
    } catch {}
    return false;
  }

  document.addEventListener(
    "click",
    async (e) => {
      if (!(await isEnabled()) || !(await isActiveSite())) return;
      
      const { pickedTriggers = {}, copySelector = "" } =
        await chrome.storage.local.get({
          pickedTriggers: {},
          copySelector: "",
        });
      
      const host = hostname();
      let sel = pickedTriggers[host];
      if (!sel) {
        const parts = host.split(".");
        for (let i = 1; i < parts.length - 1; i++) {
          const parent = parts.slice(i).join(".");
          if (pickedTriggers[parent]) {
            sel = pickedTriggers[parent];
            break;
          }
        }
      }
      if (!sel) sel = copySelector;

      let isMatch = false;

      if (sel) {
        if (matchesSelector(e.target, sel)) isMatch = true;
      } else if (looksLikeCopyButton(e.target)) {
        isMatch = true;
      }

      if (isMatch) {
        // Arm the interception logic in content-main.js
        window.postMessage({ __ao_arm_copy_intercept__: true }, "*");
        
        if (pendingClickTimeout) clearTimeout(pendingClickTimeout);
        
        // Fallback: if no text is intercepted within 400ms, jump with null text (app reads clipboard)
        pendingClickTimeout = setTimeout(() => {
          fireFocus("click-selector-fallback", null);
        }, 400);
      }
    },
    true
  );

  // ── Pick-mode logic ──────────────────────────────────────────────
  let pickingMode = false;
  let hoveredEl = null;
  let pickStyleEl = null;

  function ensurePickStyle() {
    if (pickStyleEl && pickStyleEl.isConnected) return;
    pickStyleEl = document.createElement("style");
    pickStyleEl.id = "__ao_pick_style__";
    pickStyleEl.textContent = `
      [data-ao-picker-hover="1"] {
        outline: 2px solid #ff1a1a !important;
        outline-offset: -2px !important;
      }
    `;
    document.documentElement.appendChild(pickStyleEl);
  }

  function onPickHover(e) {
    if (!pickingMode) return;
    e.stopPropagation();
    e.preventDefault();
    const t = e.target;
    if (!t || t === hoveredEl || !t.setAttribute) return;
    if (hoveredEl && hoveredEl.removeAttribute) {
      hoveredEl.removeAttribute("data-ao-picker-hover");
    }
    hoveredEl = t;
    t.setAttribute("data-ao-picker-hover", "1");
  }

  function findClickableAncestor(el) {
    if (!el || el.nodeType !== 1) return el;
    let node = el;
    while (node && node !== document.body && node !== document.documentElement) {
      const tag = node.tagName ? node.tagName.toLowerCase() : "";
      if (tag === "button" || tag === "a" || tag === "input" || tag === "select" || tag === "textarea" || tag === "label") {
        return node;
      }
      if (node.getAttribute && node.getAttribute("role") === "button") {
        return node;
      }
      node = node.parentElement;
    }
    return el;
  }

  function isUtilityClass(cls) {
    if (!cls || cls.length < 4) return true;
    if (
      /^(flex|grid|block|inline|hidden|contents|table|static|fixed|absolute|relative|sticky|visible|invisible|sr-only|container|row|col|group)$/.test(cls)
    ) return true;
    if (
      /^(w|h|p|m|mx|my|px|py|pt|pb|pl|pr|mt|mb|ml|mr|gap|space|top|bottom|left|right|inset|z|order|text|bg|border|rounded|shadow|opacity|transition|transform|scale|rotate|translate|duration|ease|outline|ring|fill|stroke|font|leading|tracking|cursor|select|resize|appearance|filter|backdrop|divide|justify|items|content|self|place|whitespace|break|truncate|line|align|vertical|object|aspect|list|decoration|indent|first|last|odd|even|hover|focus|active|disabled|dark|sm|md|lg|xl|2xl|motion|animate)-/.test(cls)
    ) return true;
    return false;
  }

  function isBemClass(cls) {
    return /__|--/.test(cls);
  }

  function findClassSelector(el) {
    const candidates = [];
    let node = el;
    let depth = 0;
    while (node && node !== document.body && node !== document.documentElement && depth < 4) {
      const tag = node.tagName ? node.tagName.toLowerCase() : "";
      const className = typeof node.className === "string" ? node.className : "";
      if (className) {
        const classes = className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classes) {
          if (isUtilityClass(cls)) continue;
          const sel = `${tag}.${CSS.escape(cls)}`;
          const bem = isBemClass(cls);
          const minCount = bem ? 1 : 2;
          try {
            const matches = document.querySelectorAll(sel);
            if (matches.length >= minCount && matches.length <= 30) {
              candidates.push({ sel, count: matches.length, depth, bem });
            }
          } catch {}
        }
      }
      node = node.parentElement;
      depth++;
    }
    if (candidates.length === 0) return "";
    candidates.sort((a, b) => {
      if (a.bem !== b.bem) return a.bem ? -1 : 1;
      if (a.depth !== b.depth) return a.depth - b.depth;
      return a.count - b.count;
    });
    return candidates[0].sel;
  }

  function findHasChildSelector(el) {
    if (!el.tagName || !el.children) return "";
    const tag = el.tagName.toLowerCase();
    const found = [];
    for (const child of el.children) {
      const cc = typeof child.className === "string" ? child.className : "";
      for (const cls of cc.trim().split(/\s+/).filter(Boolean)) {
        if (isUtilityClass(cls)) continue;
        if (!isBemClass(cls)) continue;
        found.push(cls);
      }
    }
    for (const cls of found) {
      const sel = `${tag}:has(.${CSS.escape(cls)})`;
      try {
        const matches = document.querySelectorAll(sel);
        if (matches.length >= 1 && matches.length <= 100) {
          return sel;
        }
      } catch {}
    }
    return "";
  }

  function generateSelector(el) {
    if (!el || el.nodeType !== 1) return "";

    if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) {
      const sel = "#" + el.id;
      try {
        if (document.querySelectorAll(sel).length === 1) return sel;
      } catch {}
    }

    const testId = el.getAttribute("data-testid");
    if (testId) {
      const sel = `[data-testid="${CSS.escape(testId)}"]`;
      try {
        if (document.querySelectorAll(sel).length >= 1) return sel;
      } catch {}
    }

    const aria = el.getAttribute("aria-label");
    if (aria && aria.length < 60) {
      const sel = `${el.tagName.toLowerCase()}[aria-label="${CSS.escape(aria)}"]`;
      try {
        if (document.querySelectorAll(sel).length >= 1) return sel;
      } catch {}
    }

    const classSel = findClassSelector(el);
    if (classSel) return classSel;

    const hasSel = findHasChildSelector(el);
    if (hasSel) return hasSel;

    const parts = [];
    let node = el;
    let depth = 0;
    while (node && node !== document.body && node !== document.documentElement && depth < 6) {
      let part = node.tagName.toLowerCase();
      const nid = node.id;
      if (nid && /^[a-zA-Z][\w-]*$/.test(nid)) {
        parts.unshift("#" + nid);
        break;
      }
      const ntest = node.getAttribute("data-testid");
      if (ntest) {
        part += `[data-testid="${CSS.escape(ntest)}"]`;
      } else {
        const parent = node.parentElement;
        if (parent) {
          const sib = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
          if (sib.length > 1) {
            const idx = sib.indexOf(node) + 1;
            part += `:nth-of-type(${idx})`;
          }
        }
      }
      parts.unshift(part);
      node = node.parentElement;
      depth++;
    }
    return parts.join(" > ");
  }

  function onPickClick(e) {
    if (!pickingMode) return;
    e.stopPropagation();
    e.preventDefault();
    const t = findClickableAncestor(e.target);
    const sel = generateSelector(t);
    stopPicking();
    if (!sel) {
      showToast("Could not build a selector for that element.");
      return;
    }
    chrome.runtime.sendMessage(
      { type: "pick-result", host: hostname(), selector: sel },
      (res) => {
        if (res && res.ok) showToast("Picked: " + sel, 3600);
        else showToast("Save failed.");
      }
    );
  }

  function onPickKey(e) {
    if (!pickingMode) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      e.preventDefault();
      stopPicking();
      showToast("Pick cancelled.");
    }
  }

  function startPicking() {
    if (pickingMode) return;
    pickingMode = true;
    ensurePickStyle();
    document.body.style.cursor = "crosshair";
    document.addEventListener("mousemove", onPickHover, true);
    document.addEventListener("click", onPickClick, true);
    document.addEventListener("keydown", onPickKey, true);
  }

  function stopPicking() {
    pickingMode = false;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", onPickHover, true);
    document.removeEventListener("click", onPickClick, true);
    document.removeEventListener("keydown", onPickKey, true);
    if (hoveredEl && hoveredEl.removeAttribute) {
      hoveredEl.removeAttribute("data-ao-picker-hover");
    }
    hoveredEl = null;
    if (pickStyleEl && pickStyleEl.isConnected) {
      pickStyleEl.remove();
      pickStyleEl = null;
    }
  }

  // ── Auto-bottom scroll logic ─────────────────────────────────────
  const AUTO_BOTTOM_IDLE_MS = 5000;
  const AUTO_BOTTOM_CHECK_MS = 400;
  const PROGRAMMATIC_SCROLL_QUIET_MS = 250;

  let autoBottomEnabled = false;
  let checkIntervalId = 0;
  let lastUserScroll = 0;
  let ignoreScrollUntil = 0;
  let chatScrollable = null;
  let mutationObserver = null;
  let attachedScrollEl = null;

  function isScrollable(el) {
    if (!el || !el.scrollHeight || !el.clientHeight) return false;
    if (el.scrollHeight <= el.clientHeight + 100) return false;
    const oy = window.getComputedStyle(el).overflowY;
    return oy === "auto" || oy === "scroll" || oy === "overlay";
  }

  function findNearestScrollable(el) {
    let node = el && el.parentElement;
    while (node && node !== document.documentElement) {
      if (isScrollable(node)) return node;
      node = node.parentElement;
    }
    return null;
  }

  function findLargestScrollable() {
    let best = null;
    let bestArea = 0;
    for (const el of document.querySelectorAll("*")) {
      if (!isScrollable(el)) continue;
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > bestArea) {
        bestArea = area;
        best = el;
      }
    }
    return best;
  }

  function getScrollable() {
    if (
      chatScrollable &&
      chatScrollable.isConnected &&
      chatScrollable.scrollHeight > chatScrollable.clientHeight
    ) {
      return chatScrollable;
    }
    chatScrollable = null;
    const fallback = findLargestScrollable();
    if (fallback) chatScrollable = fallback;
    return (
      chatScrollable ||
      document.scrollingElement ||
      document.documentElement
    );
  }

  function considerChatNode(node) {
    if (!node || node.nodeType !== 1) return;
    const tag = node.tagName ? node.tagName.toLowerCase() : "";
    if (tag === "button" || tag === "svg" || tag === "path") return;
    if (tag === "script" || tag === "style") return;
    const r = node.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const text = (node.textContent || "").trim();
    if (text.length < 20) return;
    const sc = findNearestScrollable(node);
    if (sc && sc !== chatScrollable) {
      chatScrollable = sc;
    }
  }

  function startObserver() {
    if (mutationObserver || !document.body) return;
    mutationObserver = new MutationObserver((muts) => {
      for (const m of muts) {
        if (!m.addedNodes) continue;
        for (const n of m.addedNodes) considerChatNode(n);
      }
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopObserver() {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
    }
  }

  function onElementScroll() {
    if (Date.now() < ignoreScrollUntil) return;
    lastUserScroll = Date.now();
  }

  function checkAndScroll() {
    if (!autoBottomEnabled) return;
    if (document.hidden) return;
    try {
      const el = getScrollable();
      if (!el) return;
      if (attachedScrollEl !== el) {
        if (attachedScrollEl) {
          attachedScrollEl.removeEventListener("scroll", onElementScroll);
        }
        attachedScrollEl = el;
        attachedScrollEl.addEventListener("scroll", onElementScroll, {
          passive: true,
        });
      }
      if (Date.now() - lastUserScroll < AUTO_BOTTOM_IDLE_MS) return;
      const maxTop = el.scrollHeight - el.clientHeight;
      if (Math.abs(el.scrollTop - maxTop) > 5) {
        ignoreScrollUntil = Date.now() + PROGRAMMATIC_SCROLL_QUIET_MS;
        el.scrollTop = maxTop;
      }
    } catch {}
  }

  function startAutoBottom() {
    if (checkIntervalId) return;
    lastUserScroll = Date.now();
    ignoreScrollUntil = 0;
    startObserver();
    checkIntervalId = window.setInterval(
      checkAndScroll,
      AUTO_BOTTOM_CHECK_MS,
    );
    checkAndScroll();
  }

  function stopAutoBottom() {
    if (checkIntervalId) {
      window.clearInterval(checkIntervalId);
      checkIntervalId = 0;
    }
    if (attachedScrollEl) {
      attachedScrollEl.removeEventListener("scroll", onElementScroll);
      attachedScrollEl = null;
    }
    stopObserver();
    chatScrollable = null;
    ignoreScrollUntil = 0;
  }

  async function refreshAutoBottom() {
    const { autoBottom = false } = await chrome.storage.local.get({
      autoBottom: false,
    });
    const active = await isActiveSite();
    const want = !!autoBottom && active;
    if (want === autoBottomEnabled) return;
    autoBottomEnabled = want;
    if (autoBottomEnabled) startAutoBottom();
    else stopAutoBottom();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (
      "autoBottom" in changes ||
      "activePresets" in changes ||
      "customSites" in changes
    ) {
      refreshAutoBottom();
    }
  });

  // ── Message handling ─────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return false;

    if (msg.type === "start-pick-mode") {
      startPicking();
      sendResponse({ ok: true });
      return false;
    }

    if (msg.type === "paste-into-ai-input") {
      handlePasteIntoAiInput(msg.text || "")
        .then(sendResponse)
        .catch((e) => sendResponse({ ok: false, error: String(e), reason: "paste-failed" }));
      return true;
    }
    return false;
  });

  // ── Paste-into-AI-input logic ──────────────────────────────────────
  function findAiInput() {
    const tas = document.querySelectorAll("textarea");
    for (const t of tas) {
      if (t.offsetWidth > 0 && t.offsetHeight > 0 && !t.readOnly) return t;
    }
    const editables = document.querySelectorAll(
      "[contenteditable='true'], [contenteditable=''], [role='textbox']",
    );
    for (const el of editables) {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) return el;
    }
    return null;
  }

  async function writeClipboardBestEffort(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  function trySyntheticPaste(el, text) {
    try {
      const dt = new DataTransfer();
      dt.setData("text/plain", text);
      dt.setData("text/html", text);
      const ev = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
      });
      const notPrevented = el.dispatchEvent(ev);
      return !notPrevented;
    } catch {
      return false;
    }
  }

  function tryInsertText(el, text) {
    try {
      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        const len = (el.value || "").length;
        el.setSelectionRange(len, len);
      } else {
        el.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return document.execCommand("insertText", false, text);
    } catch {
      return false;
    }
  }

  function tryClickSend() {
    const selectors = [
      '[data-testid="send-button"]',
      '[data-testid="fruitjuice-send-button"]',
      'button[aria-label="Send message"]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="send" i]',
      'button[type="submit"]',
    ];
    for (const sel of selectors) {
      try {
        const btn = document.querySelector(sel);
        if (btn && !btn.disabled && btn.offsetWidth > 0 && btn.offsetHeight > 0) {
          btn.click();
          return { ok: true, selector: sel };
        }
      } catch {}
    }
    try {
      const el = findAiInput();
      if (el) {
        el.focus();
        const ev = new KeyboardEvent("keydown", {
          key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true,
        });
        el.dispatchEvent(ev);
        return { ok: true, method: "enter-key" };
      }
    } catch {}
    return { ok: false };
  }

  async function handlePasteIntoAiInput(text) {
    const el = findAiInput();
    if (!el) return { ok: false, reason: "no-input" };

    const block = "from @output\n" + text;

    try {
      el.scrollIntoView({ block: "center" });
    } catch {}
    try {
      el.focus();
    } catch {}

    // 1. Copy to clipboard so the paste event actually has data
    await writeClipboardBestEffort(block);

    // 2. Clear existing content (optional, but good for clean paste)
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      try { el.setSelectionRange(0, el.value.length); } catch {}
    } else {
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch {}
    }

    // 3. Try a real synthetic paste event (fixes React sites clearing the input)
    if (trySyntheticPaste(el, block)) {
      // Paste event succeeded
    } else if (!tryInsertText(el, block)) {
      // Fallback to insertText if paste event fails
      return { ok: false, reason: "paste-failed" };
    }

    const { autoSendEnter } = await chrome.storage.local.get({ autoSendEnter: false });
    let sent = false;

    if (autoSendEnter) {
      await new Promise((r) => setTimeout(r, 700));
      const sendRes = tryClickSend();
      sent = sendRes.ok;
      if (!sent) {
        return { ok: true, length: text.length, sent: false, reason: "no-send" };
      }
    }

    return { ok: true, length: text.length, sent };
  }

  function showToast(text, ms) {
    ms = ms || 2600;
    try {
      const t = document.createElement("div");
      t.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
        background:#0a0a0a;color:#f0f0f0;padding:10px 16px;border-radius:10px;
        font-family:system-ui,-apple-system,sans-serif;font-size:13px;
        z-index:2147483647;box-shadow:0 8px 32px rgba(0,0,0,0.5);
        border:1px solid #ff1a1a;max-width:80vw;
        overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
      `;
      t.textContent = text;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), ms);
    } catch {}
  }

  refreshAutoBottom();
  console.log(LOG, "armed on", location.href);
})();
