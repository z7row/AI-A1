// AI-A1 Bridge — background service worker.

try {
  importScripts("defaults.js");
} catch (e) {
  console.error("[AI-A1 Bridge][bg] defaults.js load failed:", e);
}

// ── Dynamic Icon (Grayscale when disabled) ──────────────────────
async function updateIcon() {
  try {
    const { enabled } = await chrome.storage.local.get({ enabled: false });
    const url = chrome.runtime.getURL("icon.png");
    const response = await fetch(url);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(128, 128);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (enabled) {
      ctx.drawImage(bitmap, 0, 0, 128, 128);
    } else {
      ctx.filter = "grayscale(100%) opacity(50%)";
      ctx.drawImage(bitmap, 0, 0, 128, 128);
    }
    const imageData = ctx.getImageData(0, 0, 128, 128);
    chrome.action.setIcon({ imageData });
  } catch (e) {
    console.error("[AI-A1 Bridge][bg] Failed to update icon:", e);
  }
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) updateIcon();
  if (changes.activePresets || changes.customSites) syncDynamicScripts();
});
chrome.runtime.onStartup.addListener(updateIcon);
chrome.runtime.onInstalled.addListener(updateIcon);
updateIcon();

const RUN_URL = "http://localhost:2000/run";
const APP_PREFIXES = [
  "http://localhost:2000/",
  "http://localhost:2000",
  "http://127.0.0.1:2000/",
  "http://127.0.0.1:2000",
];

const PRESETS_MAP = {
  chatgpt: ["chatgpt.com", "chat.openai.com"],
  deepseek: ["chat.deepseek.com", "deepseek.com"],
  gemini: ["gemini.google.com", "bard.google.com"],
};

const K_LAST_AI_TAB = "lastAiTab";
const DYN_ID_PREFIX = "ao-custom-";

function hostMatches(host, pattern) {
  return host === pattern || host.endsWith("." + pattern);
}

async function isAiUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    const { activePresets = [], customSites = [] } = await chrome.storage.local.get({
      activePresets: [], customSites: [],
    });

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

async function getAllAppTabs() {
  const all = await chrome.tabs.query({});
  return all.filter((t) => {
    const u = t.pendingUrl || t.url || "";
    return APP_PREFIXES.some((p) => u.startsWith(p));
  });
}

async function getSettings() {
  return await chrome.storage.local.get({
    enabled: false,
    autoPaste: false,
    autoStart: false,
    autoSend: false,
    autoSendEnter: false,
    autoBottom: false,
    copySelector: "",
  });
}

async function rememberLastAiTab(tab) {
  if (!tab || !tab.id) return;
  await chrome.storage.local.set({
    [K_LAST_AI_TAB]: {
      id: tab.id,
      url: tab.url,
      windowId: tab.windowId,
      title: tab.title,
    },
  });
}

async function getLastAiTab() {
  const s = await chrome.storage.local.get({ [K_LAST_AI_TAB]: null });
  return s[K_LAST_AI_TAB];
}

async function syncDynamicScripts() {
  try {
    const existing = await chrome.scripting.getRegisteredContentScripts();
    const toRemove = existing
      .filter((s) => s.id.startsWith(DYN_ID_PREFIX))
      .map((s) => s.id);
    if (toRemove.length) {
      await chrome.scripting.unregisterContentScripts({ ids: toRemove });
    }
  } catch {}

  const { customSites = [], activePresets = [] } = await chrome.storage.local.get({
    customSites: [], activePresets: [],
  });

  const hostsToRegister = new Set(customSites);
  for (const id of activePresets) {
    const hosts = PRESETS_MAP[id] || [];
    hosts.forEach((h) => hostsToRegister.add(h));
  }

  for (const host of hostsToRegister) {
    const patterns = [`https://${host}/*`, `http://${host}/*`];
    const baseId = DYN_ID_PREFIX + host.replace(/[^a-z0-9]/gi, "_");
    
    try {
      await chrome.scripting.unregisterContentScripts({ 
        ids: [baseId + "-main", baseId + "-content"] 
      });
    } catch (e) {}

    try {
      await chrome.scripting.registerContentScripts([
        {
          id: baseId + "-main",
          matches: patterns,
          js: ["content-main.js"],
          runAt: "document_start",
          world: "MAIN",
          allFrames: true,
        },
        {
          id: baseId + "-content",
          matches: patterns,
          js: ["content.js"],
          runAt: "document_start",
          allFrames: true,
        },
      ]);
    } catch (e) {
      if (!e.message.includes("Duplicate script ID")) {
        console.error("[AI-A1 Bridge][bg] register failed for", host, e);
      }
    }
  }

  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id && (await isAiUrl(tab.url))) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: false },
            files: ["content-main.js"],
            world: "MAIN",
          });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: false },
            files: ["content.js"],
          });
        } catch (e) {}
      }
    }
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    try {
      const defaults = self.AO_DEFAULTS || {};
      const current = await chrome.storage.local.get({
        pickedTriggers: {},
        copySelector: "",
      });
      const merged = {
        ...(defaults.pickedTriggers || {}),
        ...(current.pickedTriggers || {}),
      };
      await chrome.storage.local.set({
        pickedTriggers: merged,
        copySelector: current.copySelector || defaults.copySelector || "",
      });
    } catch (e) {}
  }
  syncDynamicScripts();
});

chrome.runtime.onStartup.addListener(() => {
  syncDynamicScripts();
});
syncDynamicScripts();

