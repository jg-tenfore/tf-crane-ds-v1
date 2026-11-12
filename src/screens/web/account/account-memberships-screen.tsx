import { useState } from "react";
import { ArrowRight, Award05, CheckCircle, RefreshCcw01, XClose } from "@untitledui/icons";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter } from "@/components/web/web-router";
import { MEMBERSHIPS, formatDate, walletStatus, type Membership } from "@/data/crane";
import { useWebSession } from "@/screens/web/web-shell";
import { ANNUAL_PLANS, OTHER_PLANS, type MembershipPlan } from "./account-data";
import { AccountLayout } from "./account-layout";
import { AccountTitle, ChoicePills, Pill, WebButton } from "./account-ui";
import { MembershipTile } from "./account-wallet-items";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
type Variant = "individual" | "family";

/** Fox membership ad banner (dismissible), brand tone. */
const UpsellBanner = ({ onSee }: { onSee: () => void }) => {
    const [show, setShow] = useState(true);
    if (!show) return null;
    return (
        <div className="flex items-center gap-3 rounded-xl bg-brand-section px-4 py-3 text-white @tablet:px-5">
            <span className="hidden size-9 shrink-0 items-center justify-center rounded-lg bg-white/15 @tablet:flex">
                <Award05 className="size-5" aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-sm text-white/85">
                <span className="font-semibold text-white">Play unlimited golf.</span> Upgrade to an Annual membership and skip the green fees.
            </p>
            <button
                type="button"
                onClick={onSee}
                className="caps hidden h-9 shrink-0 cursor-pointer items-center rounded-full bg-white px-4 text-brand-secondary outline-none focus-visible:ring-4 focus-visible:ring-white/40 @tablet:flex"
            >
                See plans
            </button>
            <button type="button" onClick={() => setShow(false)} aria-label="Dismiss" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-white/80 outline-none hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white/40">
                <XClose className="size-5" aria-hidden="true" />
            </button>
        </div>
    );
};

const RenewNotice = ({ m, expired, onRenew }: { m: Membership; expired?: boolean; onRenew: () => void }) => (
    <div role="note" className="flex flex-col gap-4 rounded-xl bg-warning-primary p-5 @tablet:flex-row @tablet:items-center">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-secondary">
            <RefreshCcw01 className="size-5 text-fg-warning-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
            <p className="text-md font-semibold text-primary">{expired ? `Your ${m.name} has ended` : `Your ${m.name} ends ${formatDate(m.expires)}`}</p>
            <p className="text-sm text-tertiary">{expired ? `It ended ${formatDate(m.expires)}. Renew to restore member rates and booking.` : "Renew now to keep your member rates and booking window."}</p>
        </div>
        <WebButton onPress={onRenew}>Renew</WebButton>
    </div>
);

