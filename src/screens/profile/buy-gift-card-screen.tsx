import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import {
    Label as AriaLabel,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    Text as AriaText,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
} from "react-aria-components";
import { ArrowRight, Calendar, Check, Gift01, Mail01, Phone, Printer, User01 } from "@untitledui/icons";
import { StatusBadge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Screen } from "@/components/device/screen";
import { TextField } from "@/components/forms/text-field";
import { GiftArtThumb } from "@/components/gift-cards/gift-art-card";
import { useStack } from "@/components/prototype/stack-navigator";
import {
    CARD_DESIGNS,
    CLUB_NAME,
    CUSTOM_MAX,
    CUSTOM_MIN,
    DESIGN_THEMES,
    GIFT_CARD_DEALS,
    GOOD_FOR,
    MESSAGE_MAX,
    SAMPLE_GIFT_ORDER,
    STANDARD_AMOUNTS,
    betterDealFor,
    dealTerms,
    fromHasErrors,
    money0,
    newGiftCardOrder,
    orderBonus,
    orderPrice,
    orderValue,
    validateGiftOrder,
    type GiftCardDeal,
    type GiftCardOrder,
    type GiftDelivery,
    type GiftErrors,
    type GiftRecipient,
} from "@/data/gift-cards";
import { cx } from "@/utils/cx";
import { GroupLabel, RadioDot, StepHeading } from "./gift-card-parts";
import { GiftCardReviewSheet } from "./gift-card-review-sheet";
import { purchaseKind } from "./gift-cards-store";
import { ProfileNav } from "./profile-shared";

export interface BuyGiftCardScreenProps {
    /** Start from this order (stories: filled in, deal nudge, for me…). Defaults to a new order. */
    initialOrder?: GiftCardOrder;
    /** Open with the field errors showing, as after Continue with something missing. */
    showErrors?: boolean;
    /** Open with Review and pay up (stories). */
    initialReview?: boolean;
    /** Route param: `review` opens Review and pay on the sample gift (`#/profile/gift-cards/buy-gift-card:review`). */
    id?: string;
}

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

const tile =
    "group relative flex cursor-pointer rounded-ios-control bg-primary shadow-ios-card ring-1 ring-secondary/70 outline-none transition duration-100 ease-linear ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[pressed]:scale-[0.985] data-[selected]:bg-brand-primary_alt data-[selected]:ring-2 data-[selected]:ring-brand disabled:cursor-not-allowed disabled:opacity-50";

const DealOption = ({ deal }: { deal: GiftCardDeal }) => {
    const terms = dealTerms(deal);
    return (
        <AriaRadio value={deal.id} isDisabled={deal.soldOut} className={cx(tile, "items-center gap-3 px-4 py-3")}>
            <RadioDot />
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-ios-footnote text-tertiary">Pay {money0(deal.price)}</span>
                <span className="text-ios-title3 text-primary">
                    Get a <span className="text-brand-secondary">{money0(deal.value)}</span> card
                </span>
                {terms && (
                    <span className="mt-0.5 flex items-center gap-1 text-ios-caption1 text-tertiary">
                        <Calendar className="size-3.5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                        {terms}
                    </span>
                )}
            </span>
            {deal.soldOut ? <StatusBadge tone="gray">Sold out</StatusBadge> : <StatusBadge tone="success">+{money0(deal.value - deal.price)} bonus</StatusBadge>}
        </AriaRadio>
    );
};

const OptionTile = ({ value, icon: Icon, title, text }: { value: string; icon: FC<{ className?: string }>; title: string; text: string }) => (
    <AriaRadio value={value} className={cx(tile, "items-start gap-3 px-4 py-3")}>
        <span className="mt-px">
            <RadioDot />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 text-ios-headline text-primary">
                <Icon className="size-[18px] shrink-0 text-fg-quaternary" aria-hidden="true" />
                {title}
            </span>
            <span className="text-ios-subheadline text-tertiary">{text}</span>
        </span>
    </AriaRadio>
);

const DollarPrefix = ({ className }: { className?: string }) => (
    <span className={cx(className, "flex w-auto items-center justify-center text-ios-body text-placeholder")} aria-hidden="true">
        $
    </span>
);

/** Message (optional): a 300-character textarea styled like TextField. */
const MessageField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <AriaTextField value={value} onChange={(v) => onChange(v.slice(0, MESSAGE_MAX))} maxLength={MESSAGE_MAX} className="group flex flex-col gap-1.5">
        <AriaLabel className="px-0.5 text-ios-subheadline font-medium text-secondary">Message (optional)</AriaLabel>
        <AriaTextArea
            rows={3}
            placeholder="Happy birthday! First round's on me."
            className="min-h-[100px] resize-none rounded-ios-control bg-primary px-3.5 py-3 text-ios-body text-primary ring-1 ring-primary outline-none transition duration-100 ease-linear ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand"
        />
        <AriaText slot="description" className="px-0.5 text-ios-footnote text-tertiary tabular-nums">
            {value.length}/{MESSAGE_MAX} characters · it goes on the card email.
        </AriaText>
    </AriaTextField>
);

