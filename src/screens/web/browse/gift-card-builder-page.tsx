import { useEffect, useRef, useState, type FC, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Calendar, Check, CurrencyDollar, Gift01, Mail01, Phone, Printer, ShoppingBag03, User01, Wallet02 } from "@untitledui/icons";
import {
    Button as AriaButton,
    Label as AriaLabel,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    Text as AriaText,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
} from "react-aria-components";
import { StatusBadge } from "@/components/base/badge";
import { TextField } from "@/components/forms/text-field";
import { GiftArtCard, GiftArtThumb } from "@/components/gift-cards/gift-art-card";
import { PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import type { Course } from "@/data/crane";
import {
    betterDealFor,
    CARD_DESIGNS,
    CUSTOM_MAX,
    CUSTOM_MIN,
    dealTerms,
    deliveryLine,
    DESIGN_THEMES,
    fromHasErrors,
    GIFT_CARD_DEALS,
    giftCardProduct,
    giftOrderFromQuery,
    giftOrderToQuery,
    GOOD_FOR,
    MESSAGE_MAX,
    money,
    money0,
    orderBonus,
    orderPrice,
    orderValue,
    STANDARD_AMOUNTS,
    validateGiftOrder,
    type GiftCardDeal,
    type GiftCardOrder,
    type GiftErrors,
    type GiftField,
} from "@/data/gift-cards";
import { useCart } from "@/screens/web/cart-store";
import { useWebSession, WebShell } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { useAddToCart } from "./add-to-cart";
import { Breadcrumb } from "./shop-nav";
import { WebButton } from "./shop-ui";

/**
 * /shop/gift-cards — the gift card builder (Fox "Nov 25 – New Concept", spec
 * tf-fox-ds-v1/docs/handoffs/2026-11-25-gift-cards-for-crane.md §2.1). One page, three numbered
 * steps — 1. an amount (deals first), 2. a design, 3. who it's for — with "Your gift card" beside
 * them: the card face, value, deal bonus, what you pay and Add to cart. Desktop and laptop: two
 * columns, the summary sticky at 360px. Below 1024: one column, the summary at the end and a sticky
 * bottom bar (thumb, You pay, Add to cart).
 *
 * All state lives in the URL (`giftOrderToQuery` / `giftOrderFromQuery`), so every state is a deep
 * link: `?amount=deal-60-for-50|50|custom&custom=75&design=birthday-gift&for=someone|me&delivery=print`
 * plus the recipient fields. `?edit=<cart line>` replaces that line on Add to cart (Edit from the cart);
 * `?errors=1` opens with the field errors showing, as after Add to cart with something missing.
 *
 * Signed out, anyone can build a card: the From box opens with "Your name" and "Your email".
 */

const PATH = "/shop/gift-cards";

const queryOf = (path: string) => new URLSearchParams(path.split("?")[1] ?? "");
const pathnameOf = (path: string) => path.split("?")[0].split("#")[0];

/** "Sagamore Spring" from "Sagamore Spring Golf Club": the club as the card face shows it. */
const clubOnCard = (c: Course) => c.name.replace(/\s+(Golf Club|Golf Course|Country Club)$/i, "");

/** The scrolling page (WebFrame's scroll container) around an element. */
const scrollParent = (el: HTMLElement | null): HTMLElement | null => {
    for (let n = el?.parentElement ?? null; n; n = n.parentElement) {
        const o = getComputedStyle(n).overflowY;
        if (o === "auto" || o === "scroll") return n;
    }
    return null;
};

/** The canonical builder URL for an order (plus the `edit` line and the errors flag). */
const hrefFor = (o: GiftCardOrder, edit: string | undefined, errors: boolean) => `${PATH}${giftOrderToQuery(o, { edit, errors: errors ? "1" : undefined })}`;

/** What a builder URL means, in canonical form (so "/shop/gift-cards" and its defaults compare equal). */
const canonical = (path: string, signedIn: boolean) => {
    const q = queryOf(path);
    return hrefFor(giftOrderFromQuery(q, signedIn), q.get("edit") ?? undefined, q.get("errors") === "1");
};

export const GiftCardBuilderPage = () => {
    const { course, userName } = useWebSession();
    const signedIn = !!userName;
    const { path, navigate, replace } = useWebRouter();
    const cart = useCart();
    const { add, added, dialog } = useAddToCart();
    const rootRef = useRef<HTMLDivElement>(null);

    const [order, setOrder] = useState<GiftCardOrder>(() => giftOrderFromQuery(queryOf(path), signedIn));
    const [editId, setEditId] = useState<string | undefined>(() => queryOf(path).get("edit") ?? undefined);
    const [touched, setTouched] = useState(() => queryOf(path).get("errors") === "1");
    const errors = validateGiftOrder(order);
    const isValid = Object.keys(errors).length === 0;
    const [editingFrom, setEditingFrom] = useState(() => touched && fromHasErrors(errors));
    const show = (f: GiftField) => (touched ? errors[f] : undefined);
    const set = (patch: Partial<GiftCardOrder>) => setOrder((o) => ({ ...o, ...patch }));

    // A custom amount outside $10–$500 isn't a card yet: the summary shows "—".
    const amountOk = !errors.customAmount;
    const value = amountOk ? orderValue(order) : 0;
    const price = amountOk ? orderPrice(order) : 0;
    const bonus = amountOk ? orderBonus(order) : 0;
    const nudge = betterDealFor(order);
    const fromOpen = !signedIn || editingFrom;

    /* ---------------- The URL follows the builder (and the builder follows the URL) ---------------- */

    const href = hrefFor(order, editId, touched && !isValid);
    const written = useRef(path);

    // The URL changed from outside (browser Back/Forward, a deep link while already here): adopt it.
    useEffect(() => {
        if (path === written.current) return;
        written.current = path;
        if (pathnameOf(path) !== PATH) return;
        const q = queryOf(path);
        setOrder(giftOrderFromQuery(q, signedIn));
        setEditId(q.get("edit") ?? undefined);
        setTouched(q.get("errors") === "1");
    }, [path, signedIn]);

    // Choices write back to the URL with the router's replace (debounced, so typing doesn't stack up
    // history), keeping the scroll position: the app scrolls to the top on every path change.
    useEffect(() => {
        if (pathnameOf(path) !== PATH || href === canonical(path, signedIn)) return;
        const t = window.setTimeout(() => {
            const scroller = scrollParent(rootRef.current);
            const top = scroller?.scrollTop ?? 0;
            const winTop = window.scrollY;
            written.current = href;
            flushSync(() => replace(href));
            if (scroller && scroller.scrollTop !== top) scroller.scrollTop = top;
            if (window.scrollY !== winTop) window.scrollTo({ top: winTop });
        }, 400);
        return () => window.clearTimeout(t);
    }, [href, path, replace, signedIn]);

    /* ---------------- Add to cart ---------------- */

    const onAdd = () => {
        setTouched(true);
        if (!isValid) {
            if (fromHasErrors(errors)) setEditingFrom(true);
            return;
        }
        // Edit from the cart: the edited card replaces its line.
        const line = editId ? cart.lines.find((l) => l.product.id === editId) : undefined;
        if (line) cart.remove(line.product.id, line.variant);
        add({ product: giftCardProduct(order, line?.product.id, clubOnCard(course)), variant: "", qty: 1 });
    };

    // Added (straight away, or after "Clear cart and add"): keep the final choices in this history
    // entry so Back from the cart restores them, then go to the cart.
    useEffect(() => {
        if (!added) return;
        const done = hrefFor(order, editId, false);
        if (done !== canonical(path, signedIn)) replace(done);
        navigate("/cart");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [added]);

    const errorNote = touched && !isValid ? <p className="text-sm text-error-primary">Fill in the highlighted fields to continue.</p> : null;
    const addButton = (className?: string) => (
        <WebButton size="lg" iconLeading={ShoppingBag03} onPress={onAdd} className={className}>
            Add to cart
        </WebButton>
    );

    return (
        <WebShell active="shop">
            <WebPage>
                <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Gift cards" }]} />
                <PageHeader
                    className="mt-5"
                    title="Gift cards"
                    subtitle={`Give a round, a lesson or lunch at ${course.name}. Every card is good for ${GOOD_FOR}.`}
                    actions={
                        <WebLink href="/account/wallet" className={cx("mb-1 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            <Wallet02 className="size-4" aria-hidden="true" />
                            Your gift cards
                        </WebLink>
                    }
                />

                <div ref={rootRef} className="mt-6 grid grid-cols-1 gap-6 @tablet:mt-8 @desktop:grid-cols-[minmax(0,1fr)_360px] @desktop:items-start @desktop:gap-8">
                    {/* ------------------------------ Steps ------------------------------ */}
                    <div className="flex min-w-0 flex-col gap-6">
                        <Step n={1} title="Choose an amount">
                            <AriaRadioGroup
                                aria-label="Amount"
                                value={order.amount === "custom" ? null : order.amount}
                                onChange={(amount) => set({ amount })}
                                className="flex flex-col gap-5"
                            >
                                <div className="flex flex-col gap-3">
                                    <SubLabel>Deals</SubLabel>
                                    <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-3">
                                        {GIFT_CARD_DEALS.map((d) => (
                                            <DealTile key={d.id} deal={d} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <SubLabel>Or pick an amount</SubLabel>
                                    <div className="grid grid-cols-2 gap-3 @tablet:grid-cols-4">
                                        {STANDARD_AMOUNTS.map((n) => (
                                            <TileRadio key={n} value={String(n)} className="justify-center px-4 py-3">
                                                <span className="text-lg font-semibold text-primary tabular-nums">{money0(n)}</span>
                                            </TileRadio>
                                        ))}
                                    </div>
                                </div>
                            </AriaRadioGroup>

                            <TextField
                                label="Other amount"
                                icon={CurrencyDollar}
                                placeholder="0.00"
                                inputMode="decimal"
                                value={order.customAmount}
                                onChange={(customAmount) => set({ customAmount, amount: "custom" })}
                                onFocus={() => set({ amount: "custom" })}
                                isInvalid={!!show("customAmount")}
                                errorMessage={show("customAmount")}
                                hint={show("customAmount") ? undefined : `Any amount from $${CUSTOM_MIN} to $${CUSTOM_MAX}.`}
                                className="w-full max-w-xs"
                            />

                            {nudge && (
                                <div className="flex flex-col gap-3 rounded-xl bg-brand-primary_alt p-4 ring-1 ring-brand ring-inset @tablet:flex-row @tablet:items-center @tablet:justify-between">
                                    <p className="text-sm text-secondary">
                                        <span className="font-semibold text-primary">Same {money0(nudge.price)}, bigger card.</span> The deal gets you a {money0(nudge.value)} card instead.
                                    </p>
                                    <WebButton size="sm" color="outline-brand" onPress={() => set({ amount: nudge.id })}>
                                        Switch to the deal
                                    </WebButton>
                                </div>
                            )}
                        </Step>

                        <Step n={2} title="Pick a design">
                            <AriaRadioGroup aria-label="Design" value={order.designId} onChange={(designId) => set({ designId })} className="flex flex-col gap-5">
                                {DESIGN_THEMES.map((t) => (
                                    <div key={t.id} className="flex flex-col gap-2.5">
                                        <p className="text-sm font-medium text-secondary">{t.label}</p>
                                        <div className="grid grid-cols-2 gap-3 @tablet:grid-cols-4">
                                            {CARD_DESIGNS.filter((d) => d.theme === t.id).map((d) => (
                                                <TileRadio key={d.id} value={d.id} className="flex-col p-2">
                                                    <img src={d.art} alt="" className="aspect-[3/2] w-full rounded-lg object-cover" />
                                                    <span className="px-1 pt-2 pb-1 text-sm font-medium text-primary">{d.name}</span>
                                                </TileRadio>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </AriaRadioGroup>
                        </Step>

                        <Step n={3} title="Who's it for?">
                            <AriaRadioGroup aria-label="Who's it for?" value={order.recipient} onChange={(r) => set({ recipient: r as GiftCardOrder["recipient"] })} className="grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                <OptionTile value="someone" icon={Gift01} title="Someone else" text="Send it as a gift, with a note." />
                                <OptionTile value="me" icon={User01} title="Me" text="It's saved to your wallet to spend." />
                            </AriaRadioGroup>

                            {order.recipient === "someone" ? (
                                <div className="flex flex-col gap-6">
                                    <AriaRadioGroup value={order.delivery} onChange={(d) => set({ delivery: d as GiftCardOrder["delivery"] })} className="flex flex-col gap-3">
                                        <AriaLabel className="text-sm font-semibold text-secondary">How should it get there?</AriaLabel>
                                        <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                                            <OptionTile value="email" icon={Mail01} title="Email it to them" text="They get it today, ready to use." />
                                            <OptionTile value="print" icon={Printer} title="Email it to me to print" text="Hand it over yourself." />
                                        </div>
                                    </AriaRadioGroup>

                                    <FromBox order={order} set={set} open={fromOpen} canClose={signedIn} onToggle={() => setEditingFrom((e) => !e)} show={show} />

                                    <div className="flex flex-col gap-3">
                                        <SubLabel>To</SubLabel>
                                        <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                            <TextField label="First name" placeholder="Alex" autoComplete="off" value={order.toFirstName} onChange={(toFirstName) => set({ toFirstName })} isRequired isInvalid={!!show("toFirstName")} errorMessage={show("toFirstName")} />
                                            <TextField label="Last name" placeholder="Rivera" autoComplete="off" value={order.toLastName} onChange={(toLastName) => set({ toLastName })} isRequired isInvalid={!!show("toLastName")} errorMessage={show("toLastName")} />
                                            {order.delivery === "email" && (
                                                <>
                                                    <TextField label="Email" type="email" inputMode="email" icon={Mail01} placeholder="alex.rivera@tenfore.golf" autoComplete="off" value={order.toEmail} onChange={(toEmail) => set({ toEmail })} isRequired isInvalid={!!show("toEmail")} errorMessage={show("toEmail")} />
                                                    <TextField label="Confirm email" type="email" inputMode="email" icon={Mail01} placeholder="alex.rivera@tenfore.golf" autoComplete="off" value={order.toEmailConfirm} onChange={(toEmailConfirm) => set({ toEmailConfirm })} isRequired isInvalid={!!show("toEmailConfirm")} errorMessage={show("toEmailConfirm")} />
                                                    <TextField label="Phone (optional)" type="tel" inputMode="tel" icon={Phone} placeholder="(617) 555-0186" autoComplete="off" value={order.toPhone} onChange={(toPhone) => set({ toPhone })} hint="We'll also text them the card." />
                                                    <TextField label="Confirm phone (optional)" type="tel" inputMode="tel" icon={Phone} placeholder="(617) 555-0186" autoComplete="off" value={order.toPhoneConfirm} onChange={(toPhoneConfirm) => set({ toPhoneConfirm })} isInvalid={!!show("toPhoneConfirm")} errorMessage={show("toPhoneConfirm")} />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <MessageField value={order.message} onChange={(message) => set({ message })} />
                                </div>
                            ) : (
                                !signedIn && (
                                    <div className="flex flex-col gap-4 rounded-xl bg-secondary p-4">
                                        <TextField
                                            label="Your email"
                                            type="email"
                                            inputMode="email"
                                            icon={Mail01}
                                            placeholder="you@tenfore.golf"
                                            value={order.fromEmail}
                                            onChange={(fromEmail) => set({ fromEmail })}
                                            isRequired
                                            isInvalid={!!show("fromEmail")}
                                            errorMessage={show("fromEmail")}
                                            hint={show("fromEmail") ? undefined : "We'll email the card here. Sign in at checkout to save it to your wallet."}
                                            className="@tablet:max-w-sm"
                                        />
                                    </div>
                                )
                            )}
                        </Step>
                    </div>

                    {/* ------------------------------ Summary ------------------------------ */}
                    <aside className="@desktop:sticky @desktop:top-[140px] @desktop:self-start">
                        <Panel title="Your gift card" bodyClassName="flex flex-col gap-4 px-5 py-5">
                            <GiftArtCard designId={order.designId} value={value} clubName={clubOnCard(course)} />
                            <dl className="flex flex-col gap-2.5 text-sm">
                                <Row label="Card value" value={value > 0 ? money(value) : "—"} />
                                {bonus > 0 && <Row label="Deal bonus" value={`+${money(bonus)}`} valueClassName="text-success-primary" />}
                                <div className="mt-1 flex items-baseline justify-between border-t border-secondary pt-3">
                                    <dt className="text-md font-semibold text-primary">You pay</dt>
                                    <dd className="text-md font-semibold text-primary tabular-nums">{price > 0 ? money(price) : "—"}</dd>
                                </div>
                            </dl>
                            <p className="text-xs text-tertiary">{deliveryLine(order)}</p>
                            <div className="hidden flex-col gap-3 @desktop:flex">
                                {addButton("w-full")}
                                {errorNote}
                            </div>
                        </Panel>
                    </aside>
                </div>

                {/* Below 1024: a sticky bar with the card, what you pay and Add to cart */}
                <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-col gap-2 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">
                    {errorNote}
                    <div className="flex items-center gap-3">
                        <GiftArtThumb designId={order.designId} className="w-14" />
                        <div className="min-w-0 flex-1">
                            <p className="text-md font-semibold text-primary tabular-nums">You pay {price > 0 ? money0(price) : "—"}</p>
                            {value > 0 && (
                                <p className="truncate text-xs text-tertiary tabular-nums">
                                    {money0(value)} card{bonus > 0 ? ` · +${money0(bonus)} bonus` : ""}
                                </p>
                            )}
                        </div>
                        {addButton()}
                    </div>
                </div>
            </WebPage>
            {dialog}
        </WebShell>
    );
};

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
    <section className="flex flex-col gap-5 rounded-xl bg-primary p-5 ring-1 ring-secondary ring-inset @tablet:p-6">
        <h2 className="flex items-center gap-3 text-lg font-semibold text-primary">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-solid text-sm font-bold text-white tabular-nums">{n}</span>
            {title}
        </h2>
        {children}
    </section>
);

const SubLabel = ({ children }: { children: ReactNode }) => <p className="text-sm font-semibold text-secondary">{children}</p>;

/** A selectable tile (amounts, designs): brand ring + a check badge when selected. */
const TileRadio = ({ value, isDisabled, check = true, className, children }: { value: string; isDisabled?: boolean; check?: boolean; className?: string; children: ReactNode }) => (
    <AriaRadio
        value={value}
        isDisabled={isDisabled}
        className={({ isSelected, isDisabled: off }) =>
            cx(
                "group relative flex cursor-pointer rounded-xl text-left outline-none transition duration-100 ease-linear ring-inset",
                "data-[focus-visible]:outline-2 data-[focus-visible]:outline-offset-2 data-[focus-visible]:outline-brand",
                isSelected ? "bg-brand-primary_alt ring-2 ring-brand" : "bg-primary ring-1 ring-secondary",
                !isSelected && !off && "hover:bg-primary_hover",
                off && "cursor-not-allowed opacity-50",
                className,
            )
        }
    >
        {({ isSelected }) => (
            <>
                {children}
                {check && isSelected && (
                    <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white shadow-xs">
                        <Check className="size-3" aria-hidden="true" />
                    </span>
                )}
            </>
        )}
    </AriaRadio>
);

const DealTile = ({ deal }: { deal: GiftCardDeal }) => {
    const terms = dealTerms(deal);
    return (
        <TileRadio value={deal.id} isDisabled={deal.soldOut} className="flex-col items-start gap-1 p-4">
            {deal.soldOut ? <StatusBadge tone="gray">Sold out</StatusBadge> : <StatusBadge tone="success">+{money0(deal.value - deal.price)} bonus</StatusBadge>}
            <span className="mt-1 text-sm text-tertiary tabular-nums">Pay {money0(deal.price)}</span>
            <span className="text-lg font-semibold text-primary tabular-nums @wide:text-xl">
                Get a <span className="text-brand-secondary">{money0(deal.value)}</span> card
            </span>
            {terms && (
                <span className="mt-1 flex items-start gap-1.5 text-xs text-tertiary">
                    <Calendar className="mt-px size-3.5 shrink-0 text-fg-quaternary" aria-hidden="true" />
                    {terms}
                </span>
            )}
        </TileRadio>
    );
};

/** "Someone else" / "Me", "Email it to them" / "… to print": a radio dot, an icon, a title and a line. */
const OptionTile = ({ value, icon: Icon, title, text }: { value: string; icon: FC<{ className?: string }>; title: string; text: string }) => (
    <TileRadio value={value} check={false} className="items-start gap-3 p-4">
        <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
            <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Icon className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                {title}
            </span>
            <span className="mt-0.5 text-sm text-tertiary">{text}</span>
        </span>
    </TileRadio>
);

/**
 * From: the signed-in golfer as "**Name** (email)" with Change (→ "Your name" / "Your email", and
 * the link becomes Done). Signed out it's always open, with nothing to change back to.
 */
const FromBox = ({ order, set, open, canClose, onToggle, show }: { order: GiftCardOrder; set: (p: Partial<GiftCardOrder>) => void; open: boolean; canClose: boolean; onToggle: () => void; show: (f: GiftField) => GiftErrors[GiftField] }) => (
    <div className="flex flex-col gap-4 rounded-xl bg-secondary p-4">
        <div className="flex items-start justify-between gap-4">
            <p className="min-w-0 text-sm text-tertiary">
                <span className="block font-semibold text-secondary">From</span>
                {canClose && (
                    <>
                        <span className="font-medium text-primary">{order.fromName.trim() || "—"}</span> ({order.fromEmail.trim() || "no email"})
                    </>
                )}
            </p>
            {canClose && (
                <AriaButton onPress={onToggle} aria-label={open ? "Done" : "Change who it's from"} className={cx("shrink-0 cursor-pointer rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                    {open ? "Done" : "Change"}
                </AriaButton>
            )}
        </div>
        {open && (
            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                <TextField
                    label="Your name"
                    autoComplete="name"
                    value={order.fromName}
                    onChange={(fromName) => set({ fromName })}
                    isRequired
                    isInvalid={!!show("fromName")}
                    errorMessage={show("fromName")}
                    hint={show("fromName") ? undefined : "It's on the card, so they know who it's from."}
                />
                <TextField
                    label="Your email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={order.fromEmail}
                    onChange={(fromEmail) => set({ fromEmail })}
                    isRequired
                    isInvalid={!!show("fromEmail")}
                    errorMessage={show("fromEmail")}
                />
            </div>
        )}
    </div>
);

/** Message (optional): a 300-character textarea with a running count. */
const MessageField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <AriaTextField value={value} onChange={(v) => onChange(v.slice(0, MESSAGE_MAX))} maxLength={MESSAGE_MAX} className="group flex flex-col gap-1.5">
        <AriaLabel className="px-0.5 text-sm font-medium text-secondary">Message (optional)</AriaLabel>
        <AriaTextArea
            rows={3}
            placeholder="Happy birthday! First round's on me."
            className="min-h-24 resize-none rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary outline-none ring-inset transition duration-100 ease-linear placeholder:text-placeholder focus:ring-2 focus:ring-brand"
        />
        <AriaText slot="description" className="px-0.5 text-xs text-tertiary tabular-nums">
            {value.length}/{MESSAGE_MAX} characters · it goes on the card email.
        </AriaText>
    </AriaTextField>
);

const Row = ({ label, value, valueClassName }: { label: string; value: ReactNode; valueClassName?: string }) => (
    <div className="flex justify-between gap-3">
        <dt className="text-tertiary">{label}</dt>
        <dd className={cx("font-medium text-primary tabular-nums", valueClassName)}>{value}</dd>
    </div>
);
