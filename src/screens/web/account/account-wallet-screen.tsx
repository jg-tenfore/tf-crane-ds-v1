import { useState, type ReactNode } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { AlertCircle, CheckCircle, Gift01, Plus, QrCode01, Wallet02 } from "@untitledui/icons";
import { IconTile } from "@/components/base/card";
import { QRCode } from "@/components/base/qr-code";
import { TextField } from "@/components/forms/text-field";
import { Notice } from "@/components/feedback/notice";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter } from "@/components/web/web-router";
import { GIFT_CARDS, PAYMENT_CARDS, PUNCH_CARDS, RAIN_CHECKS, currency, type GiftCard, type PunchCard, type RainCheck } from "@/data/crane";
import { money0, orderValue, SENT_GIFTS, sentGiftFrom, toName, type SentGift } from "@/data/gift-cards";
import { GIFT_ORDER_DAY, giftOrdersIn } from "@/screens/web/checkout/checkout-data";
import { giftCardIdAt, orderById } from "@/screens/web/checkout/orders";
import { useWebSession } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { BALANCE_ACTIVITY } from "./account-data";
import { AccountLayout } from "./account-layout";
import { AccountPanel, AccountTitle, EmptyBlock, Flash, LinkButton, WebButton, shortDay, useFlash } from "./account-ui";
import { GiftCardTile, PunchCardTile, RainCheckTile, SentGiftRow, giftCardStatus, rainCheckStatus } from "./account-wallet-items";

const Dollar = ({ className }: { className?: string }) => (
    <span className={cx(className, "flex w-auto items-center text-md text-placeholder")} aria-hidden="true">
        $
    </span>
);

const card = PAYMENT_CARDS[0];

/** Saved-card radio list for Pay balance. */
const CardChoice = ({ value, onChange }: { value: string; onChange: (id: string) => void }) => (
    <AriaRadioGroup aria-label="Payment method" value={value} onChange={onChange} className="flex flex-col gap-2">
        {PAYMENT_CARDS.map((c) => (
            <AriaRadio
                key={c.id}
                value={c.id}
                className="group flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-primary_alt data-[selected]:ring-brand"
            >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary group-data-[selected]:ring-2 group-data-[selected]:ring-fg-brand-primary">
                    <span className="size-2.5 rounded-full bg-fg-brand-primary opacity-0 group-data-[selected]:opacity-100" />
                </span>
                <span className="flex-1 text-md font-semibold text-primary tabular-nums">
                    {c.brand} •••• {c.last4}
                </span>
                <span className="text-sm text-tertiary tabular-nums">Exp {c.exp}</span>
            </AriaRadio>
        ))}
    </AriaRadioGroup>
);

/* ---------- Pay balance ---------- */

const PayDialog = ({ isOpen, onOpenChange, due, onPaid }: { isOpen: boolean; onOpenChange: (o: boolean) => void; due: number; onPaid: (amount: number) => void }) => {
    const [amount, setAmount] = useState(due.toFixed(2));
    const [cardId, setCardId] = useState(card?.id ?? "");
    const [paying, setPaying] = useState(false);
    const value = Number.parseFloat(amount);
    const ok = value > 0 && value <= due && !!cardId;
    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            title="Pay balance"
            description={`${currency(due)} is due on your account.`}
            footer={
                <>
                    <WebButton color="outline" onPress={() => onOpenChange(false)}>
                        Cancel
                    </WebButton>
                    <WebButton
                        isDisabled={!ok}
                        isLoading={paying}
                        onPress={() => {
                            setPaying(true);
                            window.setTimeout(() => {
                                setPaying(false);
                                onPaid(value);
                                onOpenChange(false);
                            }, 700);
                        }}
                    >
                        {ok ? `Pay ${currency(value)}` : "Pay"}
                    </WebButton>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <TextField label="Amount" icon={Dollar} inputMode="decimal" value={amount} onChange={setAmount} isInvalid={value > due} errorMessage={`You can pay up to ${currency(due)}.`} />
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-secondary">Pay with</span>
                    <CardChoice value={cardId} onChange={setCardId} />
                </div>
            </div>
        </WebDialog>
    );
};