const Step = ({ n, title, children, className }: { n: number; title: string; children: ReactNode; className?: string }) => (
    <section className={cx("flex flex-col gap-3", className)}>
        <div className="px-gutter">
            <StepHeading n={n}>{title}</StepHeading>
        </div>
        {children}
    </section>
);

/** Scroll the screen so the first highlighted field sits under the nav bar. */
const scrollToFirstError = (root: HTMLElement | null) => {
    const field = root?.querySelector<HTMLElement>("[data-invalid]");
    const scroller = field?.closest<HTMLElement>(".overflow-y-auto");
    if (!field || !scroller) return;
    const box = scroller.getBoundingClientRect();
    const scale = box.height / scroller.offsetHeight || 1; // the presenter scales the phone to fit
    const top = scroller.scrollTop + (field.getBoundingClientRect().top - box.top) / scale - 140;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

/**
 * Buy a Gift Card — Fox's Nov 25 builder as a pushed iPhone screen: three stacked steps (amount
 * with deals first, design, who it's for), a sticky bottom bar with the card, "You pay" and
 * Continue, then Review and pay in a sheet. Errors only show after Continue.
 */
export const BuyGiftCardScreen = ({ initialOrder, showErrors = false, initialReview, id }: BuyGiftCardScreenProps) => {
    const { replace } = useStack();
    const deepReview = id === "review";
    const [order, setOrder] = useState<GiftCardOrder>(() => initialOrder ?? (deepReview ? SAMPLE_GIFT_ORDER : newGiftCardOrder()));
    const [touched, setTouched] = useState(showErrors);
    const [editingFrom, setEditingFrom] = useState(() => showErrors && fromHasErrors(validateGiftOrder(initialOrder ?? newGiftCardOrder())));
    const [reviewOpen, setReviewOpen] = useState(initialReview ?? deepReview);
    const rootRef = useRef<HTMLDivElement>(null);

    const set = (patch: Partial<GiftCardOrder>) => setOrder((o) => ({ ...o, ...patch }));
    const errors = validateGiftOrder(order);
    const valid = Object.keys(errors).length === 0;
    const show: GiftErrors = touched ? errors : {};
    const value = orderValue(order);
    const price = orderPrice(order);
    const bonus = orderBonus(order);
    const nudge = betterDealFor(order);
    const someone = order.recipient === "someone";

    // Opened with errors (the Missing details story): bring the first one into view.
    useEffect(() => {
        if (showErrors) requestAnimationFrame(() => scrollToFirstError(rootRef.current));
    }, [showErrors]);

    const onContinue = () => {
        setTouched(true);
        if (valid) {
            setReviewOpen(true);
            return;
        }
        if (fromHasErrors(errors)) setEditingFrom(true);
        requestAnimationFrame(() => scrollToFirstError(rootRef.current));
    };

    const field = (key: keyof GiftErrors) => ({ isInvalid: !!show[key], errorMessage: show[key] });

    return (
        <Screen
            nav={<ProfileNav title="Buy a Gift Card" backIconOnly />}
            footerSurface="glass"
            footer={
                <div className="flex flex-col gap-2">
                    {touched && !valid && (
                        <p role="alert" className="text-ios-footnote font-medium text-error-primary">
                            Fill in the highlighted fields to continue.
                        </p>
                    )}
                    <div className="flex items-center gap-3">
                        <GiftArtThumb designId={order.designId} className="w-[60px] rounded-lg" />
                        <div className="min-w-0 flex-1">
                            <div className="text-ios-headline text-primary tabular-nums">You pay {price > 0 ? money0(price) : "—"}</div>
                            <div className="truncate text-ios-footnote text-tertiary tabular-nums">
                                {value > 0 ? `${money0(value)} card` : "Choose an amount"}
                                {bonus > 0 && <span className="text-success-primary"> · +{money0(bonus)} bonus</span>}
                            </div>
                        </div>
                        <Button size="lg" iconTrailing={ArrowRight} onPress={onContinue} className="px-4">
                            Continue
                        </Button>
                    </div>
                </div>
            }
        >
            <div ref={rootRef} className="flex flex-col gap-7 pt-3 pb-10">
                <p className="px-gutter text-ios-subheadline text-tertiary">
                    Give a round, a lesson or lunch at {CLUB_NAME}. Every card is good for {GOOD_FOR}.
                </p>

                {/* 1 · Amount, deals first */}
                <Step n={1} title="Choose an amount">
                    <AriaRadioGroup aria-label="Amount" value={order.amount} onChange={(amount) => set({ amount })} className="flex flex-col gap-2 px-gutter">
                        <GroupLabel>Deals</GroupLabel>
                        {GIFT_CARD_DEALS.map((d) => (
                            <DealOption key={d.id} deal={d} />
                        ))}
                        <GroupLabel className="mt-3">Or pick an amount</GroupLabel>
                        <div className="grid grid-cols-4 gap-2">
                            {STANDARD_AMOUNTS.map((n) => (
                                <AriaRadio
                                    key={n}
                                    value={String(n)}
                                    className="press-scale flex h-[50px] cursor-pointer items-center justify-center rounded-ios-control bg-primary text-ios-headline text-primary tabular-nums shadow-ios-card ring-1 ring-secondary/70 outline-none ring-inset data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-0"
                                >
                                    {money0(n)}
                                </AriaRadio>
                            ))}
                        </div>
                    </AriaRadioGroup>

                    <div className="px-gutter">
                        <TextField
                            label="Other amount"
                            icon={DollarPrefix}
                            placeholder="0.00"
                            inputMode="decimal"
                            value={order.customAmount}
                            onChange={(customAmount) => set({ customAmount, amount: "custom" })}
                            onFocus={() => set({ amount: "custom" })}
                            hint={show.customAmount ? undefined : `Any amount from $${CUSTOM_MIN} to $${CUSTOM_MAX}.`}
                            className={cx(order.amount === "custom" && "[&>div]:ring-2 [&>div]:ring-brand")}
                            {...field("customAmount")}
                        />
                    </div>

                    {nudge && (
                        <div role="status" className="mx-gutter flex flex-col items-start gap-2.5 rounded-ios-control bg-brand-primary_alt p-3.5 ring-1 ring-brand/40 ring-inset">
                            <p className="text-ios-subheadline text-secondary">
                                <span className="font-semibold text-primary">Same {money0(nudge.price)}, bigger card.</span> The deal gets you a {money0(nudge.value)} card instead.
                            </p>
                            <Button size="sm" color="filled" onPress={() => set({ amount: nudge.id })}>
                                Switch to the deal
                            </Button>
                        </div>
                    )}
                </Step>

                {/* 2 · Design: one horizontal row per group */}
                <Step n={2} title="Pick a design">
                    <AriaRadioGroup aria-label="Design" value={order.designId} onChange={(designId) => set({ designId })} className="flex flex-col gap-3">
                        {DESIGN_THEMES.map((t) => (
                            <div key={t.id} className="flex flex-col gap-1">
                                <GroupLabel className="mx-gutter">{t.label}</GroupLabel>
                                <div className="scrollbar-hide flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-gutter py-1.5">
                                    {CARD_DESIGNS.filter((d) => d.theme === t.id).map((d) => (
                                        <AriaRadio key={d.id} value={d.id} aria-label={d.name} className="group w-[150px] shrink-0 cursor-pointer snap-start outline-none">
                                            <span className="relative block">
                                                <img src={d.art} alt="" className="aspect-[3/2] w-full rounded-[10px] object-cover ring-1 ring-black/10 transition duration-100 ease-linear group-data-[pressed]:scale-[0.97]" />
                                                <span
                                                    aria-hidden="true"
                                                    className="pointer-events-none absolute -inset-[3px] rounded-[13px] ring-0 ring-brand group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60 group-data-[selected]:ring-[2.5px] group-data-[selected]:ring-brand"
                                                />
                                                <span className="absolute top-1.5 right-1.5 hidden size-[22px] items-center justify-center rounded-full bg-brand-solid text-white shadow-md group-data-[selected]:flex">
                                                    <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                                                </span>
                                            </span>
                                            <span className="mt-1.5 block truncate px-0.5 text-ios-footnote font-medium text-primary group-data-[selected]:text-brand-secondary">{d.name}</span>
                                        </AriaRadio>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </AriaRadioGroup>
                </Step>

                {/* 3 · Who it's for */}
                <Step n={3} title="Who's it for?">
                    <div className="flex flex-col gap-5 px-gutter">
                        <AriaRadioGroup aria-label="Who it's for" value={order.recipient} onChange={(r) => set({ recipient: r as GiftRecipient })} className="flex flex-col gap-2">
                            <OptionTile value="someone" icon={Gift01} title="Someone else" text="Send it as a gift, with a note." />
                            <OptionTile value="me" icon={User01} title="Me" text="It's saved to your wallet to spend." />
                        </AriaRadioGroup>

                        {someone && (
                            <>
                                <AriaRadioGroup aria-label="How should it get there?" value={order.delivery} onChange={(d) => set({ delivery: d as GiftDelivery })} className="flex flex-col gap-2">
                                    <GroupLabel>How should it get there?</GroupLabel>
                                    <OptionTile value="email" icon={Mail01} title="Email it to them" text="They get it today, ready to use." />
                                    <OptionTile value="print" icon={Printer} title="Email it to me to print" text="Hand it over yourself." />
                                </AriaRadioGroup>

                                {/* From: the signed-in golfer, with Change */}
                                <div className="flex flex-col gap-2">
                                    <GroupLabel>From</GroupLabel>
                                    <div className="flex flex-col gap-4 rounded-ios-card bg-primary p-4 shadow-ios-card ring-1 ring-secondary/60">
                                        <div className="flex items-start gap-3">
                                            <p className="min-w-0 flex-1 text-ios-subheadline text-tertiary">
                                                <span className="text-ios-headline text-primary">{order.fromName.trim() || "—"}</span> ({order.fromEmail.trim() || "no email"})
                                            </p>
                                            <Button size="sm" color="plain" onPress={() => setEditingFrom((e) => !e)} className="-my-1.5 h-[32px]">
                                                {editingFrom ? "Done" : "Change"}
                                            </Button>
                                        </div>
                                        {editingFrom && (
                                            <>
                                                <TextField
                                                    label="Your name"
                                                    icon={User01}
                                                    value={order.fromName}
                                                    onChange={(fromName) => set({ fromName })}
                                                    autoComplete="name"
                                                    isRequired
                                                    hint={show.fromName ? undefined : "It's on the card, so they know who it's from."}
                                                    {...field("fromName")}
                                                />
                                                <TextField
                                                    label="Your email"
                                                    type="email"
                                                    icon={Mail01}
                                                    value={order.fromEmail}
                                                    onChange={(fromEmail) => set({ fromEmail })}
                                                    autoComplete="email"
                                                    isRequired
                                                    {...field("fromEmail")}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* To */}
                                <div className="flex flex-col gap-3">
                                    <GroupLabel>To</GroupLabel>
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextField label="First name" placeholder="Alex" value={order.toFirstName} onChange={(toFirstName) => set({ toFirstName })} autoComplete="off" isRequired {...field("toFirstName")} />
                                        <TextField label="Last name" placeholder="Rivera" value={order.toLastName} onChange={(toLastName) => set({ toLastName })} autoComplete="off" isRequired {...field("toLastName")} />
                                    </div>
                                    {order.delivery === "email" && (
                                        <>
                                            <TextField
                                                label="Email"
                                                type="email"
                                                inputMode="email"
                                                icon={Mail01}
                                                placeholder="alex@tenfore.golf"
                                                value={order.toEmail}
                                                onChange={(toEmail) => set({ toEmail })}
                                                autoComplete="off"
                                                isRequired
                                                {...field("toEmail")}
                                            />
                                            <TextField
                                                label="Confirm email"
                                                type="email"
                                                inputMode="email"
                                                icon={Mail01}
                                                placeholder="alex@tenfore.golf"
                                                value={order.toEmailConfirm}
                                                onChange={(toEmailConfirm) => set({ toEmailConfirm })}
                                                autoComplete="off"
                                                isRequired
                                                {...field("toEmailConfirm")}
                                            />
                                            <TextField
                                                label="Phone (optional)"
                                                type="tel"
                                                inputMode="tel"
                                                icon={Phone}
                                                placeholder="(555) 010-0000"
                                                value={order.toPhone}
                                                onChange={(toPhone) => set({ toPhone })}
                                                autoComplete="off"
                                                hint="We'll also text them the card."
                                            />
                                            <TextField
                                                label="Confirm phone (optional)"
                                                type="tel"
                                                inputMode="tel"
                                                icon={Phone}
                                                placeholder="(555) 010-0000"
                                                value={order.toPhoneConfirm}
                                                onChange={(toPhoneConfirm) => set({ toPhoneConfirm })}
                                                autoComplete="off"
                                                {...field("toPhoneConfirm")}
                                            />
                                        </>
                                    )}
                                </div>

                                <MessageField value={order.message} onChange={(message) => set({ message })} />
                            </>
                        )}
                    </div>
                </Step>
            </div>

            <GiftCardReviewSheet
                order={order}
                isOpen={reviewOpen}
                onOpenChange={setReviewOpen}
                onPaid={(purchase) => replace("gift-card-bought", { id: purchaseKind(purchase.order) })}
            />
        </Screen>
    );
};
