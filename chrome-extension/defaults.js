// AI-A1 Bridge — shipped defaults.
//
// Entries in `pickedTriggers` are merged into chrome.storage on first
// install (and only then — user picks always win on later installs).
// Commit any picks you want other devs to inherit when they clone the
// repo and load the extension fresh.
//
// Workflow:
//   1. Open the extension popup, click "Pick element" on the target site.
//   2. Click the copy button you want to use as the trigger.
//   3. Open the popup → "More settings" → "Export picks".
//   4. Paste the JSON below and commit defaults.js.
//
// Keys are HOSTNAMES (no scheme, no path). Wildcards are NOT supported
// here — pick the exact host you clicked on (e.g. "chatgpt.com",
// "chat.deepseek.com", "gemini.google.com").

self.AO_DEFAULTS = {
  pickedTriggers: {
    // "chatgpt.com": "[data-testid='copy-turn-action-button']",
    // "chat.deepseek.com": "button[aria-label='Copy']",
    // "gemini.google.com": "button[aria-label='Copy']",
  },

  // Optional global fallback selector used when a host has no pick.
  // Leave empty to use the default "class contains copy" heuristic.
  copySelector: "",
};
