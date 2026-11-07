// AI-A1 Bridge — content script for the AI-A1 app (localhost:2000).

(function () {
  if (window.__ao_app_bridge_installed) return;
  window.__ao_app_bridge_installed = true;

  const LOG = "[AI-A1 Bridge][app]";

  const PASTE_ID = "ao-paste-button";
  const START_ID = "ao-start-button";
  const OUTPUT_ID = "ao-terminal-output";
  const STATUS_ID = "ao-task-status";

  function waitFor(getter, timeout, interval) {
    timeout = timeout || 9000;
    interval = interval || 120;
    return new Promise(function (resolve) {
      var t0 = Date.now();
      function tick() {
        var r = null;
        try { r = getter(); } catch (e) { r = null; }
        if (r) return resolve(r);
        if (Date.now() - t0 > timeout) return resolve(null);
        setTimeout(tick, interval);
      }
      tick();
    });
  }

  function enabledButtonById(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    if (el.disabled) return null;
    return el;
  }

  function findTextarea() {
    var tas = document.querySelectorAll("textarea");
    for (var i = 0; i < tas.length; i++) {
      var t = tas[i];
      if (t.offsetWidth > 0 && t.offsetHeight > 0) return t;
    }
    return null;
  }

  function isWorkspace() {
    return /\/workspace(\/|\?|$)/.test(location.pathname);
  }

  async function doPasteWorkspace(providedText) {
    let text = providedText || "";
    if (!text.trim()) {
      for (let i = 0; i < 5; i++) {
        try {
          text = await navigator.clipboard.readText();
          if (text.trim()) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    if (!text.trim()) return { ok: false, reason: "no-text" };

    let cwd = "";
    try { cwd = localStorage.getItem("ao-cwd") || ""; } catch {}
    if (!cwd) {
      try {
        const res = await fetch("http://localhost:2030/cwd");
        if (res.ok) cwd = (await res.json()).cwd || "";
      } catch {}
    }
    if (!cwd) return { ok: false, reason: "no-cwd" };

    const mounted = document.getElementById("ao-workspace-mounted");
    if (mounted) {
      if (sessionStorage.getItem("ao-response-text") === text) {
        return { ok: true, pasted: true, started: false, reloading: false };
      }
      sessionStorage.setItem("ao-response-text", text);
      sessionStorage.setItem("ao-task-cwd", cwd);
      sessionStorage.removeItem("ao-auto-run");
      window.postMessage({ __ao_apply_response__: true, text, cwd }, "*");
      return { ok: true, pasted: true, started: false, reloading: false };
    }

    sessionStorage.setItem("ao-response-text", text);
    sessionStorage.setItem("ao-task-cwd", cwd);
    sessionStorage.removeItem("ao-auto-run");
    setTimeout(() => location.reload(), 30);
    return { ok: true, pasted: true, started: false, reloading: true };
  }

  async function doPasteRun(autoStart, providedText) {
    var ta = findTextarea();
    if (!ta) return { ok: false, reason: "no-textarea" };

    let text = providedText || "";
    if (!text.trim()) {
      for (let i = 0; i < 5; i++) {
        try {
          text = await navigator.clipboard.readText();
          if (text.trim()) break;
        } catch {}
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    if (!text.trim()) return { ok: false, reason: "no-text" };

    // Use React's native setter so the framework detects the change.
    try {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      ).set;
      nativeInputValueSetter.call(ta, text);
      ta.dispatchEvent(new Event("input", { bubbles: true }));
      ta.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {
      return { ok: false, reason: "set-failed" };
    }

    if (!autoStart) return { ok: true, pasted: true, started: false };

    var startBtn = await waitFor(function () {
      return enabledButtonById(START_ID);
    }, 9000);
    if (!startBtn) return { ok: false, reason: "start-not-ready" };

    startBtn.click();
    return { ok: true, pasted: true, started: true };
  }

  async function doPaste(autoStart, providedText) {
    if (isWorkspace()) return doPasteWorkspace(providedText);
    return doPasteRun(autoStart, providedText);
  }

  function readTerminalOutput() {
    var el = document.getElementById(OUTPUT_ID);
    if (!el) return { ok: false, reason: "no-mirror" };
    return { ok: true, text: el.textContent || "" };
  }

  var lastSentStatus = "__init__";
  async function checkTaskStatus() {
    var el = document.getElementById(STATUS_ID);
    if (!el) return;

    var status = el.getAttribute("data-status") || "";
    var wantsOutput = el.getAttribute("data-wants-output") === "true";
    if (status === lastSentStatus) return;

    var prev = lastSentStatus;
    lastSentStatus = status;

    // Added "stopped" to terminal states
    var isTerminal = status === "done" || status === "failed" || status === "killed" || status === "stopped";
    var wasTerminal = prev === "done" || prev === "failed" || prev === "killed" || prev === "stopped";
    if (!isTerminal || wasTerminal) return;
    if (prev === "__init__") return;
    if (!wantsOutput) return;

    // Always send output on errors (failed, killed, stopped) even if autoSend is off
    var isError = status === "failed" || status === "killed" || status === "stopped";
    var { autoSend } = await chrome.storage.local.get({ autoSend: false });
    if (!autoSend && !isError) return;

    var out = readTerminalOutput();
    if (!out.ok || !out.text) return;

    try {
      await chrome.runtime.sendMessage({ type: "auto-send-output", text: out.text });
    } catch (e) {}
  }

  setInterval(checkTaskStatus, 700);

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg) return false;

    if (msg.type === "paste-content") {
      doPaste(!!msg.autoStart, msg.text)
        .then(sendResponse)
        .catch(function (e) { sendResponse({ ok: false, error: String(e) }); });
      return true;
    }

    if (msg.type === "read-terminal-output") {
      try { sendResponse(readTerminalOutput()); } 
      catch (e) { sendResponse({ ok: false, error: String(e) }); }
      return false;
    }
    return false;
  });

  console.log(LOG, "armed on", location.href);
})();