const PlanDialog = ({
    plan,
    variant,
    onVariant,
    renew,
    onClose,
    onContinue,
}: {
    plan: MembershipPlan | null;
    variant?: Variant;
    onVariant?: (v: Variant) => void;
    renew: boolean;
    onClose: () => void;
    onContinue: (p: MembershipPlan) => void;
}) => (
    <WebDialog
        isOpen={!!plan}
        onOpenChange={(o) => !o && onClose()}
        size="lg"
        title={plan ? `${plan.name} membership` : ""}
        description={plan ? `${usd(plan.price)} / year · about ${usd(Math.round(plan.price / 12))}/mo · ${plan.tagline}` : undefined}
        footer={
            plan && (
                <>
                    <WebButton color="outline" onPress={onClose}>
                        Not now
                    </WebButton>
                    <WebButton iconTrailing={ArrowRight} onPress={() => onContinue(plan)}>
                        {renew ? "Continue to renew" : "Continue"}
                    </WebButton>
                </>
            )
        }
    >
        {plan && (
            <div className="flex flex-col gap-6">
                {variant && onVariant && (
                    <ChoicePills
                        label="Plan type"
                        options={[
                            { id: "individual", label: "Individual" },
                            { id: "family", label: "Family" },
                        ]}
                        value={variant}
                        onChange={(v) => onVariant(v as Variant)}
                    />
                )}
                <div className="grid grid-cols-1 gap-x-8 gap-y-5 @tablet:grid-cols-2">
                    {plan.perks.map((p) => (
                        <div key={p.title}>
                            <div className="flex items-center gap-2">
                                <p.icon className="size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                <p className="text-md font-semibold text-primary">{p.title}</p>
                            </div>
                            <p className="mt-1 text-sm text-tertiary">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </WebDialog>
);

/** Fox join page: the Annual plan as hero with an Individual / Family switch, then the others. */
const JoinPlans = ({ renew, onOpen }: { renew: boolean; onOpen: (kind: "annual" | MembershipPlan) => void }) => {
    const [variant, setVariant] = useState<Variant>("individual");
    const plan = ANNUAL_PLANS[variant];
    return (
        <>
            <section aria-label="Annual membership" className="rounded-xl bg-primary p-6 shadow-sm ring-2 ring-brand ring-inset">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Pill>Most popular</Pill>
                        <h3 className="mt-2 text-xl font-semibold text-primary">Annual membership</h3>
                        <p className="text-md text-tertiary">{plan.tagline}</p>
                    </div>
                    <ChoicePills
                        label="Plan type"
                        options={[
                            { id: "individual", label: "Individual" },
                            { id: "family", label: "Family" },
                        ]}
                        value={variant}
                        onChange={(v) => setVariant(v as Variant)}
                    />
                </div>
                <p className="mt-5">
                    <span className="text-display-sm font-bold tracking-[-0.5px] text-primary tabular-nums">{usd(plan.price)}</span> <span className="text-md text-tertiary">/ year</span>
                </p>
                <ul className="mt-5 grid grid-cols-1 gap-2.5 @tablet:grid-cols-2">
                    {plan.perks.map((p) => (
                        <li key={p.title} className="flex items-start gap-2.5 text-md text-secondary">
                            <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                            {p.title}
                        </li>
                    ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2.5">
                    <WebButton onPress={() => onOpen("annual")}>{renew ? "Renew Annual" : "Join Annual"}</WebButton>
                    <WebButton color="outline" onPress={() => onOpen("annual")}>
                        See details
                    </WebButton>
                </div>
            </section>

            <section aria-label="Other plans">
                <p className="caps mb-3 text-quaternary">Also available</p>
                <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                    {OTHER_PLANS.map((p) => (
                        <div key={p.id} className="flex flex-col rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset">
                            <div className="flex items-baseline justify-between gap-2">
                                <p className="text-lg font-semibold text-primary">{p.name}</p>
                                <p className="text-sm">
                                    <span className="font-semibold text-primary tabular-nums">{usd(p.price)}</span> <span className="text-tertiary">/ yr</span>
                                </p>
                            </div>
                            <p className="mt-1 text-sm text-tertiary">{p.tagline}</p>
                            <ul className="mt-3 flex flex-1 flex-col gap-1.5">
                                {p.perks.map((k) => (
                                    <li key={k.title} className="flex items-start gap-2 text-sm text-secondary">
                                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-fg-brand-primary" aria-hidden="true" />
                                        {k.title}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4">
                                <WebButton size="sm" color="outline" onPress={() => onOpen(p)}>
                                    See details
                                </WebButton>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <p className="text-center text-sm text-tertiary">No initiation fee · Family add-ons available · Cancel any time before renewal.</p>
        </>
    );
};

export interface AccountMembershipsScreenProps {
    /** Pass [] for the non-member (join) state; only expired ones for the renew state. */
    memberships?: Membership[];
}

/**
 * Memberships — Crane's membership cards (active / expiring) for members, Fox
 * "Profile ∕ Account/Memberships" join page (Annual hero + plans + details dialog) for
 * non-members, and the Fox membership banner as an upsell.
 */
export const AccountMembershipsScreen = ({ memberships = MEMBERSHIPS }: AccountMembershipsScreenProps) => {
    const { course } = useWebSession();
    const { navigate } = useWebRouter();
    const [open, setOpen] = useState<"annual" | MembershipPlan | null>(null);
    const [variant, setVariant] = useState<Variant>("individual");

    const status = (m: Membership) => walletStatus({ expires: m.expires });
    const current = memberships.filter((m) => status(m) !== "expired").sort((a, b) => a.expires.getTime() - b.expires.getTime());
    const expired = memberships.filter((m) => status(m) === "expired");
    const expiring = current.find((m) => status(m) === "expiring-soon");
    const isMember = current.length > 0;
    const renew = !isMember && expired.length > 0;

    const dialogPlan = open === "annual" ? ANNUAL_PLANS[variant] : open;
    const toCheckout = (p: MembershipPlan) => navigate(`/shop/memberships/${p.id}`);

    return (
        <AccountLayout active="memberships">
            <div className="flex flex-col gap-8">
                {isMember ? (
                    <>
                        <AccountTitle title="Memberships" subtitle={`Your memberships at ${course.name}.`} />
                        {expiring && <RenewNotice m={expiring} onRenew={() => navigate(`/shop/memberships/renew/${expiring.memberId}`)} />}
                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                            {current.map((m) => (
                                <MembershipTile key={m.id} membership={m} />
                            ))}
                            {expired.map((m) => (
                                <MembershipTile key={m.id} membership={m} />
                            ))}
                        </div>
                        <UpsellBanner onSee={() => setOpen("annual")} />
                    </>
                ) : (
                    <>
                        {renew && <RenewNotice m={expired[0]} expired onRenew={() => setOpen("annual")} />}
                        <AccountTitle
                            title={renew ? "Renew your membership" : "Become a member"}
                            subtitle={`Unlimited golf, member rates, and first access to leagues, clinics and events at ${course.name}.`}
                        />
                        <JoinPlans renew={renew} onOpen={setOpen} />
                    </>
                )}
            </div>

            <PlanDialog
                plan={dialogPlan}
                variant={open === "annual" ? variant : undefined}
                onVariant={setVariant}
                renew={renew}
                onClose={() => setOpen(null)}
                onContinue={toCheckout}
            />
        </AccountLayout>
    );
};