/* ---------- Punch card QR ---------- */

const PunchQRDialog = ({ card: pc, onClose }: { card: PunchCard | null; onClose: () => void }) => (
    <WebDialog
        isOpen={!!pc}
        onOpenChange={(o) => !o && onClose()}
        size="sm"
        title={pc ? `Punch Card #${pc.number}` : ""}
        description="Show this at the pro shop counter to use a punch."
        footer={
            <WebButton color="outline" onPress={onClose}>
                Done
            </WebButton>
        }
    >
        {pc && (
            <div className="flex flex-col items-center gap-3 pb-2">
                <div className="rounded-lg bg-white p-3 ring-1 ring-secondary ring-inset">
                    <QRCode value={`crane://punch-card/${pc.number}`} size={200} />
                </div>
                {pc.items.map((i) => (
                    <p key={i.name} className="text-md text-secondary">
                        <span className="font-semibold text-primary tabular-nums">{i.total - i.used}</span> of {i.total} {i.name} left
                    </p>
                ))}
            </div>
        )}
    </WebDialog>
);

/* ---------- Screen ---------- */

const SectionTitle = ({ title, meta, action }: { title: string; meta?: ReactNode; action?: ReactNode }) => (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-baseline gap-3">
            <h3 className="text-xl font-semibold tracking-[-0.3px] text-primary">{title}</h3>
            {meta && <span className="text-sm text-tertiary">{meta}</span>}
        </div>
        {action}
    </div>
);

export interface AccountWalletScreenProps {
    /** Amount owed on the account. 0 (the app's default) disables Pay. */
    statementBalance?: number;
    punchCards?: PunchCard[];
    rainChecks?: RainCheck[];
    giftCards?: GiftCard[];
    /** Gifts bought for other people (Gift cards › Sent as gifts). */
    sentGifts?: SentGift[];
    /** A gift card order just paid (also read from `?bought=<order id>`): its card is marked New, or its gift tops Sent as gifts. */
    boughtOrderId?: string;
    defaultPayOpen?: boolean;
}

/** What a just-paid gift card order adds to the wallet: cards for you, gifts sent, and the notice. */
const useBoughtGiftCards = (boughtOrderId?: string) => {
    const { path } = useWebRouter();
    const id = boughtOrderId ?? new URLSearchParams(path.split("?")[1] ?? "").get("bought");
    const order = id ? orderById(id) : null;
    const gifts = order?.kind === "gift-card" ? giftOrdersIn(order.lines) : [];
    const cards = gifts.flatMap((g, i) =>
        g.order.recipient === "me"
            ? [
                  {
                      card: { id: `gc-${id}-${i}`, code: giftCardIdAt(i), expires: new Date(2099, 11, 31), amount: orderValue(g.order), used: 0, categories: ["Golf", "Food & Drink", "Alcohol", "Merchandise"] } satisfies GiftCard,
                      designId: g.order.designId,
                  },
              ]
            : [],
    );
    const sent = gifts.flatMap((g, i) => (g.order.recipient === "someone" ? [{ ...sentGiftFrom(g.order, `sg-${id}-${i}`), date: GIFT_ORDER_DAY }] : []));
    const first = gifts[0]?.order;
    const notice = !first ? null : first.recipient === "me" ? (
        <Notice tone="success" title={`Your ${money0(orderValue(first))} gift card is in your wallet`} className="rounded-lg text-sm">
            Use it at checkout or at the Pro Shop counter.
        </Notice>
    ) : first.delivery === "print" ? (
        <Notice tone="success" title={`Your gift for ${toName(first)} is ready to print`} className="rounded-lg text-sm">
            We emailed you the card to print. You'll find it under Gift cards › Sent as gifts.
        </Notice>
    ) : (
        <Notice tone="success" title={`Your gift to ${toName(first)} is on its way`} className="rounded-lg text-sm">
            You'll find it under Gift cards › Sent as gifts.
        </Notice>
    );
    return { cards, sent, notice };
};

