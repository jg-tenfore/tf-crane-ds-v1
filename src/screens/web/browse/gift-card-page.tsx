import { useState, type ReactNode } from "react";
import { Check, Heart, Share07, ShoppingCart01 } from "@untitledui/icons";
import {
    FieldError as AriaFieldError,
    Input as AriaInput,
    Label as AriaLabel,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
    ToggleButton as AriaToggleButton,
    ToggleButtonGroup as AriaToggleButtonGroup,
    type Key,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { StatusBadge } from "@/components/base/badge";
import { Panel, WebPage } from "@/components/web/web-layout";
import type { ShopProduct } from "@/data/shop";
import { CourseLogo } from "@/screens/chrome/course-logo";
import { useWebSession, WebShell } from "@/screens/web/web-shell";
import { AddedNotice, useAddToCart } from "./add-to-cart";
import { GIFT_DESIGNS, GiftCardFace, PunchCardFace, type GiftDesign } from "./card-tiles";
import { Breadcrumb } from "./shop-nav";
import { money, StarRating, WebButton } from "./shop-ui";

/**
 * Club Offerings purchase pages — ported from Fox's proshop-cards.stories.tsx (Gift Card,
 * Punch Card): a preview + variation rail on the left, purchase details on the right.
 */

/** Gift & punch cards aren't catalog SKUs; the cart gets a synthetic product per amount/pack. */
const offeringProduct = (id: string, title: string, price: number): ShopProduct => ({
    id,
    title,
    category: "equipment",
    subcategory: "club-offerings",
    src: "",
    price,
    onSale: false,
    rating: 4.9,
    reviews: 0,
    inStock: true,
    group: "club-offerings",
    subgroup: "",
    kind: "retail",
    stock: 999,
});

const focus = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/* ------------------------------ Shared bits ------------------------------ */

const WebField = ({ label, value, onChange, placeholder, type = "text", multiline, maxLength, isInvalid, errorMessage, isRequired, inputMode }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean; maxLength?: number; isInvalid?: boolean; errorMessage?: string; isRequired?: boolean; inputMode?: "numeric" | "email" | "text" }) => (
    <AriaTextField value={value} onChange={onChange} type={type} maxLength={maxLength} isInvalid={isInvalid} isRequired={isRequired} inputMode={inputMode} className="group flex flex-col gap-1.5">
        <AriaLabel className="text-sm font-medium text-secondary">
            {label}
            {isRequired && <span className="text-error-primary"> *</span>}
        </AriaLabel>
        {multiline ? (
            <AriaTextArea placeholder={placeholder} rows={3} className="resize-none rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand group-data-[invalid]:ring-error" />
        ) : (
            <AriaInput placeholder={placeholder} className="h-11 rounded-lg bg-primary px-3.5 text-md text-primary ring-1 ring-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand group-data-[invalid]:ring-error" />
        )}
        {multiline && maxLength && (
            <span className="text-right text-xs text-quaternary tabular-nums">
                {value.length}/{maxLength}
            </span>
        )}
        <AriaFieldError className="text-sm text-error-primary">{errorMessage}</AriaFieldError>
    </AriaTextField>
);

