// AI-A1 Bridge — popup script.

const PRESETS = {
  chatgpt: { name: "ChatGPT", hosts: ["chatgpt.com", "chat.openai.com"] },
  deepseek: { name: "DeepSeek", hosts: ["chat.deepseek.com", "deepseek.com"] },
  gemini: { name: "Gemini", hosts: ["gemini.google.com", "bard.google.com"] },
};

const ALL_PRESET_HOSTS = Object.values(PRESETS).flatMap((p) => p.hosts);

const K_ENABLED = "enabled";
const K_PRESETS = "activePresets";
const K_CUSTOMS = "customSites";
const K_PICKED = "pickedTriggers";
const K_AUTOPASTE = "autoPaste";
const K_AUTOSTART = "autoStart";
const K_AUTOSEND = "autoSend";
const K_AUTOSEND_ENTER = "autoSendEnter";
const K_AUTOBOTTOM = "autoBottom";

const elIcon = document.getElementById("ext-icon");
const cbEnabled = document.getElementById("cb-enabled");
const aiButtons = document.querySelectorAll(".ai-btn");
const customList = document.getElementById("custom-sites");
const addCurrentBtn = document.getElementById("add-current");
const currentHostEl = document.getElementById("current-host");
const toggleUrlBtn = document.getElementById("toggle-url");
const urlWrap = document.getElementById("url-wrap");
const urlInput = document.getElementById("url-input");
const urlSave = document.getElementById("url-save");
const pickedDisplay = document.getElementById("picked-display");
const pickedSelector = document.getElementById("picked-selector");
const pickedRemove = document.getElementById("picked-remove");
const pickedRepick = document.getElementById("picked-repick");
const pickedEdit = document.getElementById("picked-edit");
const pickedEditWrap = document.getElementById("picked-edit-wrap");
const pickedInput = document.getElementById("picked-input");
const pickedSave = document.getElementById("picked-save");
const pickBtn = document.getElementById("pick-btn");
const pickHint = document.getElementById("pick-hint");
const cbPaste = document.getElementById("cb-paste");
const cbStart = document.getElementById("cb-start");
const cbAutosend = document.getElementById("cb-autosend");
const cbAutosendEnter = document.getElementById("cb-autosend-enter");
const cbAutobottom = document.getElementById("cb-autobottom");
const btnExportPicks = document.getElementById("export-picks");
const btnSendOutput = document.getElementById("send-output");
const btnTestPaste = document.getElementById("test-paste");
const btnTestPasteStart = document.getElementById("test-paste-start");
const elStatus = document.getElementById("status");

let currentHost = null;

function hostFromUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.hostname.toLowerCase();
  } catch { return null; }
}

function hostFromInput(input) {
  const s = (input || "").trim().toLowerCase();
  if (!s) return null;
  if (s.includes("://") || s.includes("/")) {
    return hostFromUrl(s.includes("://") ? s : "https://" + s);
  }
  if (!/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(s)) return null;
  return s;
}

function hostMatches(host, pattern) {
  return host === pattern || host.endsWith("." + pattern);
}

async function load() {
  return await chrome.storage.local.get({
    [K_ENABLED]: false,
    [K_PRESETS]: ["chatgpt", "deepseek", "gemini"],
    [K_CUSTOMS]: [],
    [K_PICKED]: {},
    [K_AUTOPASTE]: false,
    [K_AUTOSTART]: false,
    [K_AUTOSEND]: false,
    [K_AUTOSEND_ENTER]: false,
    [K_AUTOBOTTOM]: false,
  });
}

async function save(patch) {
  await chrome.storage.local.set(patch);
}

async function getCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab || null;
  } catch { return null; }
}

function lookupPick(pickedTriggers, host) {
  if (!host) return "";
  if (pickedTriggers[host]) return pickedTriggers[host];
  const parts = host.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    const parent = parts.slice(i).join(".");
    if (pickedTriggers[parent]) return pickedTriggers[parent];
  }
  return "";
}