/**
 * Wallet — ports Fox "Profile ∕ Account/Wallet" (balance, punch cards, gift cards) and adds the Crane
 * app's Pay Balance and Rain Checks, with the app's statuses. Gift cards (Nov 25): art thumbnails on
 * cards bought online, a "Sent as gifts" list, and "Buy a gift card" opening the builder at
 * /shop/gift-cards. After a purchase (`?bought=<order id>`) a notice says where the card went, and
 * the new card (New) or the new gift (top of Sent as gifts) is marked.
 */
export const AccountWalletScreen = ({
    statementBalance = 0,
    punchCards = PUNCH_CARDS,
    rainChecks = RAIN_CHECKS,
    giftCards = GIFT_CARDS,
    sentGifts = SENT_GIFTS,
    boughtOrderId,
    defaultPayOpen = false,
}: AccountWalletScreenProps) => {
    const { course } = useWebSession();
    const flash = useFlash();
    const [due, setDue] = useState(statementBalance);
    const [payOpen, setPayOpen] = useState(defaultPayOpen && statementBalance > 0);
    const [qrCard, setQrCard] = useState<PunchCard | null>(null);
    const bought = useBoughtGiftCards(boughtOrderId);
    const allSent = [...bought.sent, ...sentGifts];
    const newSentIds = new Set(bought.sent.map((g) => g.id));

    const rainAvailable = rainChecks.filter((c) => ["active", "expiring-soon"].includes(rainCheckStatus(c))).reduce((n, c) => n + c.amount - c.used, 0);
    const giftAvailable = [...bought.cards.map((c) => c.card), ...giftCards].filter((c) => giftCardStatus(c) === "available").reduce((n, c) => n + c.amount - c.used, 0);
    // Usable first, then used up / expired.
    const order = (s: string) => (s === "active" || s === "available" || s === "expiring-soon" ? 0 : 1);
    const sortedRain = [...rainChecks].sort((a, b) => order(rainCheckStatus(a)) - order(rainCheckStatus(b)));
    const sortedGift = [...giftCards].sort((a, b) => order(giftCardStatus(a)) - order(giftCardStatus(b)));

    return (
        <AccountLayout active="wallet">
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <AccountTitle
                        title="Wallet"
                        subtitle={`Your balance and credits at ${course.name}.`}
                        actions={
                            <LinkButton href="/shop/gift-cards" color="outline" icon={Gift01} className="hidden @tablet:inline-flex">
                                Buy a gift card
                            </LinkButton>
                        }
                    />
                    {bought.notice}
                    <Flash message={flash.message} />
                </div>

                {/* Balance */}
                <AccountPanel flush>
                    <div className="flex flex-col gap-5 p-5 @tablet:flex-row @tablet:items-center">
                        <IconTile icon={Wallet02} size="lg" shape="circle" className="hidden @tablet:inline-flex" />
                        <div className="min-w-0 flex-1">
                            <p className="caps text-[11px] text-quaternary">Account balance</p>
                            <p className={cx("text-display-sm font-bold tracking-[-0.5px] tabular-nums", due > 0 ? "text-primary" : "text-brand-secondary")}>{currency(due)}</p>
                            <p className={cx("mt-1 flex items-center gap-1.5 text-sm", due > 0 ? "text-warning-primary" : "text-tertiary")}>
                                {due > 0 ? <AlertCircle className="size-4" aria-hidden="true" /> : <CheckCircle className="size-4 text-fg-success-secondary" aria-hidden="true" />}
                                {due > 0 ? `${currency(due)} due on your statement` : "No balance due"}
                            </p>
                        </div>
                        <WebButton isDisabled={due <= 0} color={due > 0 ? "filled" : "gray"} onPress={() => setPayOpen(true)}>
                            Pay balance
                        </WebButton>
                    </div>
                    <div className="border-t border-secondary px-5 pt-3 pb-1">
                        <p className="caps text-[11px] text-quaternary">Recent activity</p>
                        <ul className="divide-y divide-secondary">
                            {BALANCE_ACTIVITY.map((a) => (
                                <li key={a.id} className="flex items-center gap-4 py-3">
                                    <span className="flex min-w-0 flex-1 flex-col @tablet:flex-row @tablet:items-center @tablet:gap-4">
                                        <span className="truncate text-md text-primary @tablet:order-last">{a.desc}</span>
                                        <span className="shrink-0 text-sm text-tertiary tabular-nums @tablet:w-24">{shortDay(a.date)}</span>
                                    </span>
                                    <span className={cx("text-md font-semibold tabular-nums", a.amount > 0 ? "text-success-primary" : "text-primary")}>
                                        {a.amount > 0 ? "+" : "−"}
                                        {currency(Math.abs(a.amount))}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </AccountPanel>

                {/* Punch cards */}
                <section aria-label="Punch cards">
                    <SectionTitle title="Punch cards" meta={`${punchCards.length} card${punchCards.length === 1 ? "" : "s"}`} />
                    {punchCards.length ? (
                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                            {punchCards.map((c) => (
                                <PunchCardTile
                                    key={c.id}
                                    card={c}
                                    action={
                                        <WebButton size="sm" color="tinted" iconLeading={QrCode01} onPress={() => setQrCard(c)}>
                                            Show QR
                                        </WebButton>
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <AccountPanel>
                            <EmptyBlock icon={Plus} title="No punch cards" description="Punch cards bought at the course show up here." />
                        </AccountPanel>
                    )}
                </section>

                {/* Rain checks */}
                <section aria-label="Rain checks">
                    <SectionTitle title="Rain checks" meta={`${currency(rainAvailable)} available`} />
                    <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                        {sortedRain.map((c) => (
                            <RainCheckTile key={c.id} check={c} />
                        ))}
                    </div>
                </section>

                {/* Gift cards */}
                <section aria-label="Gift cards">
                    <SectionTitle
                        title="Gift cards"
                        meta={`${currency(giftAvailable)} available`}
                        action={
                            <LinkButton href="/shop/gift-cards" size="sm" color="tinted" icon={Plus}>
                                Buy a gift card
                            </LinkButton>
                        }
                    />
                    <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                        {bought.cards.map(({ card: c, designId }) => (
                            <GiftCardTile key={c.id} card={c} designId={designId} isNew neverExpires />
                        ))}
                        {sortedGift.map((c) => (
                            <GiftCardTile key={c.id} card={c} />
                        ))}
                    </div>

                    {/* Sent as gifts */}
                    {allSent.length > 0 && (
                        <div className="mt-8">
                            <div className="mb-3 flex items-baseline justify-between gap-3">
                                <h4 className="caps text-quaternary">Sent as gifts</h4>
                                <span className="text-sm text-tertiary">
                                    {allSent.length} gift{allSent.length === 1 ? "" : "s"}
                                </span>
                            </div>
                            <AccountPanel flush>
                                <ul className="divide-y divide-secondary px-5">
                                    {allSent.map((g) => (
                                        <SentGiftRow key={g.id} gift={g} isNew={newSentIds.has(g.id)} />
                                    ))}
                                </ul>
                            </AccountPanel>
                        </div>
                    )}
                </section>
            </div>

            <PayDialog
                isOpen={payOpen}
                onOpenChange={setPayOpen}
                due={due}
                onPaid={(v) => {
                    setDue((d) => Math.max(0, +(d - v).toFixed(2)));
                    flash.show(`Payment of ${currency(v)} received. Thanks!`);
                }}
            />
            <PunchQRDialog card={qrCard} onClose={() => setQrCard(null)} />
        </AccountLayout>
    );
};