chrome.tabs.onActivated.addListener(async (info) => {
  try {
    const tab = await chrome.tabs.get(info.tabId);
    if (await isAiUrl(tab.url)) await rememberLastAiTab(tab);
  } catch {}
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = changeInfo.url || tab?.url;
  if (url && (await isAiUrl(url))) {
    try {
      const full = await chrome.tabs.get(tabId);
      await rememberLastAiTab(full);
    } catch {}
  }
});

async function sendToTab(tabId, msg, retries, delayMs) {
  retries = retries || 15;
  delayMs = delayMs || 400;
  for (let i = 0; i < retries; i++) {
    try {
      return await chrome.tabs.sendMessage(tabId, msg);
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

async function focusOrOpenApp(payload, sender) {
  const settings = await getSettings();

  if (sender && sender.tab) {
    await rememberLastAiTab(sender.tab);
  } else {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab && (await isAiUrl(activeTab.url))) {
        await rememberLastAiTab(activeTab);
      }
    } catch {}
  }

  const forcePaste = payload?.forcePaste === true;
  const forceStart = payload?.forceStart === true;
  const wantPaste = forcePaste || settings.autoPaste;
  const wantStart = forceStart || (wantPaste && settings.autoStart);
  const text = payload?.text ?? null;

  const tabs = await getAllAppTabs();
  let tabId = null;
  let navigated = false;

  if (tabs.length > 0) {
    const t = tabs[0];
    tabId = t.id;
    const url = t.pendingUrl || t.url || "";
    const onRun = url.includes("/run");
    const onWorkspace = url.includes("/workspace");
    if (onRun || onWorkspace) {
      await chrome.tabs.update(tabId, { active: true });
    } else {
      await chrome.tabs.update(tabId, { url: RUN_URL, active: true });
      navigated = true;
    }
    if (t.windowId != null) {
      try {
        await chrome.windows.update(t.windowId, { focused: true });
      } catch {}
    }
  } else {
    const created = await chrome.tabs.create({ url: RUN_URL, active: true });
    tabId = created.id;
    navigated = true;
  }

  let pasteOk = null;
  if (wantPaste && tabId != null) {
    if (navigated) await new Promise((r) => setTimeout(r, 1500));
    pasteOk = await sendToTab(tabId, {
      type: "paste-content",
      text: text,
      autoStart: wantStart,
    });
  }

  return { ok: true, tabId, navigated, wantPaste, wantStart, pasteOk };
}

async function ensureContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["content-main.js"],
      world: "MAIN",
    });
  } catch (e) {}
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["content.js"],
    });
  } catch (e) {}
}

async function deliverToLastAiTab(text) {
  if (!text) return { ok: false, reason: "empty-text" };
  const last = await getLastAiTab();
  if (!last || !last.id) return { ok: false, reason: "no-ai-tab" };

  let target;
  try {
    target = await chrome.tabs.get(last.id);
  } catch {
    return { ok: false, reason: "ai-tab-closed" };
  }

  await chrome.tabs.update(target.id, { active: true });
  if (target.windowId != null) {
    try { await chrome.windows.update(target.windowId, { focused: true }); } catch {}
  }

  await ensureContentScript(target.id);
  await new Promise((r) => setTimeout(r, 200));

  const reply = await sendToTab(target.id, { type: "paste-into-ai-input", text }, 10, 400);

  if (!reply || !reply.ok) {
    return { ok: false, reason: reply?.reason || "paste-failed", detail: reply?.error || null };
  }
  return { ok: true, length: text.length, method: reply.method, sent: !!reply.sent };
}

async function sendOutputToAiManual() {
  const appTabs = await getAllAppTabs();
  if (appTabs.length === 0) return { ok: false, reason: "no-app-tab" };

  const reply = await sendToTab(appTabs[0].id, { type: "read-terminal-output" }, 8, 350);
  const text = (reply && reply.text) || "";
  if (!text) return { ok: false, reason: "no-output" };

  return await deliverToLastAiTab(text);
}

async function startPickMode() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return { ok: false, reason: "no-tab" };

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      files: ["content-main.js"],
      world: "MAIN",
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: false },
      files: ["content.js"],
    });
  } catch (e) {}

  await new Promise((r) => setTimeout(r, 200));

  try {
    const reply = await chrome.tabs.sendMessage(tab.id, { type: "start-pick-mode" });
    if (!reply || !reply.ok) {
      return { ok: false, reason: reply?.reason || "no-response" };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

async function savePickResult(host, selector) {
  if (!host || !selector) return { ok: false, reason: "missing" };
  const { pickedTriggers = {} } = await chrome.storage.local.get({ pickedTriggers: {} });
  pickedTriggers[host] = selector;
  await chrome.storage.local.set({ pickedTriggers });
  return { ok: true };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return false;

  if (msg.type === "focus-app" || msg.type === "test-paste") {
    focusOrOpenApp(msg, sender).then(sendResponse).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "send-output-to-ai") {
    sendOutputToAiManual().then(sendResponse).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "auto-send-output") {
    deliverToLastAiTab(msg.text).then(sendResponse).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "sync-dynamic-scripts") {
    syncDynamicScripts().then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "start-pick-mode") {
    startPickMode().then(sendResponse).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg.type === "pick-result") {
    savePickResult(msg.host, msg.selector).then(sendResponse).catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  return false;
});