function render(state) {
  cbEnabled.checked = !!state[K_ENABLED];
  elIcon.classList.toggle("on", !!state[K_ENABLED]);

  aiButtons.forEach((btn) => {
    btn.classList.toggle("active", state[K_PRESETS].includes(btn.dataset.preset));
  });

  customList.innerHTML = "";
  for (const host of state[K_CUSTOMS]) {
    const chip = document.createElement("div");
    chip.className = "custom-chip";
    const label = document.createElement("span");
    label.className = "chip-label";
    label.textContent = host;
    const rm = document.createElement("button");
    rm.className = "chip-remove";
    rm.dataset.host = host;
    rm.title = "Remove";
    rm.textContent = "×";
    chip.appendChild(label);
    chip.appendChild(rm);
    customList.appendChild(chip);
  }

  cbPaste.checked = !!state[K_AUTOPASTE];
  cbStart.checked = !!state[K_AUTOSTART];
  cbAutosend.checked = !!state[K_AUTOSEND];
  cbAutosendEnter.checked = !!state[K_AUTOSEND_ENTER];
  cbAutobottom.checked = !!state[K_AUTOBOTTOM];
}

async function updatePickedSection(state) {
  const host = currentHost;

  if (!host) {
    pickedDisplay.hidden = true;
    pickBtn.hidden = true;
    pickHint.hidden = true;
    return;
  }

  const sel = lookupPick(state[K_PICKED], host);

  if (sel) {
    pickedDisplay.hidden = false;
    pickBtn.hidden = true;
    pickHint.hidden = true;
    pickedSelector.textContent = sel;
    pickedSelector.title = sel;
  } else {
    pickedDisplay.hidden = true;
    pickBtn.hidden = false;
    pickHint.hidden = true;
  }
}

async function updateAddCurrent(state) {
  const host = currentHost;
  if (!host) {
    addCurrentBtn.hidden = true;
    return;
  }
  if (ALL_PRESET_HOSTS.some((p) => hostMatches(host, p))) {
    addCurrentBtn.hidden = true;
    return;
  }
  if (state[K_CUSTOMS].includes(host)) {
    addCurrentBtn.hidden = true;
    return;
  }
  currentHostEl.textContent = host;
  addCurrentBtn.hidden = false;
}

async function syncScripts() {
  try {
    await chrome.runtime.sendMessage({ type: "sync-dynamic-scripts" });
  } catch (e) {}
}

async function injectCurrentTab() {
  try {
    const tab = await getCurrentTab();
    if (!tab?.id) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ["content-main.js"],
        world: "MAIN",
      });
    } catch {}
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: false },
        files: ["content.js"],
      });
    } catch {}
  } catch {}
}

async function requestHostPermission(host) {
  const origins = [`https://${host}/*`, `http://${host}/*`];
  try {
    const has = await chrome.permissions.contains({ origins });
    if (has) return true;
    return await chrome.permissions.request({ origins });
  } catch {
    return false;
  }
}

async function addCustomSite(host, injectTab) {
  if (!host) return { ok: false, error: "Invalid host" };

  const granted = await requestHostPermission(host);
  if (!granted) return { ok: false, error: "Permission denied" };

  const state = await load();
  if (!state[K_CUSTOMS].includes(host)) {
    state[K_CUSTOMS].push(host);
    await save({ [K_CUSTOMS]: state[K_CUSTOMS] });
  }

  await syncScripts();
  if (injectTab) await injectCurrentTab();

  return { ok: true };
}

async function removeCustomSite(host) {
  const state = await load();
  const filtered = state[K_CUSTOMS].filter((h) => h !== host);
  await save({ [K_CUSTOMS]: filtered });
  await syncScripts();
}

