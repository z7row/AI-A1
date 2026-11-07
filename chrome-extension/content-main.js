// AI-A1 Bridge — content script (MAIN world) to intercept copy events.

(function () {
  if (window.__ao_main_installed) return;
  window.__ao_main_installed = true;

  let armUntil = 0;

  // Only intercept when the extension tells us the user clicked the specific copy button
  window.addEventListener("message", (e) => {
    if (e.source !== window) return;
    if (e.data && e.data.__ao_arm_copy_intercept__) {
      armUntil = Date.now() + 2000; // Arm for 2 seconds
    }
  });

  // 1. Intercept navigator.clipboard.writeText (Used by React sites like DeepSeek)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async (text) => {
      try {
        if (Date.now() < armUntil && text && text.trim()) {
          window.postMessage({ __ai_a1_copy__: true, text, source: "clipboard-api" }, "*");
        }
      } catch (e) {}
      return originalWriteText(text);
    };
  }

  // 2. Intercept native copy events (Ctrl+C, or sites that use selection)
  document.addEventListener(
    "copy",
    () => {
      if (Date.now() > armUntil) return; // Ignore if not armed
      setTimeout(() => {
        try {
          const text = window.getSelection()?.toString() || "";
          if (text.trim()) {
            window.postMessage({ __ai_a1_copy__: true, text, source: "copy-event" }, "*");
          }
        } catch (e) {}
      }, 10);
    },
    true
  );

  // 3. Intercept document.execCommand('copy')
  const originalExecCommand = document.execCommand.bind(document);
  document.execCommand = function (command, showUI, value) {
    if (Date.now() < armUntil && command === 'copy') {
      try {
        const text = window.getSelection()?.toString() || "";
        if (text.trim()) {
          window.postMessage({ __ai_a1_copy__: true, text, source: "execCommand" }, "*");
        }
      } catch (e) {}
    }
    return originalExecCommand(command, showUI, value);
  };
})();
