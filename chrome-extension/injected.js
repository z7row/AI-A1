// AI-A1 Bridge — hook that runs in the page's MAIN world.
//
// Loaded via <script src="chrome-extension://.../injected.js"> so it is
// not blocked by strict page CSP (Gemini, in particular, forbids inline
// scripts but allows scripts from our extension's origin because it is
// listed in script-src).
//
// Everything here is plain ES5 to keep the surface small.

(function () {
  // Guard so re-injection (e.g. content script running twice) is a no-op.
  if (window.__ai_a1_hook_installed) return;
  window.__ai_a1_hook_installed = true;

  function fire(source, text) {
    try {
      window.postMessage(
        { __ai_a1_copy__: true, source: source, text: text },
        "*"
      );
    } catch (e) {}
  }

  // 1) Clipboard.prototype.writeText / write
  try {
    var proto = typeof Clipboard !== "undefined" && Clipboard.prototype;
    if (proto && typeof proto.writeText === "function" && !proto.__ai_a1_wt) {
      var origWT = proto.writeText;
      var newWT = function (text) {
        fire("clipboard.writeText", typeof text === "string" ? text : null);
        return origWT.apply(this, arguments);
      };
      newWT.__ai_a1_wt = true;
      Object.defineProperty(proto, "writeText", {
        value: newWT,
        configurable: true,
        writable: true,
      });
    }
    if (proto && typeof proto.write === "function" && !proto.__ai_a1_w) {
      var origW = proto.write;
      var newW = function () {
        fire("clipboard.write", null);
        return origW.apply(this, arguments);
      };
      newW.__ai_a1_w = true;
      Object.defineProperty(proto, "write", {
        value: newW,
        configurable: true,
        writable: true,
      });
    }
  } catch (e) {}

  // 2) Instance-level fallback (in case the prototype was frozen)
  try {
    var c = navigator.clipboard;
    if (c) {
      try {
        var origWTi = c.writeText.bind(c);
        Object.defineProperty(c, "writeText", {
          value: function (text) {
            fire(
              "clipboard.writeText-inst",
              typeof text === "string" ? text : null
            );
            return origWTi.apply(null, arguments);
          },
          configurable: true,
          writable: true,
        });
      } catch (e) {}
      try {
        var origWi = c.write.bind(c);
        Object.defineProperty(c, "write", {
          value: function () {
            fire("clipboard.write-inst", null);
            return origWi.apply(null, arguments);
          },
          configurable: true,
          writable: true,
        });
      } catch (e) {}
    }
  } catch (e) {}

  // 3) execCommand("copy")
  try {
    var origExec = Document.prototype.execCommand;
    Document.prototype.execCommand = function (cmd) {
      if (typeof cmd === "string" && cmd.toLowerCase() === "copy") {
        fire("execCommand", null);
      }
      return origExec.apply(this, arguments);
    };
  } catch (e) {}

  // 4) Native copy event (covers Ctrl+C and hidden execCommand paths)
  try {
    document.addEventListener(
      "copy",
      function () {
        fire("copy-event", null);
      },
      true
    );
  } catch (e) {}
})();