function isOnAnyActiveSite(state) {
  if (!currentHost) return false;
  if (ALL_PRESET_HOSTS.some((p) => hostMatches(currentHost, p))) {
    const presetId = Object.keys(PRESETS).find((id) =>
      PRESETS[id].hosts.some((h) => hostMatches(currentHost, h))
    );
    if (presetId && state[K_PRESETS].includes(presetId)) return true;
  }
  if (state[K_CUSTOMS].includes(currentHost)) return true;
  return false;
}

(async () => {
  const tab = await getCurrentTab();
  currentHost = hostFromUrl(tab?.url);
  const state = await load();
  render(state);
  await updateAddCurrent(state);
  await updatePickedSection(state);
})();

cbEnabled.addEventListener("change", async () => {
  await save({ [K_ENABLED]: cbEnabled.checked });
  elIcon.classList.toggle("on", cbEnabled.checked);
});

aiButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.preset;
    const state = await load();
    const active = [...state[K_PRESETS]];
    const idx = active.indexOf(id);
    if (idx >= 0) active.splice(idx, 1);
    else active.push(id);
    await save({ [K_PRESETS]: active });
    const next = { ...state, [K_PRESETS]: active };
    render(next);
    await updateAddCurrent(next);
    await updatePickedSection(next);
  });
});

customList.addEventListener("click", async (e) => {
  const btn = e.target.closest(".chip-remove");
  if (!btn) return;
  const host = btn.dataset.host;
  await removeCustomSite(host);
  const state = await load();
  render(state);
  await updateAddCurrent(state);
});

addCurrentBtn.addEventListener("click", async () => {
  const host = currentHost;
  if (!host) return;
  elStatus.textContent = "Adding " + host + "…";
  const res = await addCustomSite(host, true);
  if (!res.ok) {
    elStatus.textContent = "Failed: " + (res.error || "unknown");
    return;
  }
  elStatus.textContent = host + " added.";
  const state = await load();
  render(state);
  await updateAddCurrent(state);
});

toggleUrlBtn.addEventListener("click", () => {
  urlWrap.hidden = !urlWrap.hidden;
  if (!urlWrap.hidden) urlInput.focus();
});

urlSave.addEventListener("click", async () => {
  const host = hostFromInput(urlInput.value);
  if (!host) {
    elStatus.textContent = "Invalid URL.";
    return;
  }
  elStatus.textContent = "Adding " + host + "…";
  const res = await addCustomSite(host, false);
  if (!res.ok) {
    elStatus.textContent = "Failed: " + (res.error || "unknown");
    return;
  }
  elStatus.textContent = host + " added.";
  urlInput.value = "";
  urlWrap.hidden = true;
  const state = await load();
  render(state);
  await updateAddCurrent(state);
});

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") urlSave.click();
});

async function startPick() {
  const state = await load();
  if (!state[K_ENABLED]) {
    elStatus.textContent = "Turn on 'Enabled' at the top first.";
    return;
  }
  if (!isOnAnyActiveSite(state)) {
    elStatus.textContent = "Current tab isn't an active AI site. Enable its model first.";
    return;
  }
  const res = await chrome.runtime.sendMessage({ type: "start-pick-mode" });
  if (!res?.ok) {
    elStatus.textContent = "Pick failed: " + (res?.error || res?.reason || "unknown");
    return;
  }
  elStatus.textContent = "Click the copy button on the page…";
  window.close();
}

pickBtn.addEventListener("click", startPick);
pickedRepick.addEventListener("click", startPick);

pickedEdit.addEventListener("click", () => {
  pickedEditWrap.hidden = !pickedEditWrap.hidden;
  if (!pickedEditWrap.hidden) {
    pickedInput.value = pickedSelector.textContent || "";
    pickedInput.focus();
    pickedInput.select();
  }
});

