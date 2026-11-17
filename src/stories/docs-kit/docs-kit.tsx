/**
 * Docs kit — the building blocks for Crane's documentation pages (Start Here, Screen indexes,
 * Reviews). One visual language across every docs page: warm-cream cards, Crane-green
 * eyebrows and links, Outfit type.
 *
 * Links between pages: pass a Storybook id (`"start-here-style-guide--docs"` or a story id) as
 * `to`. Inside Storybook the link switches pages in place (no reload); opened in a new tab or
 * outside Storybook it falls back to a normal `?path=` URL. External links use `href`.
 *
 * Docs pages restyle anchors, lists and margins, so layout-critical styles are inline or
 * wrapped in `not-prose`.
 */
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "@untitledui/icons";
import { addons } from "storybook/preview-api";
import { SELECT_STORY } from "storybook/internal/core-events";
import { cx } from "@/utils/cx";

/* ------------------------------------------------------------------ tokens */

export const DOC = {
    font: "'Outfit Variable', system-ui, sans-serif",
    ink: "#14211a",
    body: "#3f4b44",
    muted: "#6b7a70",
    brand: "#2C7C4D",
    brandDeep: "#1f5c3a",
    cream: "#f7f8f6",
    creamDeep: "#eef1ed",
    line: "#e3e7e2",
    mint: "#e8f3ec",
    amber: "#fdf3e1",
} as const;

/* ------------------------------------------------------------------- links */

/** A Storybook id → `?path=` URL relative to the manager (works locally and on GitHub Pages). */
export const storyPath = (id: string) => `?path=/${id.endsWith("--docs") ? "docs" : "story"}/${id}`;

const managerBase = () => {
    try {
        const top = window.top ?? window;
        return top.location.href.split("?")[0];
    } catch {
        return "";
    }
};

const go = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    try {
        e.preventDefault();
        addons.getChannel().emit(SELECT_STORY, { storyId: id, viewMode: id.endsWith("--docs") ? "docs" : "story" });
    } catch {
        window.top?.location.assign(`${managerBase()}${storyPath(id)}`);
    }
};

export interface LinkTarget {
    /** Storybook id of a docs page or story (in-app link). */
    to?: string;
    /** External URL (opens in a new tab). */
    href?: string;
}

const linkProps = ({ to, href }: LinkTarget) =>
    to
        ? { href: `${managerBase()}${storyPath(to)}`, onClick: go(to), target: "_top" as const }
        : { href, target: "_blank" as const, rel: "noreferrer" };

const isLocal = () => typeof location !== "undefined" && /^(localhost|127\.|192\.168\.)/.test(location.hostname);

/**
 * Deep link into the Crane Web prototype (hash route, e.g. "/shop/golf-balls/dozens").
 * Local: the review presenter on :6024. GitHub Pages: the sibling /prototype/web/ build.
 */
export const webPrototype = (path = "/tee-times") =>
    isLocal() ? `${location.protocol}//${location.hostname}:6024/web/#${path}` : `${managerBase().replace(/[^/]*$/, "")}prototype/web/#${path}`;

/** Deep link into the iPhone prototype (hash route, e.g. "/profile"). Local :6022, Pages /prototype/. */
export const iphonePrototype = (path = "") =>
    isLocal() ? `${location.protocol}//${location.hostname}:6022/${path ? `#${path}` : ""}` : `${managerBase().replace(/[^/]*$/, "")}prototype/${path ? `#${path}` : ""}`;

/** Deep link into the MCG Instruction prototype (hash route, e.g. "/instruction"). Local :6026/mcg/, Pages /prototype/mcg/. */
export const mcgPrototype = (path = "/") =>
    isLocal() ? `${location.protocol}//${location.hostname}:6026/mcg/#${path}` : `${managerBase().replace(/[^/]*$/, "")}prototype/mcg/#${path}`;

/** Screenshot captured for the docs (public/docs/screens/<name>.webp). */
export const screen = (name: string) => `docs/screens/${name}.webp`;

