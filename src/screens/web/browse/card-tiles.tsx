import { ArrowRight, Award01, Calendar } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { WebLink } from "@/components/web/web-router";
import type { Course } from "@/data/crane";
import type { ClubOffering } from "@/data/shop";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { money, StarRating } from "./shop-ui";

/**
 * Club Offerings tiles — ported from Fox's card-tiles.tsx (GiftCardTile / PunchCardTile, which
 * used Untitled UI's CreditCard + the wallet punch visual). Crane has neither, so the card
 * faces are composed here from tokens.
 */

/* ------------------------------ Card faces ------------------------------ */

export type GiftDesign = "classic" | "midnight" | "fairway" | "sunset";
export const GIFT_DESIGNS: { key: GiftDesign; label: string; className: string }[] = [
    { key: "classic", label: "Classic", className: "bg-brand-solid" },
    { key: "midnight", label: "Midnight", className: "bg-primary-solid" },
    { key: "fairway", label: "Fairway", className: "bg-brand-section" },
    { key: "sunset", label: "Sunset", className: "bg-warning-solid" },
];

/** Gift card face — course logo, "Gift Card", amount, recipient. Scales with `width`. */
export const GiftCardFace = ({ course, design = "classic", amount, to, width = 300, className }: { course: Course; design?: GiftDesign; amount: string; to?: string; width?: number; className?: string }) => {
    const d = GIFT_DESIGNS.find((x) => x.key === design)!;
    const k = width / 300;
    return (
        <div
            className={cx("relative isolate shrink-0 overflow-hidden text-white shadow-[0_12px_28px_rgba(0,0,0,0.18)]", d.className, className)}
            style={{ width, height: width * 0.63, borderRadius: 14 * k, padding: 18 * k }}
            aria-hidden="true"
        >
            {/* Soft rings — decorative */}
            <span className="absolute -z-10 rounded-full border-white/15" style={{ width: 220 * k, height: 220 * k, right: -70 * k, top: -90 * k, borderWidth: 26 * k, borderStyle: "solid" }} />
            <span className="absolute -z-10 rounded-full bg-white/8" style={{ width: 120 * k, height: 120 * k, right: 40 * k, bottom: -70 * k }} />
            <div className="flex h-full flex-col justify-between">
                <div className="flex items-center gap-2" style={{ gap: 8 * k }}>
                    <span className="overflow-hidden rounded-full bg-white" style={{ width: 28 * k, height: 28 * k }}>
                        <CourseLogo course={course} size={28 * k} shape="circle" />
                    </span>
                    <span className="truncate font-semibold" style={{ fontSize: 12 * k, letterSpacing: 1.5 * k, textTransform: "uppercase" }}>
                        {course.shortName ?? course.name}
                    </span>
                </div>
                <div>
                    <div className="font-semibold opacity-80" style={{ fontSize: 11 * k, letterSpacing: 2 * k, textTransform: "uppercase" }}>
                        {to ? `Gift card · To ${to}` : "Gift card"}
                    </div>
                    <div className="font-semibold tabular-nums" style={{ fontSize: 28 * k, lineHeight: 1.15 }}>
                        {amount}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Punch card face — N circles, `used` filled. */
export const PunchCardFace = ({ rounds, used = 0, title, className }: { rounds: number; used?: number; title?: string; className?: string }) => (
    <div className={cx("w-full rounded-xl bg-primary p-4 ring-1 ring-secondary ring-inset", className)}>
        <div className="flex items-center justify-between gap-3">
            <p className="caps text-brand-secondary">Punch card</p>
            {title && <p className="truncate text-xs font-medium text-tertiary">{title}</p>}
        </div>
        <div className={cx("mt-3 grid gap-1.5", rounds >= 10 ? "grid-cols-10" : "grid-cols-5")}>
            {Array.from({ length: rounds }).map((_, i) => (
                <span key={i} className={cx("aspect-square rounded-full", i < used ? "bg-brand-solid" : "bg-secondary ring-1 ring-secondary ring-inset")} />
            ))}
        </div>
    </div>
);

/* ------------------------------ Shop-all tiles (Fox anatomy) ------------------------------ */

export const GiftCardTile = ({ course, href = "/shop/gift-cards" }: { course: Course; href?: string }) => (
    <WebLink href={href} className="group flex flex-col text-left outline-none">
        <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset transition duration-100 ease-linear group-hover:ring-brand group-focus-visible:ring-4 group-focus-visible:ring-brand-300/60">
            <GiftCardFace course={course} amount="$25 – $500" width={190} />
        </span>
        <span className="mt-3 text-sm font-medium text-primary">Digital Gift Card</span>
        <StarRating rating={4.9} count={128} className="mt-1.5" />
        <span className="mt-1.5 text-sm font-semibold text-primary tabular-nums">From {money(25)}</span>
    </WebLink>
);

export const PunchCardTile = ({ href = "/shop/punch-cards", rounds = 20, from }: { href?: string; rounds?: number; from: number }) => (
    <WebLink href={href} className="group flex flex-col text-left outline-none">
        <span className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-secondary p-6 ring-1 ring-secondary ring-inset transition duration-100 ease-linear group-hover:ring-brand">
            <PunchCardFace rounds={10} used={3} className="max-w-[220px]" />
        </span>
        <span className="mt-3 text-sm font-medium text-primary">{rounds}-Round Punch Card</span>
        <StarRating rating={4.8} count={64} className="mt-1.5" />
        <span className="mt-1.5 text-sm font-semibold text-primary tabular-nums">From {money(from)}</span>
    </WebLink>
);

/* ------------------------------ Club Offerings card (CraneWeb) ------------------------------ */

const cta = "caps inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 transition duration-100 ease-linear outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/** Where each offering's CTA goes. Memberships are outside the shop flow. */
export const offeringHref = (o: ClubOffering) => (o.kind === "gift-card" ? "/shop/gift-cards" : o.kind === "punch-card" ? "/shop/punch-cards" : `/memberships/${o.id}`);

/**
 * One Club Offerings card, like live CraneWeb: art, caps eyebrow, title, price, and a caps CTA —
 * solid "PURCHASE →" for gift & punch cards, outline "JOIN →" for memberships.
 */
export const OfferingCard = ({ offering, course, className }: { offering: ClubOffering; course: Course; className?: string }) => {
    const solid = offering.kind !== "membership";
    return (
        <article className={cx("flex flex-col overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset", className)}>
            <div className="flex h-40 items-center justify-center bg-secondary px-6">
                {offering.kind === "gift-card" && <GiftCardFace course={course} amount="$25 – $500" width={200} />}
                {offering.kind === "punch-card" && <PunchCardFace rounds={20} used={0} className="max-w-[240px]" />}
                {offering.kind === "membership" && (
                    <span className="flex size-16 items-center justify-center rounded-full bg-primary text-fg-brand-primary ring-1 ring-secondary ring-inset">
                        {offering.title.toLowerCase().includes("monthly") ? <Calendar className="size-7" aria-hidden="true" /> : <Award01 className="size-7" aria-hidden="true" />}
                    </span>
                )}
            </div>
            <div className="flex flex-1 flex-col p-5">
                <p className="caps text-brand-secondary">{offering.eyebrow}</p>
                <h3 className="mt-2 text-lg font-semibold text-primary">{offering.title}</h3>
                {offering.description && <p className="mt-1 text-sm text-tertiary">{offering.description}</p>}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <span className="text-md font-semibold whitespace-nowrap text-primary tabular-nums">{offering.priceLabel}</span>
                    <WebLink
                        href={offeringHref(offering)}
                        aria-label={`${offering.cta} ${offering.title}`}
                        className={cx(cta, solid ? "bg-brand-solid text-white hover:bg-brand-solid_hover" : "bg-primary text-brand-secondary ring-1 ring-brand ring-inset hover:bg-brand-primary_alt")}
                    >
                        {offering.cta}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                    </WebLink>
                </div>
            </div>
        </article>
    );
};