const Segmented = <K extends string>({ label, options, value, onChange }: { label: string; options: { key: K; label: string }[]; value: K; onChange: (k: K) => void }) => (
    <AriaToggleButtonGroup
        aria-label={label}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k != null) onChange(String(k) as K);
        }}
        className="flex rounded-lg bg-tertiary p-1"
    >
        {options.map((o) => (
            <AriaToggleButton key={o.key} id={o.key} className={cx("h-9 flex-1 cursor-pointer rounded-md text-sm font-medium text-tertiary transition duration-100 ease-linear data-[selected]:bg-primary data-[selected]:font-semibold data-[selected]:text-primary data-[selected]:shadow-sm", focus)}>
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);

const ShopBrand = () => {
    const { course } = useWebSession();
    return (
        <div className="mb-3 flex items-center gap-2">
            <span className="overflow-hidden rounded-full ring-1 ring-secondary">
                <CourseLogo course={course} size={28} shape="circle" />
            </span>
            <span className="text-sm font-medium text-secondary">{course.shortName ?? course.name} Pro Shop</span>
        </div>
    );
};

const Bullets = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mt-8 border-t border-secondary pt-6">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm text-secondary marker:text-fg-quaternary">
            {items.map((x) => (
                <li key={x}>{x}</li>
            ))}
        </ul>
    </div>
);

const SaveShare = () => {
    const [saved, setSaved] = useState(false);
    const [shared, setShared] = useState(false);
    return (
        <div className="mt-3 grid grid-cols-2 gap-3">
            <WebButton color="outline" size="lg" iconLeading={<Heart className={cx("size-5", saved && "fill-current text-fg-brand-primary")} aria-hidden="true" />} onPress={() => setSaved((s) => !s)}>
                {saved ? "Saved" : "Save"}
            </WebButton>
            <WebButton color="outline" size="lg" iconLeading={shared ? Check : Share07} onPress={() => setShared(true)}>
                {shared ? "Link copied" : "Share"}
            </WebButton>
        </div>
    );
};

const PageScaffold = ({ crumb, children }: { crumb: string; children: ReactNode }) => (
    <WebShell active="shop">
        <WebPage>
            <Breadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Club Offerings", href: "/shop" }, { label: crumb }]} />
            <div className="mt-6 grid grid-cols-1 gap-8 @tablet:mt-8 @desktop:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @desktop:gap-14">{children}</div>
        </WebPage>
    </WebShell>
);

/* ------------------------------ Gift card ------------------------------ */

const PRESETS = [25, 50, 100, 250];
const MIN = 25;
const MAX = 500;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export interface GiftCardPageProps {
    initialAmount?: number;
    initialDesign?: GiftDesign;
    initialRecipient?: { name: string; email: string; message?: string };
}

/** /shop/gift-cards — amount chips + custom amount, design, recipient, message. */
export const GiftCardPage = ({ initialAmount = 100, initialDesign = "classic", initialRecipient }: GiftCardPageProps) => {
    const { course } = useWebSession();
    const [design, setDesign] = useState<GiftDesign>(initialDesign);
    const [amount, setAmount] = useState(initialAmount);
    const [custom, setCustom] = useState("");
    const [method, setMethod] = useState<"email" | "self">("email");
    const [name, setName] = useState(initialRecipient?.name ?? "");
    const [email, setEmail] = useState(initialRecipient?.email ?? "");
    const [message, setMessage] = useState(initialRecipient?.message ?? "");
    const [tried, setTried] = useState(false);
    const { add, added, dismissAdded, dialog } = useAddToCart();

    const value = custom ? Number(custom.replace(/[^0-9.]/g, "")) || 0 : amount;
    const customBad = custom !== "" && (value < MIN || value > MAX);
    const emailBad = method === "email" && !isEmail(email);
    const nameBad = method === "email" && !name.trim();
    const designLabel = GIFT_DESIGNS.find((d) => d.key === design)!.label;

    const onAdd = () => {
        setTried(true);
        if (customBad || value <= 0 || emailBad || nameBad) return;
        const variant = method === "email" ? `${designLabel} · To ${name.trim()} (${email.trim()})` : `${designLabel} · Added to my balance`;
        add({ product: offeringProduct(`gift-card-${value}`, `Digital Gift Card · ${money(value)}`, value), variant, qty: 1 });
    };

    return (
        <PageScaffold crumb="Gift Cards">
            {/* Preview + design variations */}
            <div>
                <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-primary p-6 ring-1 ring-secondary ring-inset @tablet:min-h-[380px] @tablet:p-10">
                    <GiftCardFace course={course} design={design} amount={money(value)} to={method === "email" && name.trim() ? name.trim() : undefined} width={340} className="max-w-full" />
                </div>
                <div role="radiogroup" aria-label="Card design" className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto">
                    {GIFT_DESIGNS.map((d) => (
                        <button
                            key={d.key}
                            type="button"
                            role="radio"
                            aria-checked={design === d.key}
                            onClick={() => setDesign(d.key)}
                            className={cx("flex shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-xl bg-primary p-2 transition duration-100 ease-linear ring-inset", design === d.key ? "ring-2 ring-brand" : "ring-1 ring-secondary hover:ring-brand", focus)}
                        >
                            <GiftCardFace course={course} design={d.key} amount={money(value)} width={96} />
                            <span className={cx("text-xs font-medium", design === d.key ? "text-primary" : "text-tertiary")}>{d.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Details */}
            <div className="flex flex-col">
                <ShopBrand />
                <h1 className="text-display-xs font-semibold tracking-[-0.3px] text-primary @tablet:text-display-sm">Digital Gift Card</h1>
                <StarRating rating={4.9} count={128} size="md" className="mt-2" />
                <p className="mt-4 text-md text-tertiary">Good for tee times, lessons, the pro shop and the snack bar. Never expires.</p>

                <div className="mt-6">
                    <p className="mb-2.5 text-sm font-semibold text-primary">Amount</p>
                    <div role="radiogroup" aria-label="Amount" className="grid grid-cols-4 gap-2">
                        {PRESETS.map((p) => {
                            const on = !custom && amount === p;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    role="radio"
                                    aria-checked={on}
                                    onClick={() => {
                                        setAmount(p);
                                        setCustom("");
                                    }}
                                    className={cx("h-11 cursor-pointer rounded-lg text-sm font-semibold tabular-nums ring-1 transition duration-100 ease-linear ring-inset", on ? "bg-primary-solid text-white ring-transparent" : "bg-primary text-secondary ring-primary hover:bg-primary_hover", focus)}
                                >
                                    ${p}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 max-w-xs">
                        <WebField label="Custom amount" placeholder={`$${MIN} – $${MAX}`} value={custom} onChange={setCustom} inputMode="numeric" isInvalid={customBad} errorMessage={`Enter an amount from $${MIN} to $${MAX}.`} />
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <Segmented
                        label="Delivery"
                        options={[
                            { key: "email", label: "Email a recipient" },
                            { key: "self", label: "Add to my balance" },
                        ]}
                        value={method}
                        onChange={setMethod}
                    />
                    {method === "email" ? (
                        <>
                            <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                                <WebField label="Recipient name" placeholder="Jane Doe" value={name} onChange={setName} isRequired isInvalid={tried && nameBad} errorMessage="Add the recipient’s name." />
                                <WebField label="Recipient email" type="email" inputMode="email" placeholder="jane@tenfore.golf" value={email} onChange={setEmail} isRequired isInvalid={tried && emailBad} errorMessage="Enter a valid email address." />
                            </div>
                            <WebField label="Message (optional)" multiline maxLength={200} placeholder="Happy birthday — see you on the course!" value={message} onChange={setMessage} />
                        </>
                    ) : (
                        <p className="rounded-xl bg-primary px-4 py-3 text-sm text-secondary ring-1 ring-secondary ring-inset">The balance is added to your {course.shortName ?? course.name} account as soon as you check out.</p>
                    )}
                </div>

                <div className="mt-6">
                    <WebButton size="lg" fullWidth iconLeading={ShoppingCart01} isDisabled={value <= 0} onPress={onAdd}>
                        Add to cart · {money(value)}
                    </WebButton>
                </div>
                {added && (
                    <div className="mt-4">
                        <AddedNotice req={added} onDismiss={dismissAdded} />
                    </div>
                )}
                <SaveShare />

                <Bullets
                    title="Details"
                    items={["Redeemable for tee times, the pro shop, lessons and the snack bar", "Delivered instantly by email, or added to your account balance", "Choose from four card designs", "Never expires — no fees"]}
                />
            </div>
            {dialog}
        </PageScaffold>
    );
};

/* ------------------------------ Punch card ------------------------------ */

const WALK_UP = 60;
/** Green-fee packs; the 20-round matches the "20-Round Green Fee Card" Club Offering. */
export const PUNCH_PACKS = [
    { rounds: 5, price: 280 },
    { rounds: 10, price: 540 },
    { rounds: 20, price: 1040, best: true },
];

const DetailRow = ({ label, value, emphasis }: { label: string; value: ReactNode; emphasis?: boolean }) => (
    <div className="flex items-center justify-between gap-3 py-2.5">
        <span className="text-sm text-tertiary">{label}</span>
        <span className={cx("text-sm tabular-nums", emphasis ? "font-semibold text-brand-secondary" : "font-medium text-primary")}>{value}</span>
    </div>
);

/** /shop/punch-cards — pick a pack, see per-round savings, add to cart; shows your active card. */
export const PunchCardPage = ({ initialRounds = 20, hasActiveCard = true }: { initialRounds?: number; hasActiveCard?: boolean }) => {
    const [rounds, setRounds] = useState(initialRounds);
    const pack = PUNCH_PACKS.find((p) => p.rounds === rounds) ?? PUNCH_PACKS[PUNCH_PACKS.length - 1];
    const perRound = pack.price / pack.rounds;
    const save = WALK_UP * pack.rounds - pack.price;
    const { add, added, dismissAdded, dialog } = useAddToCart();

    return (
        <PageScaffold crumb="Punch Cards">
            <div>
                <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-primary p-6 ring-1 ring-secondary ring-inset @tablet:min-h-[380px] @tablet:p-10">
                    <PunchCardFace rounds={pack.rounds} title={`${pack.rounds}-Round Green Fee Card`} className="max-w-[420px] bg-secondary" />
                </div>
                <div role="radiogroup" aria-label="Rounds" className="mt-4 grid grid-cols-3 gap-3">
                    {PUNCH_PACKS.map((p) => {
                        const on = p.rounds === pack.rounds;
                        return (
                            <button
                                key={p.rounds}
                                type="button"
                                role="radio"
                                aria-checked={on}
                                onClick={() => setRounds(p.rounds)}
                                className={cx("relative cursor-pointer rounded-xl py-3 text-center transition duration-100 ease-linear ring-inset", on ? "bg-brand-primary_alt ring-2 ring-brand" : "bg-primary ring-1 ring-secondary hover:ring-brand", focus)}
                            >
                                <span className={cx("block text-xl font-bold tabular-nums", on ? "text-brand-secondary" : "text-primary")}>{p.rounds}</span>
                                <span className="caps block text-[10px] text-tertiary">rounds</span>
                                <span className="mt-1 block text-xs font-medium text-secondary tabular-nums">{money(p.price)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col">
                <ShopBrand />
                <h1 className="text-display-xs font-semibold tracking-[-0.3px] text-primary @tablet:text-display-sm">{pack.rounds}-Round Green Fee Card</h1>
                <StarRating rating={4.8} count={64} size="md" className="mt-2" />
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="text-display-xs font-semibold text-primary tabular-nums">{money(pack.price)}</span>
                    <span className="text-md text-tertiary tabular-nums">{money(perRound)} / round</span>
                    <StatusBadge tone="success" className="text-sm">
                        Save {money(save)}
                    </StatusBadge>
                </div>
                {pack.best && <p className="caps mt-3 text-brand-secondary">Best value</p>}

                <div className="mt-6">
                    <WebButton size="lg" fullWidth iconLeading={ShoppingCart01} onPress={() => add({ product: offeringProduct(`punch-card-${pack.rounds}`, `${pack.rounds}-Round Green Fee Card`, pack.price), variant: "", qty: 1 })}>
                        Add to cart · {money(pack.price)}
                    </WebButton>
                </div>
                {added && (
                    <div className="mt-4">
                        <AddedNotice req={added} onDismiss={dismissAdded} />
                    </div>
                )}
                <SaveShare />

                <Bullets
                    title="How it works"
                    items={[
                        "One round is punched automatically each time you check in",
                        "Show your QR code in the Crane app at the register — nothing extra to pay",
                        `Save ${money(WALK_UP - perRound)} per round versus the ${money(WALK_UP)} walk-up rate`,
                        "Valid for one year from purchase",
                    ]}
                />

                {hasActiveCard && (
                    <Panel title="Your active card" className="mt-8" bodyClassName="p-5">
                        <PunchCardFace rounds={10} used={4} title="10-Round Green Fee Card" className="bg-secondary" />
                        <div className="mt-4 divide-y divide-border-secondary">
                            <DetailRow label="Card number" value={<span className="font-mono">#SG-10-4821</span>} />
                            <DetailRow label="Rate" value={`${money(54)} / round`} />
                            <DetailRow label="Expires" value="May 2, 2027" />
                            <DetailRow label="Rounds remaining" value="6 of 10" emphasis />
                        </div>
                    </Panel>
                )}
            </div>
            {dialog}
        </PageScaffold>
    );
};