/** Inline text link with an arrow (→ in Storybook, ↗ external). */
export const DocLink = ({ children, className, ...t }: LinkTarget & { children: ReactNode; className?: string }) => {
    const Icon = t.to ? ArrowRight : ArrowUpRight;
    return (
        <a {...linkProps(t)} className={cx("inline-flex items-center gap-1 text-sm font-semibold no-underline hover:underline", className)} style={{ color: DOC.brand, textDecoration: "none" }}>
            {children}
            <Icon className="size-4" aria-hidden="true" />
        </a>
    );
};

/** Primary (filled) or secondary (outlined) button-link. */
export const DocButton = ({ children, variant = "primary", ...t }: LinkTarget & { children: ReactNode; variant?: "primary" | "secondary" }) => {
    const Icon = t.to ? ArrowRight : ArrowUpRight;
    const primary = variant === "primary";
    return (
        <a
            {...linkProps(t)}
            className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-md font-semibold transition duration-100 ease-linear hover:brightness-95"
            style={{
                textDecoration: "none",
                background: primary ? DOC.brand : "#fff",
                color: primary ? "#fff" : DOC.ink,
                boxShadow: primary ? "0 1px 2px rgba(20,33,26,0.2)" : `inset 0 0 0 1px ${DOC.line}`,
            }}
        >
            {children}
            <Icon className="size-4" aria-hidden="true" />
        </a>
    );
};

/* -------------------------------------------------------------- primitives */

/** Caps eyebrow in Crane green. */
export const Eyebrow = ({ children, color = DOC.brand }: { children: ReactNode; color?: string }) => (
    <span className="block text-xs font-bold tracking-[1.5px] uppercase" style={{ color }}>
        {children}
    </span>
);

/** Small outlined fact pill ("38 screens"). `tone="brand"` fills it. */
export const Pill = ({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "brand" | "mint" | "amber" }) => {
    const styles: Record<string, CSSProperties> = {
        plain: { background: "#fff", color: DOC.ink, boxShadow: `inset 0 0 0 1px ${DOC.line}` },
        brand: { background: DOC.brand, color: "#fff" },
        mint: { background: DOC.mint, color: DOC.brandDeep },
        amber: { background: DOC.amber, color: "#8a5a10" },
    };
    return (
        <span className="inline-flex h-8 items-center rounded-full px-3.5 text-sm font-semibold whitespace-nowrap" style={styles[tone]}>
            {children}
        </span>
    );
};

export const Pills = ({ children }: { children: ReactNode }) => <span className="flex flex-wrap gap-2">{children}</span>;

/** Status chip used in steps, timelines and tables. */
export const Status = ({ children, tone = "next" }: { children: ReactNode; tone?: "now" | "next" | "done" | "open" }) => {
    const s: Record<string, CSSProperties> = {
        now: { background: DOC.ink, color: "#fff" },
        next: { background: "#fff", color: DOC.muted, boxShadow: `inset 0 0 0 1px ${DOC.line}` },
        done: { background: DOC.mint, color: DOC.brandDeep },
        open: { background: DOC.amber, color: "#8a5a10" },
    };
    return (
        <span className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold" style={s[tone]}>
            {children}
        </span>
    );
};

/** Root wrapper for a docs page: Outfit, ink colour, no prose styles. */
export const DocPage = ({ children }: { children: ReactNode }) => (
    <div className="not-prose sb-unstyled" style={{ fontFamily: DOC.font, color: DOC.body }}>
        {children}
    </div>
);

/* ------------------------------------------------------------------- heroes */

export interface HeroProps {
    eyebrow: ReactNode;
    title: ReactNode;
    children?: ReactNode;
    pills?: ReactNode;
    actions?: ReactNode;
    /** Illustration on the right (image URL). */
    art?: string;
    /** Screens overlapping the bottom of the hero. */
    screens?: ReactNode;
    footnote?: ReactNode;
}

/**
 * Big landing hero (Start Here › Overview), laid out like the Buck design system's: a white card,
 * the illustration as a background on the right with a white fade from the left so the copy
 * reads, then the live screens in their own light band, then a one-line caption.
 */
