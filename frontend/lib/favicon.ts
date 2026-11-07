const DOT_COLOR = {
  idle: "#000000",
  running: "#d4d4d4",
  done: "#11ff99",
  stopped: "#737373",
  failed: "#ff1a1a",
  killed: "#737373",
} as const;

export type FaviconState = keyof typeof DOT_COLOR;

const LINK_ID = "ao-favicon";
const STORAGE_KEY = "ao-favicon-state";
const IDLE_ICON = "/icon.png";

let pulseInterval: ReturnType<typeof setInterval> | null = null;
let isPulseOn = true;

function drawFavicon(state: FaviconState, colorOverride?: string) {
  const link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) return;

  if (state === "idle") {
    if (link.getAttribute("href") !== IDLE_ICON) {
      link.setAttribute("type", "image/png");
      link.setAttribute("href", IDLE_ICON);
    }
    return;
  }

  const img = new Image();
  img.src = IDLE_ICON;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw the base image
    ctx.drawImage(img, 0, 0, 64, 64);

    // Draw the status dot
    const dot = colorOverride || DOT_COLOR[state];
    ctx.beginPath();
    ctx.arc(52, 52, 12, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();

    // Add a thin border to the dot
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000"; 
    ctx.stroke();

    // Update the favicon
    const href = canvas.toDataURL("image/png");
    if (link.getAttribute("href") !== href) {
      link.setAttribute("type", "image/png");
      link.setAttribute("href", href);
    }
  };
}

export function setFavicon(state: FaviconState) {
  if (typeof document === "undefined") return;

  // Ensure link exists
  let link = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "icon";
    document.head.appendChild(link);
  }

  try {
    localStorage.setItem(STORAGE_KEY, state);
  } catch {}

  // Clear any existing animation
  if (pulseInterval) {
    clearInterval(pulseInterval);
    pulseInterval = null;
  }

  if (state === "running") {
    // Start pulsing animation (light gray to dark gray)
    isPulseOn = true;
    drawFavicon(state, "#d4d4d4");
    pulseInterval = setInterval(() => {
      isPulseOn = !isPulseOn;
      drawFavicon(state, isPulseOn ? "#d4d4d4" : "#525252");
    }, 500); // Toggle every 500ms
  } else {
    // Static state (failed is red, stopped is gray, done is green, etc.)
    drawFavicon(state);
  }
}

export function getStoredFaviconState(): FaviconState {
  if (typeof localStorage === "undefined") return "idle";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v && v in DOT_COLOR) return v as FaviconState;
  return "idle";
}
