import type { CSSProperties } from "react";
import { ArrowUpRight, Calendar, Phone01, User01 } from "@untitledui/icons";
import { CraneAppIcon } from "@/components/foundations/logos";

/** Published alongside Storybook on GitHub Pages; `npm run prototype` serves it locally on :6022. */
export const PROTOTYPE_LIVE_URL = "https://jg-tenfore.github.io/tf-crane-ds-v1/prototype/";
export const PROTOTYPE_LOCAL_URL = "http://localhost:6022/";

const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname);

/** Local → the dev server on :6022. GitHub Pages → the sibling /prototype/ build. */
const prototypeHref = () =>
    isLocal() ? `${location.protocol}//${location.hostname}:6022/` : new URL("prototype/", location.href.replace(/iframe\.html.*$/, "")).toString();

/** Real screenshots of the prototype, captured from it into public/prototype-preview/. */
const PHONES: { src: string; style: CSSProperties }[] = [
    { src: "prototype-preview/welcome.png", style: { left: 0, top: 46, width: 168, transform: "rotate(-7deg)", zIndex: 1 } },
    { src: "prototype-preview/profile.png", style: { right: 0, top: 46, width: 168, transform: "rotate(7deg)", zIndex: 1 } },
    { src: "prototype-preview/home.png", style: { left: "50%", top: 0, width: 196, transform: "translateX(-50%)", zIndex: 2 } },
];

const FEATURES = [
    { icon: Phone01, text: "Sign up or sign in" },
    { icon: Calendar, text: "Reserve a tee time" },
    { icon: User01, text: "Manage your profile" },
];

/**
 * Hero banner for the Introduction doc: the prototype's real screens fanned on a Crane-green
 * card. The whole card links out to the prototype (new tab).
 *
 * Docs pages restyle anchors and margins, so layout-critical styles are inline.
 */
export const PrototypeLink = () => {
    const href = prototypeHref();
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label="Open the Crane prototype"
            style={{ textDecoration: "none", marginTop: 32, marginBottom: 32, display: "block" }}
            className="not-prose group relative overflow-hidden rounded-[28px] bg-linear-to-br from-brand-600 via-brand-700 to-brand-950 shadow-ios-float ring-1 ring-black/5 transition duration-200 ease-ios hover:-translate-y-0.5 hover:shadow-2xl [&_*]:no-underline"
        >
            {/* Soft light blooms behind the phones. */}
            <span aria-hidden="true" className="pointer-events-none absolute -top-24 right-24 size-[360px] rounded-full bg-white/10 blur-3xl" />
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 size-[300px] rounded-full bg-brand-400/25 blur-3xl" />

            <span className="relative flex flex-wrap items-center gap-8 p-8 md:flex-nowrap md:p-10">
                {/* Copy */}
                <span className="flex min-w-[260px] flex-1 flex-col" style={{ gap: 18 }}>
                    <span className="flex items-center gap-3">
                        <CraneAppIcon size={52} />
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">Interactive prototype</span>
                    </span>
                    <span className="flex flex-col" style={{ gap: 8 }}>
                        <span className="block font-bold tracking-tight text-white" style={{ fontSize: 36, lineHeight: "42px" }}>
                            Try the Crane app
                        </span>
                        <span className="block max-w-[420px] text-md text-white/80">
                        Every screen in this Storybook, stitched into one working iPhone app. Your bookings, courses and settings are saved as you go.
                        </span>
                    </span>
                    <span className="flex flex-col" style={{ gap: 10 }}>
                        {FEATURES.map(({ icon: Icon, text }) => (
                            <span key={text} className="flex items-center gap-2.5 text-sm font-medium text-white/90">
                                <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
                                    <Icon className="size-4 text-white" aria-hidden="true" />
                                </span>
                                {text}
                            </span>
                        ))}
                    </span>
                    <span className="flex flex-wrap items-center gap-3" style={{ marginTop: 6 }}>
                        <span className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-md font-semibold text-brand-secondary shadow-lg transition-all duration-200 ease-ios group-hover:gap-3">
                            Open prototype
                            <ArrowUpRight className="size-5" aria-hidden="true" />
                        </span>
                        <span className="font-mono text-xs text-white/65">{isLocal() ? "localhost:6022 · npm run prototype" : href.replace(/^https?:\/\//, "")}</span>
                    </span>
                </span>

                {/* Phones */}
                <span aria-hidden="true" className="relative mx-auto block h-[430px] w-[440px] shrink-0">
                    {PHONES.map((p) => (
                        <img key={p.src} src={p.src} alt="" className="absolute h-auto max-w-none drop-shadow-[0_24px_40px_rgba(0,0,0,0.35)]" style={p.style} />
                    ))}
                </span>
            </span>
        </a>
    );
};