export const Hero = ({ eyebrow, title, children, pills, actions, art, screens, footnote }: HeroProps) => (
    <section className="overflow-hidden rounded-2xl bg-white" style={{ border: "1px solid #dfe3de", margin: "8px 0 32px" }}>
        <div className="relative" style={art ? { backgroundImage: `url(${art})`, backgroundSize: "cover", backgroundPosition: "right center" } : undefined}>
            {art && (
                <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.94) 44%, rgba(255,255,255,0) 70%)" }}
                />
            )}
            <div className="relative flex flex-col gap-4 px-9 pt-10 pb-9" style={{ maxWidth: 540 }}>
                <Eyebrow>{eyebrow}</Eyebrow>
                <h1 className="m-0 font-semibold tracking-[-0.8px]" style={{ fontSize: 38, lineHeight: "44px", color: DOC.ink }}>
                    {title}
                </h1>
                {children && <div className="text-lg" style={{ lineHeight: "28px", color: DOC.body }}>{children}</div>}
                {pills && <Pills>{pills}</Pills>}
                {actions && <div className="flex flex-wrap items-center gap-3 pt-1">{actions}</div>}
            </div>
        </div>
        {screens && (
            <div className="grid grid-cols-1 items-end gap-5 border-t px-7 pt-6 pb-5 sm:grid-cols-3" style={{ borderColor: "#dfe3de", background: "#f6f7f5" }}>
                {screens}
            </div>
        )}
        {footnote && (
            <div className="border-t bg-white px-9 py-3 text-sm" style={{ borderColor: "#dfe3de", color: DOC.muted }}>
                {footnote}
            </div>
        )}
    </section>
);

