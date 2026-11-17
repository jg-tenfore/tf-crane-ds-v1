import { CreditCard01, RefreshCcw01, Ticket02, Wallet02 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

/**
 * Ported from Fox Prototype 3 (`mcg-3/instruction/credits-explainer.tsx`). MCG's feedback: credits
 * paying for a booking was good, but "I don't feel like it's easy to figure that out as a
 * customer". So buy → wallet → redeem is spelled out wherever a pack is offered.
 */
const STEPS = [
    { icon: CreditCard01, title: "Buy a pack", detail: "5 or 10 lessons with one instructor, paid for up front at a lower rate per lesson." },
    { icon: Wallet02, title: "Credits land in your wallet", detail: "Straight away, under My lesson credits. Nothing to print or remember." },
    { icon: RefreshCcw01, title: "Spend one when you book", detail: "Pick “Use a lesson credit” at checkout and the lesson costs nothing further." },
];

/**
 * CreditsExplainer — "How lesson credits work" in three numbered steps. `compact` stacks the
 * steps (sidebars, the instructor profile); the default lays them out in a row from tablet up.
 */
export const CreditsExplainer = ({ compact, className }: { compact?: boolean; className?: string }) => (
    <section aria-label="How lesson credits work" className={cx("flex flex-col gap-4 rounded-xl bg-secondary p-5 ring-1 ring-secondary ring-inset", className)}>
        <h3 className="flex items-center gap-2 text-md font-semibold text-primary">
            <Ticket02 className="size-5 text-fg-brand-primary" aria-hidden="true" />
            How lesson credits work
        </h3>
        <ol className={cx("grid grid-cols-1 gap-4", !compact && "@tablet:grid-cols-3")}>
            {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-solid text-xs font-semibold text-white tabular-nums">{i + 1}</span>
                    <span className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-primary">{step.title}</span>
                        <span className="text-sm text-tertiary">{step.detail}</span>
                    </span>
                </li>
            ))}
        </ol>
        <p className="text-xs text-tertiary">Packs are bought on their own, before a booking — they aren&rsquo;t part of paying for a lesson.</p>
    </section>
);
