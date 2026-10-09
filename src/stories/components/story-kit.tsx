/**
 * Small layout helpers shared by the Components stories (not a component of the
 * design system — never import this from src/components or screens).
 */
import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "@/utils/cx";
import { TeeTimeCard } from "@/components/lists/tee-time-card";
import { courseById, teeSheet } from "@/data/crane";

/** Grouped-gray canvas for non-phone stories. */
export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("rounded-3xl bg-secondary p-6", className)}>{children}</div>
);

/** Small caption above or beside a specimen. */
export const Caption = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={cx("text-ios-footnote text-tertiary", className)}>{children}</div>
);

/** A specimen with its caption above it. */
export const Specimen = ({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) => (
    <div className={cx("flex flex-col items-start gap-2", className)}>
        <Caption>{label}</Caption>
        {children}
    </div>
);

/** Section heading inside a Panel. */
export const PanelHeading = ({ children }: { children: ReactNode }) => <h3 className="mb-3 text-ios-headline text-primary">{children}</h3>;

/**
 * Stand-in for a course photograph (no photography ships with the repo). Sky,
 * tree line, fairway and a flag — enough colour and contrast to show Liquid Glass blur.
 * Raw colours are deliberate: this is an illustration, not UI chrome.
 */
export const CoursePhoto = ({ className, children }: { className?: string; children?: ReactNode }) => (
    <div
        className={cx("relative overflow-hidden", className)}
        style={{ background: "linear-gradient(180deg, #5fa8e0 0%, #a9d6f2 42%, #cfe9d0 52%, #6fae4f 53%, #3d8a35 74%, #2a6a2b 100%)" }}
    >
        <div
            aria-hidden="true"
            className="absolute top-[14%] right-[12%] size-24 rounded-full"
            style={{ background: "radial-gradient(circle, #fffbe6 0%, #ffe48a 45%, rgba(255,228,138,0) 70%)" }}
        />
        <div aria-hidden="true" className="absolute top-[22%] left-[8%] h-6 w-28 rounded-full bg-white/80 blur-[2px]" />
        <div aria-hidden="true" className="absolute top-[30%] left-[30%] h-4 w-20 rounded-full bg-white/70 blur-[2px]" />
        {/* tree line */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[44%] h-[12%]">
            {Array.from({ length: 14 }, (_, i) => (
                <span
                    key={i}
                    className="absolute bottom-0 rounded-t-full"
                    style={{ left: `${i * 7.5 - 2}%`, width: `${9 + (i % 3) * 3}%`, height: `${70 + ((i * 37) % 30)}%`, background: i % 2 ? "#2f6f35" : "#255c2b" }}
                />
            ))}
        </div>
        {/* green + flag */}
        <div aria-hidden="true" className="absolute top-[64%] left-[48%] h-[12%] w-[44%] rounded-[50%] bg-[#7cc35e]" />
        <div aria-hidden="true" className="absolute top-[52%] left-[68%] h-[17%] w-[2px] bg-white" />
        <div aria-hidden="true" className="absolute top-[52%] left-[68%] h-[5%] w-[9%] bg-[#e5484d]" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
        {children}
    </div>
);

/**
 * Tee-sheet cards as screen filler. With `scrollBy`, the parent scroll container
 * (Screen's content area) starts scrolled so content sits under the floating nav —
 * that's what makes the glass blur visible in a static screenshot.
 */
export const ScreenFiller = ({ scrollBy = 0, count = 16, className }: { scrollBy?: number; count?: number; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const scroller = ref.current?.parentElement;
        if (scroller && scrollBy) scroller.scrollTop = scrollBy;
    }, [scrollBy]);
    const sheet = teeSheet(courseById("sagamore-hampton"));
    return (
        <div ref={ref} className={cx("space-y-3 px-gutter pt-3", className)}>
            {Array.from({ length: count }, (_, i) => (
                <TeeTimeCard key={i} teeTime={sheet[i % sheet.length]} />
            ))}
        </div>
    );
};