/** Compact page banner with a green left rule (How to review, review summaries, process). */
export const Banner = ({ eyebrow, title, children, pills, actions }: Omit<HeroProps, "art" | "screens" | "footnote">) => (
    <section className="relative overflow-hidden rounded-2xl bg-white p-7 md:p-8" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}`, borderLeft: `5px solid ${DOC.brand}`, margin: "8px 0 32px" }}>
        <div className="flex flex-col gap-3" style={{ maxWidth: 760 }}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="m-0 font-semibold tracking-[-0.5px]" style={{ fontSize: 30, lineHeight: "36px", color: DOC.ink }}>
                {title}
            </h1>
            {children && <div className="text-md" style={{ lineHeight: "26px" }}>{children}</div>}
            {pills && <Pills>{pills}</Pills>}
            {actions && <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">{actions}</div>}
        </div>
    </section>
);

/* ----------------------------------------------------------------- sections */

/** Section heading with a hairline rule and an optional one-line intro. */
export const Section = ({ title, intro, children, id }: { title: ReactNode; intro?: ReactNode; children?: ReactNode; id?: string }) => (
    <section id={id} style={{ margin: "40px 0 0" }}>
        <h2 className="m-0 border-b pb-3 font-medium" style={{ fontSize: 24, lineHeight: "30px", color: DOC.ink, borderColor: DOC.line }}>
            {title}
        </h2>
        {intro && <p className="m-0 mt-3 text-sm" style={{ color: DOC.body }}>{intro}</p>}
        <div style={{ marginTop: 18 }}>{children}</div>
    </section>
);

/** Responsive card grid (1 → `cols` columns). */
export const Grid = ({ cols = 3, children }: { cols?: 2 | 3 | 4; children: ReactNode }) => (
    <div className={cx("grid grid-cols-1 gap-4", cols === 2 && "sm:grid-cols-2", cols === 3 && "sm:grid-cols-2 lg:grid-cols-3", cols === 4 && "sm:grid-cols-2 lg:grid-cols-4")}>{children}</div>
);

/** A card that points somewhere: eyebrow, title, a few lines, and a link at the bottom. */
export const NavCard = ({ eyebrow, title, children, cta, ...t }: LinkTarget & { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode; cta?: ReactNode }) => (
    <div className="flex h-full flex-col gap-2 rounded-2xl bg-white p-5" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h3 className="m-0 text-lg font-semibold" style={{ color: DOC.ink }}>
            {title}
        </h3>
        {children && <div className="text-sm" style={{ lineHeight: "22px" }}>{children}</div>}
        {cta && (t.to || t.href) && (
            <div className="mt-auto pt-3">
                <DocLink {...t}>{cta}</DocLink>
            </div>
        )}
    </div>
);

/* ------------------------------------------------------------------ screens */

/** A screenshot in a flat browser or phone frame. */
/** Bordered browser window, fully rounded, screenshot cropped to 16:10 from the top. */
const BrowserWindow = ({ src, alt }: { src: string; alt: string }) => (
    <div className="w-full overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #dfe3de", boxShadow: "0 1px 2px rgba(20,33,26,0.06), 0 8px 20px rgba(20,33,26,0.08)" }}>
        <div className="flex h-6 items-center gap-1.5 px-2.5" style={{ background: "#f3f4f2", borderBottom: "1px solid #e6e9e5" }}>
            {[0, 1, 2].map((i) => (
                <span key={i} className="size-2 rounded-full" style={{ background: "#d5d9d3" }} />
            ))}
        </div>
        <div style={{ aspectRatio: "16 / 10", overflow: "hidden" }}>
            <img src={src} alt={alt} className="block w-full" style={{ margin: 0 }} />
        </div>
    </div>
);

export const ScreenThumb = ({ src, frame = "browser", alt = "", badge, plain = false }: { src: string; frame?: "browser" | "phone"; alt?: string; badge?: ReactNode; plain?: boolean }) => (
    <div
        className="relative flex items-start justify-center overflow-hidden rounded-xl"
        style={
            plain
                ? frame === "phone"
                    ? { height: 196 }
                    : undefined
                : { background: DOC.creamDeep, border: `1px solid ${DOC.line}`, padding: frame === "phone" ? "14px 0 0" : "12px 12px 0", height: 190 }
        }
    >
        {frame === "browser" ? (
            plain ? (
                <BrowserWindow src={src} alt={alt} />
            ) : (
                <div className="w-full overflow-hidden rounded-t-lg bg-white" style={{ border: "1px solid #dfe3de", borderBottom: "none", boxShadow: "0 6px 18px rgba(20,33,26,0.10)" }}>
                    <div className="flex h-5 items-center gap-1 px-2" style={{ background: "#f3f4f2", borderBottom: "1px solid #e6e9e5" }}>
                        {[0, 1, 2].map((i) => (
                            <span key={i} className="size-1.5 rounded-full" style={{ background: "#d5d9d3" }} />
                        ))}
                    </div>
                    <img src={src} alt={alt} className="block w-full" style={{ margin: 0 }} />
                </div>
            )
        ) : (
            <div className="overflow-hidden rounded-t-[22px] bg-white" style={{ width: 118, padding: "5px 5px 0", background: "#1b1f1d", boxShadow: "0 6px 18px rgba(20,33,26,0.2)" }}>
                <img src={src} alt={alt} className="block w-full rounded-t-[18px]" style={{ margin: 0 }} />
            </div>
        )}
        {badge && (
            <span className="absolute top-2.5 right-2.5 inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold text-white" style={{ background: DOC.brand }}>
                {badge}
            </span>
        )}
    </div>
);

export interface ScreenCardProps {
    src: string;
    frame?: "browser" | "phone";
    badge?: ReactNode;
    eyebrow?: ReactNode;
    title: ReactNode;
    children?: ReactNode;
    /** "Look at:" line — what a reviewer should judge on this screen. */
    lookAt?: ReactNode;
    links?: (LinkTarget & { label: ReactNode })[];
}

/** Screenshot card: thumb, eyebrow, title, description, "Look at:", links. */
export const ScreenCard = ({ src, frame, badge, eyebrow, title, children, lookAt, links }: ScreenCardProps) => (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        <ScreenThumb src={src} frame={frame} badge={badge} />
        <div className="flex flex-1 flex-col gap-2 px-2 pt-4 pb-2">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h3 className="m-0 text-lg font-semibold" style={{ color: DOC.ink, lineHeight: "24px" }}>
                {title}
            </h3>
            {children && <div className="text-sm" style={{ lineHeight: "22px" }}>{children}</div>}
            {lookAt && (
                <div className="text-sm" style={{ lineHeight: "22px" }}>
                    <strong style={{ color: DOC.ink }}>Look at:</strong> {lookAt}
                </div>
            )}
            {links && links.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3">
                    {links.map(({ label, ...t }, i) => (
                        <DocLink key={i} {...t}>
                            {label}
                        </DocLink>
                    ))}
                </div>
            )}
        </div>
    </div>
);

/** Hero-strip screenshot with a caption underneath (for `Hero.screens`). */
export const HeroScreen = ({ src, label, frame = "browser", ...t }: LinkTarget & { src: string; label: ReactNode; frame?: "browser" | "phone" }) => {
    const body = (
        <span className="flex flex-col items-center gap-2.5">
            <ScreenThumb src={src} frame={frame} plain />
            <span className="text-sm font-semibold" style={{ color: DOC.body }}>
                {label}
            </span>
        </span>
    );
    return t.to || t.href ? (
        <a {...linkProps(t)} style={{ textDecoration: "none" }}>
            {body}
        </a>
    ) : (
        body
    );
};

/* ----------------------------------------------------------- process / time */

export interface Step {
    label: ReactNode;
    status: "now" | "next" | "done";
    title: ReactNode;
    body?: ReactNode;
    owner?: ReactNode;
}

/** Numbered process steps in a row; the current one is tinted. */
export const Steps = ({ steps }: { steps: Step[] }) => (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        {steps.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 p-5" style={{ background: s.status === "now" ? DOC.mint : "#fff", borderLeft: i ? `1px solid ${DOC.line}` : undefined }}>
                <span className="flex items-center gap-2">
                    <Eyebrow color={s.status === "now" ? DOC.brand : DOC.muted}>{s.label}</Eyebrow>
                    <Status tone={s.status}>{s.status === "now" ? "Now" : s.status === "done" ? "Done" : "Next"}</Status>
                </span>
                <h3 className="m-0 text-lg font-semibold" style={{ color: DOC.ink }}>
                    {s.title}
                </h3>
                {s.body && <div className="text-sm" style={{ lineHeight: "22px" }}>{s.body}</div>}
                {s.owner && <div className="mt-auto pt-1 text-sm" style={{ color: DOC.muted }}>{s.owner}</div>}
            </div>
        ))}
    </div>
);

export interface Milestone {
    date: ReactNode;
    status: "done" | "now" | "next";
    title: ReactNode;
    body?: ReactNode;
    img?: string;
    frame?: "browser" | "phone";
    link?: LinkTarget & { label: ReactNode };
}

/** Vertical milestone timeline with optional screenshot per item. */
export const Timeline = ({ items }: { items: Milestone[] }) => (
    <ol className="relative m-0 flex list-none flex-col gap-3 p-0 pl-10">
        <span aria-hidden="true" className="absolute top-3 bottom-3 left-[15px] w-0.5" style={{ background: `linear-gradient(${DOC.brand}, ${DOC.line})` }} />
        {items.map((m, i) => (
            <li key={i} className="relative">
                <span
                    aria-hidden="true"
                    className="absolute top-5 -left-[33px] size-5 rounded-full"
                    style={{ background: m.status === "next" ? "#fff" : DOC.brand, boxShadow: m.status === "next" ? `inset 0 0 0 2px ${DOC.muted}` : m.status === "now" ? `0 0 0 4px ${DOC.mint}` : undefined }}
                />
                <div className="flex items-center gap-5 rounded-2xl p-5" style={{ background: m.status === "now" ? DOC.mint : "#fff", boxShadow: `inset 0 0 0 1px ${m.status === "now" ? "#bfdcc9" : DOC.line}` }}>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex items-center gap-2">
                            <Eyebrow color={DOC.brandDeep}>{m.date}</Eyebrow>
                            <Status tone={m.status}>{m.status === "now" ? "Now" : m.status === "done" ? "Done" : "Next"}</Status>
                        </span>
                        <h3 className="m-0 text-md font-semibold" style={{ color: DOC.ink }}>
                            {m.title}
                        </h3>
                        {m.body && <div className="text-sm" style={{ lineHeight: "22px" }}>{m.body}</div>}
                        {m.link && (
                            <div className="pt-1">
                                <DocLink {...m.link}>{m.link.label}</DocLink>
                            </div>
                        )}
                    </div>
                    {m.img && (
                        <div className="hidden w-[180px] shrink-0 md:block">
                            <ScreenThumb src={m.img} frame={m.frame} />
                        </div>
                    )}
                </div>
            </li>
        ))}
    </ol>
);

/* ------------------------------------------------------- notes and tables */

/** Tinted note. `mint` = context, `brand` = emphasis, `amber` = caution. */
export const Callout = ({ children, tone = "mint", title }: { children: ReactNode; tone?: "mint" | "brand" | "amber"; title?: ReactNode }) => {
    const t = {
        mint: { bg: DOC.mint, rule: DOC.brand },
        brand: { bg: "#e3efe7", rule: DOC.brandDeep },
        amber: { bg: DOC.amber, rule: "#d6a046" },
    }[tone];
    return (
        <div className="rounded-xl p-5 text-sm" style={{ background: t.bg, borderLeft: `4px solid ${t.rule}`, lineHeight: "22px", margin: "20px 0" }}>
            {title && <strong style={{ color: DOC.ink }}>{title} </strong>}
            {children}
        </div>
    );
};

/** A quote with attribution. */
export const Quote = ({ children, cite }: { children: ReactNode; cite?: ReactNode }) => (
    <blockquote className="m-0 my-5 py-1 pl-4 text-md italic" style={{ borderLeft: `3px solid ${DOC.line}`, color: DOC.body }}>
        {children}
        {cite && <div className="mt-1.5 text-sm not-italic" style={{ color: DOC.muted }}>{cite}</div>}
    </blockquote>
);

/** Plain data table (decisions, left open, screen index). Rows are arrays of cells. */
export const DocTable = ({ columns, rows, widths }: { columns: ReactNode[]; rows: ReactNode[][]; widths?: (string | number)[] }) => (
    <div className="overflow-x-auto rounded-xl" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        <table className="w-full border-collapse text-left text-sm" style={{ margin: 0 }}>
            <thead>
                <tr style={{ background: DOC.cream }}>
                    {columns.map((c, i) => (
                        <th key={i} className="px-4 py-3 font-semibold" style={{ color: DOC.ink, width: widths?.[i], borderBottom: `1px solid ${DOC.line}`, border: "none" }}>
                            {c}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 ? "#fbfaf7" : "#fff" }}>
                        {r.map((cell, j) => (
                            <td key={j} className="px-4 py-3 align-top" style={{ lineHeight: "21px", border: "none", borderTop: `1px solid ${DOC.line}`, color: j === 0 ? DOC.ink : DOC.body }}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

/** Open-decision card: what's built vs. the alternative. */
export const Choice = ({ title, built, alternative, ...t }: LinkTarget & { title: ReactNode; built: ReactNode; alternative: ReactNode }) => (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        <h3 className="m-0 text-md font-semibold" style={{ color: DOC.ink }}>
            {title}
        </h3>
        <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-sm" style={{ background: DOC.mint }}>
                <Eyebrow color={DOC.brandDeep}>Built as</Eyebrow>
                <div className="mt-1" style={{ color: DOC.ink }}>{built}</div>
            </div>
            <div className="rounded-xl p-3 text-sm" style={{ background: DOC.cream }}>
                <Eyebrow color={DOC.muted}>Or</Eyebrow>
                <div className="mt-1">{alternative}</div>
            </div>
        </div>
        {(t.to || t.href) && (
            <div className="mt-auto">
                <DocLink {...t}>See it</DocLink>
            </div>
        )}
    </div>
);
