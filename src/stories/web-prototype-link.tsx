import {
  ArrowUpRight,
  Calendar,
  Monitor01,
  Phone01,
  ShoppingBag03,
} from "@untitledui/icons";
import { MockupStage } from "./device-mockups";

/** Published with Storybook on GitHub Pages; `npm run prototype:web` serves it locally on :6024. */
export const WEB_PROTOTYPE_LIVE_URL =
  "https://jg-tenfore.github.io/tf-crane-ds-v1/prototype/web/";
export const WEB_PROTOTYPE_LOCAL_URL = "http://localhost:6024/web/";

const isLocal = () =>
  typeof location !== "undefined" &&
  /^(localhost|127\.|192\.168\.)/.test(location.hostname);

/** Local → the Crane Web dev server on :6024. GitHub Pages → the sibling /prototype/web/ build. */
const webPrototypeHref = () =>
  isLocal()
    ? `${location.protocol}//${location.hostname}:6024/web/`
    : new URL(
        "prototype/web/",
        location.href.replace(/iframe\.html.*$/, ""),
      ).toString();

const FEATURES = [
  { icon: Calendar, text: "Book a tee time, register for events" },
  { icon: ShoppingBag03, text: "Shop the pro shop through checkout" },
  { icon: Phone01, text: "Review at desktop, laptop, tablet and phone" },
];

/**
 * Hero card for the Crane Web prototype: the Green stage banner (real screenshots of the iPhone app,
 * Crane Web desktop and Crane Web mobile in outline frames) over the copy. The whole card links out
 * to the review presenter (new tab).
 *
 * Docs pages restyle anchors and margins, so layout-critical styles are inline.
 */
export const WebPrototypeLink = () => {
  const href = webPrototypeHref();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Open the Crane Web prototype"
      style={{
        textDecoration: "none",
        marginTop: 0,
        marginBottom: 32,
        display: "block",
      }}
      className="not-prose group relative overflow-hidden rounded-[28px] bg-[#f4f1ea] shadow-ios-float ring-1 ring-black/5 transition duration-200 ease-ios hover:-translate-y-0.5 hover:shadow-2xl [&_*]:no-underline"
    >
      {/* Banner */}
      <span aria-hidden="true" className="block">
        <MockupStage radius={0} />
      </span>

      <span
        className="relative flex flex-wrap items-start gap-x-10 gap-y-6 p-8 md:p-10"
        style={{ fontFamily: "'Outfit Variable', system-ui, sans-serif" }}
      >
        {/* Copy */}
        <span
          className="flex min-w-[260px] flex-1 flex-col"
          style={{ gap: 18 }}
        >
          <span className="flex items-center gap-3">
            <span className="flex size-[52px] shrink-0 items-center justify-center rounded-[14px] bg-brand-600 shadow-md">
              <Monitor01 className="size-6 text-white" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-col" style={{ gap: 2 }}>
              <span className="text-xs font-semibold tracking-[2px] whitespace-nowrap text-[#5b6b60] uppercase">
                Responsive prototype
              </span>
              <span className="text-md font-semibold whitespace-nowrap text-[#14211a]">
                Crane Web · crane.tenfore.golf
              </span>
            </span>
          </span>
          <span className="flex flex-col" style={{ gap: 8 }}>
            <span
              className="block font-semibold tracking-tight text-[#14211a]"
              style={{ fontSize: 36, lineHeight: "42px" }}
            >
              Try Crane on the web
            </span>
            <span className="block max-w-[420px] text-md text-[#4a5a50]">
              crane.tenfore.golf, the site replacing Fox, as one working web
              app. Every page has a deep link, and a review panel switches the
              width.
            </span>
          </span>
        </span>

        {/* Features + CTA */}
        <span
          className="flex min-w-[260px] flex-1 flex-col"
          style={{ gap: 18, paddingTop: 4 }}
        >
          <span className="flex flex-col" style={{ gap: 10 }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-2.5 text-sm font-medium text-[#2b3a31]"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-600/10">
                  <Icon className="size-4 text-brand-600" aria-hidden="true" />
                </span>
                {text}
              </span>
            ))}
          </span>
          <span
            className="flex flex-wrap items-center gap-3"
            style={{ marginTop: 4 }}
          >
            <span className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand-600 px-6 text-md font-semibold text-white shadow-lg transition-all duration-200 ease-ios group-hover:gap-3">
              Open Crane Web
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </span>
            <span className="font-mono text-xs text-[#6b7a70]">
              {isLocal()
                ? "localhost:6024/web · npm run prototype:web"
                : href.replace(/^https?:\/\//, "")}
            </span>
          </span>
        </span>
      </span>
    </a>
  );
};