pickedSave.addEventListener("click", async () => {
  const sel = pickedInput.value.trim();
  if (!sel) {
    elStatus.textContent = "Selector is empty.";
    return;
  }
  try { document.createDocumentFragment().querySelector(sel); } 
  catch { elStatus.textContent = "Invalid CSS selector."; return; }
  if (!currentHost) return;
  const state = await load();
  const picked = { ...state[K_PICKED] };
  picked[currentHost] = sel;
  await save({ [K_PICKED]: picked });
  elStatus.textContent = "Selector saved.";
  pickedEditWrap.hidden = true;
  const next = await load();
  render(next);
  await updatePickedSection(next);
});

pickedInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") pickedSave.click();
});

pickedRemove.addEventListener("click", async () => {
  if (!currentHost) return;
  const state = await load();
  const picked = { ...state[K_PICKED] };
  delete picked[currentHost];
  const parts = currentHost.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    delete picked[parts.slice(i).join(".")];
  }
  await save({ [K_PICKED]: picked });
  elStatus.textContent = "Picked trigger removed.";
  const next = await load();
  render(next);
  await updatePickedSection(next);
});

cbAutosendEnter.addEventListener("change", async () => {
  await save({ [K_AUTOSEND_ENTER]: cbAutosendEnter.checked });
});

cbAutobottom.addEventListener("change", async () => {
  await save({ [K_AUTOBOTTOM]: cbAutobottom.checked });
});

btnExportPicks.addEventListener("click", async () => {
  const state = await load();
  const json = JSON.stringify(state[K_PICKED] || {}, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    elStatus.textContent = "Picks copied — paste them into defaults.js";
  } catch {
    elStatus.textContent = "Could not copy to clipboard.";
  }
});

cbPaste.addEventListener("change", async () => {
  const patch = { [K_AUTOPASTE]: cbPaste.checked };
  if (!cbPaste.checked) patch[K_AUTOSTART] = false;
  await save(patch);
  if (patch[K_AUTOSTART] !== undefined) cbStart.checked = false;
});

cbStart.addEventListener("change", async () => {
  await save({ [K_AUTOSTART]: cbStart.checked });
});

cbAutosend.addEventListener("change", async () => {
  await save({ [K_AUTOSEND]: cbAutosend.checked });
});

btnSendOutput.addEventListener("click", async () => {
  elStatus.textContent = "Reading terminal output…";
  try {
    const res = await chrome.runtime.sendMessage({ type: "send-output-to-ai" });
    if (!res?.ok) {
      const reasons = {
        "no-app-tab": "No localhost:2000 tab open.",
        "no-output": "Terminal has no output yet.",
        "no-ai-tab": "No AI tab remembered — open one first.",
        "ai-tab-closed": "The remembered AI tab was closed.",
        "empty-text": "No text to send.",
        "no-input": "Could not find the AI chat input.",
        "paste-failed": "Paste simulation failed on that site.",
        "no-send": "Send button not found on that site.",
      };
      elStatus.textContent = "Error: " + (reasons[res?.reason] || res?.error || res?.reason || "unknown");
      return;
    }
    let msg = `Pasted ${res.length} chars into the AI input.`;
    if (res.sent) msg += " Sent.";
    else msg += " Press Enter to send.";
    elStatus.textContent = msg;
  } catch (e) {
    elStatus.textContent = "Runtime error: " + e.message;
  }
});

btnTestPaste.addEventListener("click", async () => {
  elStatus.textContent = "Test paste…";
  const res = await chrome.runtime.sendMessage({ type: "test-paste", forcePaste: true, text: null });
  elStatus.textContent = res?.ok ? "Done." : "Failed: " + (res?.error || "unknown");
});

btnTestPasteStart.addEventListener("click", async () => {
  elStatus.textContent = "Test paste + start…";
  const res = await chrome.runtime.sendMessage({ type: "test-paste", forcePaste: true, forceStart: true, text: null });
  elStatus.textContent = res?.ok ? "Done." : "Failed: " + (res?.error || "unknown");
});
