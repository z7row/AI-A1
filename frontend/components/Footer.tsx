import { ExternalLink } from "lucide-react";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.13c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.19a11.04 11.04 0 0 1 5.79 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.04.78 2.1v3.11c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line/60">
      <div className="mx-auto flex max-w-300 flex-col gap-4 px-6 py-8 text-[13px] text-ink-soft md:flex-row md:items-center">
        <span className="text-ink-mute">
          AO-AI © {new Date().getFullYear()}
        </span>
        <span className="text-ink-mute">
          made by{" "}
          <a
            href="https://z7row.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-ink hover:text-accent inline-flex items-center gap-1"
          >
            Z7row <ExternalLink size={12} />
          </a>
        </span>
        <span className="md:ml-auto flex items-center gap-4">
          <a
            href="https://github.com/z7row"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink"
          >
            <GithubIcon size={14} /> github/z7row
          </a>
          <a
            href="https://z7row.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="text-ink-soft hover:text-ink"
          >
            prex-sand.vercel.app
          </a>
        </span>
      </div>
    </footer>
  );
}
