/**
 * Small extras for the Start Here pages that the shared docs kit doesn't have: a style-guide rule
 * card with a large screenshot, colour swatches, a plain numbered row (set-up steps) and a
 * sub-heading. Same visual language as `docs-kit.tsx` (cream cards, Crane-green eyebrows, Outfit).
 */
import type { ReactNode } from "react";
import { cx } from "@/utils/cx";
import { DOC, DocLink, Eyebrow, type LinkTarget } from "../docs-kit/docs-kit";

/** A larger screenshot than `ScreenThumb`: browser or phone frame, cropped to `height`. */
export const BigThumb = ({ src, frame = "browser", alt = "", height = 300 }: { src: string; frame?: "browser" | "phone"; alt?: string; height?: number }) => (
    <div className="flex items-start justify-center overflow-hidden rounded-xl" style={{ background: DOC.creamDeep, padding: frame === "phone" ? "18px 0 0" : "16px 16px 0", height }}>
        {frame === "browser" ? (
            <div className="w-full overflow-hidden rounded-t-lg bg-white" style={{ boxShadow: "0 6px 18px rgba(20,33,26,0.14)" }}>
                <div className="flex h-5 items-center gap-1 px-2" style={{ background: "#efefed" }}>
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                        <span key={c} className="size-1.5 rounded-full" style={{ background: c }} />
                    ))}
                </div>
                <img src={src} alt={alt} className="block w-full" style={{ margin: 0 }} />
            </div>
        ) : (
            <div className="overflow-hidden rounded-t-[26px]" style={{ width: 172, padding: "6px 6px 0", background: "#1b1f1d", boxShadow: "0 6px 18px rgba(20,33,26,0.2)" }}>
                <img src={src} alt={alt} className="block w-full rounded-t-[21px]" style={{ margin: 0 }} />
            </div>
        )}
    </div>
);

export interface RuleProps {
    /** Rule number, shown in a dark circle. Omit for a follow-on card. */
    n?: number;
    eyebrow: ReactNode;
    title: ReactNode;
    /** Bullets or paragraphs. */
    children?: ReactNode;
    /** Small muted line under the body ("Settled on …"). */
    note?: ReactNode;
    links?: (LinkTarget & { label: ReactNode })[];
    img?: string;
    frame?: "browser" | "phone";
    caption?: ReactNode;
    /** Put the screenshot on the left. */
    flip?: boolean;
}

/** Style-guide rule: copy on one side, a real screen that follows it on the other. */
export const Rule = ({ n, eyebrow, title, children, note, links, img, frame = "browser", caption, flip }: RuleProps) => (
    <div className="mb-4 grid grid-cols-1 items-center gap-6 rounded-2xl bg-white p-6 md:grid-cols-2" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        <div className={cx("flex flex-col gap-3", flip && "md:order-2")}>
            <span className="flex items-center gap-2.5">
                {n !== undefined && (
                    <span className="inline-flex size-7 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: DOC.ink }}>
                        {n}
                    </span>
                )}
                <Eyebrow>{eyebrow}</Eyebrow>
            </span>
            <h3 className="m-0 text-xl font-semibold" style={{ color: DOC.ink, lineHeight: "28px" }}>
                {title}
            </h3>
            {children && <div className="text-sm" style={{ lineHeight: "22px" }}>{children}</div>}
            {note && <div className="text-sm" style={{ color: DOC.muted }}>{note}</div>}
            {links && links.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {links.map(({ label, ...t }, i) => (
                        <DocLink key={i} {...t}>
                            {label}
                        </DocLink>
                    ))}
                </div>
            )}
        </div>
        {img && (
            <figure className={cx("m-0 flex flex-col gap-2", flip && "md:order-1")}>
                <BigThumb src={img} frame={frame} />
                {caption && (
                    <figcaption className="text-center text-sm" style={{ color: DOC.muted }}>
                        {caption}
                    </figcaption>
                )}
            </figure>
        )}
    </div>
);

/** Bullet list with green dots and a bold lead-in per item. */
export const Bullets = ({ items }: { items: [lead: ReactNode, rest: ReactNode][] }) => (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map(([lead, rest], i) => (
            <li key={i} className="relative pl-4">
                <span aria-hidden="true" className="absolute top-[8px] left-0 size-1.5 rounded-full" style={{ background: DOC.brand }} />
                <strong style={{ color: DOC.ink }}>{lead}</strong> {rest}
            </li>
        ))}
    </ul>
);

/** A colour chip with its name, value and use. */
export const Swatch = ({ color, name, value, use, ring }: { color: string; name: ReactNode; value: ReactNode; use: ReactNode; ring?: boolean }) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        <span className="size-11 shrink-0 rounded-xl" style={{ background: color, boxShadow: ring ? `inset 0 0 0 1px ${DOC.line}` : undefined }} />
        <span className="flex min-w-0 flex-col text-sm" style={{ lineHeight: "20px" }}>
            <span>
                <strong style={{ color: DOC.ink }}>{name}</strong> <span style={{ color: DOC.muted }}>· {value}</span>
            </span>
            <span>{use}</span>
        </span>
    </div>
);

/** Numbered cells in one bordered row (set-up steps). */
export const NumberedRow = ({ items }: { items: { title: ReactNode; body: ReactNode }[] }) => (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl sm:grid-cols-3" style={{ boxShadow: `inset 0 0 0 1px ${DOC.line}` }}>
        {items.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 bg-white p-5" style={{ borderLeft: i ? `1px solid ${DOC.line}` : undefined }}>
                <Eyebrow color={DOC.muted}>{i + 1}</Eyebrow>
                <h3 className="m-0 text-lg font-semibold" style={{ color: DOC.ink }}>
                    {s.title}
                </h3>
                <div className="text-sm" style={{ lineHeight: "22px" }}>{s.body}</div>
            </div>
        ))}
    </div>
);

/** A small heading inside a Section, to split its cards into groups. */
export const SubHead = ({ children }: { children: ReactNode }) => (
    <h3 className="m-0 mt-6 mb-3 text-md font-semibold first:mt-0" style={{ color: DOC.ink }}>
        {children}
    </h3>
);

/** Inline code chip that survives the docs page's reset. */
export const Code = ({ children }: { children: ReactNode }) => (
    <code className="rounded-md px-1.5 py-0.5 text-[13px]" style={{ background: DOC.creamDeep, color: DOC.ink, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
        {children}
    </code>
);

/** Plain paragraph with docs spacing. */
export const P = ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={cx("m-0 mt-3 text-sm", className)} style={{ lineHeight: "22px", color: DOC.body }}>
        {children}
    </p>
);
