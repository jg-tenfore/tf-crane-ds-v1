import type { ReactNode } from "react";
import { Gift01 } from "@untitledui/icons";
import { StatusBadge } from "@/components/base/badge";
import { GiftArtThumb } from "@/components/gift-cards/gift-art-card";
import { KeyValueRow } from "@/components/lists/list";
import { formatDate } from "@/data/crane";
import { money } from "@/data/gift-cards";
import { cx } from "@/utils/cx";
import type { WalletSentGift } from "./gift-cards-store";

/** Green "New" pill on a card or gift bought this session. */
export const NewPill = ({ className }: { className?: string }) => (
    <span className={cx("inline-flex h-[20px] shrink-0 items-center rounded-full bg-success-solid px-2 text-ios-caption1 font-semibold text-white", className)}>New</span>
);

/** Small uppercase caption over a group ("DEALS", "SEND TO"), like ListGroup's header. */
export const GroupLabel = ({ children, id, className }: { children: ReactNode; id?: string; className?: string }) => (
    <div id={id} className={cx("px-1 text-ios-footnote font-medium tracking-[0.02em] text-tertiary uppercase", className)}>
        {children}
    </div>
);

/** A numbered step title: "① Choose an amount". */
export const StepHeading = ({ n, children }: { n: number; children: ReactNode }) => (
    <h2 className="flex items-center gap-2.5 text-ios-title3 text-primary">
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-brand-solid text-ios-subheadline font-bold text-white tabular-nums" aria-hidden="true">
            {n}
        </span>
        <span className="sr-only">Step {n}: </span>
        {children}
    </h2>
);

/** The radio circle used by every option tile in the buy flow (matches RadioCardGroup). */
export const RadioDot = () => (
    <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
        <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
    </span>
);

/** Art thumbnail, or the gift icon for cards without a design. */
export const GiftThumb = ({ designId, className }: { designId?: string; className?: string }) =>
    designId ? (
        <GiftArtThumb designId={designId} className={cx("w-16 self-start rounded-lg", className)} />
    ) : (
        <span className={cx("flex aspect-[3/2] w-16 shrink-0 items-center justify-center self-start rounded-lg bg-brand-primary_alt text-fg-brand-primary", className)}>
            <Gift01 className="size-6" aria-hidden="true" />
        </span>
    );

/** One row under Sent as gifts: thumb, name · email, date, card value, what was paid and a status. */
export const SentGiftItem = ({ gift }: { gift: WalletSentGift }) => {
    const bonus = gift.value - gift.paid;
    const print = gift.delivery === "print";
    return (
        <article className="flex gap-3 rounded-ios-card bg-primary p-4 shadow-ios-card ring-1 ring-secondary/60">
            <GiftThumb designId={gift.designId} className="mt-0.5" />
            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-ios-subheadline text-tertiary">
                        <span className="text-ios-headline text-primary">{gift.toName}</span>
                        {!print && ` · ${gift.toEmail}`}
                    </p>
                    <StatusBadge tone={print ? "warning" : "success"}>{print ? "Ready to print" : "Sent"}</StatusBadge>
                </div>
                <p className="flex items-center gap-2 text-ios-footnote text-tertiary">
                    {formatDate(gift.date)}
                    {gift.isNew && <NewPill />}
                </p>
                <p className="mt-1.5 text-ios-headline text-primary tabular-nums">{money(gift.value)} card</p>
                <p className="text-ios-footnote text-tertiary tabular-nums">
                    Paid {money(gift.paid)}
                    {bonus > 0 && <span className="text-success-primary"> · +{money(bonus)} bonus</span>}
                </p>
            </div>
        </article>
    );
};

/** Card value, Deal bonus (green, only with a bonus), Delivery Free and the total. */
export const GiftTotals = ({ value, price, totalLabel = "Total", className }: { value: number; price: number; totalLabel?: string; className?: string }) => (
    <div className={className}>
        <KeyValueRow label="Card value" value={value > 0 ? money(value) : "—"} className="py-1.5" />
        {value > price && <KeyValueRow label="Deal bonus" value={<span className="text-success-primary">+{money(value - price)}</span>} className="py-1.5" />}
        <KeyValueRow label="Delivery" value="Free" className="py-1.5" />
        <div className="mt-1.5 border-t border-secondary pt-1.5">
            <KeyValueRow label={totalLabel} value={price > 0 ? money(price) : "—"} tone="emphasis" className="py-1.5" />
        </div>
    </div>
);
