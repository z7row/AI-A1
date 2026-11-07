/* ────────────────────────────────────────────────────────────
   Sound
   - success → MP3 chime at /public/sounds/…
   - fail    → short Web Audio descending tones
   ──────────────────────────────────────────────────────────── */

const SUCCESS_SRC =
  "/sounds/soundshelfstudio-ui-success-chime-513565.mp3";

let successAudio: HTMLAudioElement | null = null;
let audioCtx: AudioContext | null = null;

export function playDoneSound(kind: "success" | "fail" = "success") {
  if (kind === "success") {
    playSuccessAudio();
    return;
  }
  playFailTone();
}

function playSuccessAudio() {
  try {
    if (typeof window === "undefined") return;
    if (!successAudio) {
      successAudio = new Audio(SUCCESS_SRC);
      successAudio.preload = "auto";
      successAudio.volume = 0.9;
    }
    successAudio.currentTime = 0;
    const p = successAudio.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    /* ignore */
  }
}

function playFailTone() {
  try {
    if (typeof window === "undefined") return;
    if (!audioCtx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx = new Ctx();
    }
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const tones = [
      { f: 392.0, t: 0.0, d: 0.4, g: 0.1 },
      { f: 293.66, t: 0.16, d: 0.55, g: 0.09 },
    ];
    for (const { f, t, d, g } of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const start = now + t;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(g, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + d);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + d + 0.05);
    }
  } catch {
    /* ignore */
  }
}

/* ────────────────────────────────────────────────────────────
   Notifications
   ──────────────────────────────────────────────────────────── */

/** Request browser notification permission lazily. Returns current permission. */
export async function ensureNotifyPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

/** True when the browser has granted notification permission. */
export function canNotify(): boolean {
  if (typeof Notification === "undefined") return false;
  return Notification.permission === "granted";
}

/** Show a browser notification, if permission is granted. */
export function showBrowserNotification(title: string, body: string) {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    new Notification(title, {
      body,
      tag: "ao-ai",
      silent: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * True only when the user is NOT looking at this tab/window.
 * - `visibilityState === "hidden"` → user switched tab or minimised window.
 * - `hasFocus() === false` → user is in another app or another window.
 */
export function isPageHidden(): boolean {
  if (typeof document === "undefined") return false;
  if (document.visibilityState === "hidden") return true;
  if (typeof document.hasFocus === "function" && !document.hasFocus()) {
    return true;
  }
  return false;
}

/* ────────────────────────────────────────────────────────────
   Preferences (localStorage)
   ──────────────────────────────────────────────────────────── */

const SOUND_KEY = "ao-notify-sound";
const BROWSER_KEY = "ao-notify-browser";

export function getSoundEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(SOUND_KEY) !== "0";
}
export function setSoundEnabled(v: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SOUND_KEY, v ? "1" : "0");
}
export function getBrowserEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(BROWSER_KEY) !== "0";
}
export function setBrowserEnabled(v: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(BROWSER_KEY, v ? "1" : "0");
}
