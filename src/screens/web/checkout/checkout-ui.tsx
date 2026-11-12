import { useState, type FC, type ReactNode } from "react";
import { Droplets01, HelpCircle, Minus, Plus, ShoppingBag01, Tag01 } from "@untitledui/icons";
import {
    Button as AriaButton,
    Checkbox as AriaCheckbox,
    Radio as AriaRadio,
    Tooltip as AriaTooltip,
    TooltipTrigger as AriaTooltipTrigger,
    type RadioProps as AriaRadioProps,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { TextField, type TextFieldProps } from "@/components/forms/text-field";
import { FREE_SHIPPING_THRESHOLD, priceOf, type ShopProduct } from "@/data/shop";
import type { CartLine } from "../cart-store";
import { FEE_RATE, itemsLabel, money, pct, SURCHARGE_RATE, type CardBrand, type Totals } from "./checkout-data";

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/* ---------- Product thumbnail (handles products without photography) ---------- */

export const Thumb = ({ product, size = "md", qty }: { product: ShopProduct; size?: "sm" | "md" | "lg"; qty?: number }) => {
    const dim = { sm: "size-12 rounded-lg", md: "size-14 rounded-lg", lg: "size-20 rounded-xl" }[size];
    const Icon = product.subgroup === "drinks" || /drink|beer|wine|alcohol/.test(product.subgroup) ? Droplets01 : ShoppingBag01;
    return (
        <div className="relative shrink-0">
            <div className={cx("flex items-center justify-center overflow-hidden bg-secondary ring-1 ring-secondary ring-inset", dim)}>
                {product.src ? (
                    <img src={product.src} alt="" className={cx("size-full", product.kind === "food" ? "object-cover" : "object-contain p-1.5")} loading="lazy" />
                ) : (
                    <Icon className="size-1/2 text-fg-quaternary" aria-hidden="true" />
                )}
            </div>
            {qty != null && qty > 1 && (
                <span className="absolute -top-2 -right-2 z-10 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-solid px-1 text-[11px] font-semibold text-white tabular-nums ring-2 ring-bg-primary">
                    {qty}
                </span>
            )}
        </div>
    );
};

/* ---------- Quantity stepper ---------- */

export const QtyStepper = ({ qty, onChange, label }: { qty: number; onChange: (n: number) => void; label: string }) => {
    const btn = cx("flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-secondary ring-1 ring-primary ring-inset transition duration-100 ease-linear hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50", focusRing);
    return (
        <div role="group" aria-label={`Quantity, ${label}`} className="flex items-center gap-2">
            <AriaButton aria-label="Decrease quantity" isDisabled={qty <= 1} onPress={() => onChange(qty - 1)} className={btn}>
                <Minus className="size-4" aria-hidden="true" />
            </AriaButton>
            <span className="w-6 text-center text-md font-semibold text-primary tabular-nums" aria-live="polite">
                {qty}
            </span>
            <AriaButton aria-label="Increase quantity" onPress={() => onChange(qty + 1)} className={btn}>
                <Plus className="size-4" aria-hidden="true" />
            </AriaButton>
        </div>
    );
};

/* ---------- Help tooltip ---------- */

export const HelpTip = ({ label, children }: { label: string; children: ReactNode }) => (
    <AriaTooltipTrigger delay={150}>
        <AriaButton aria-label={label} className={cx("inline-flex cursor-help rounded-full text-fg-quaternary hover:text-fg-quaternary_hover", focusRing)}>
            <HelpCircle className="size-4" aria-hidden="true" />
        </AriaButton>
        <AriaTooltip offset={8} className="max-w-[260px] rounded-lg bg-primary-solid px-3 py-2 text-xs leading-[18px] text-white shadow-lg data-[entering]:animate-in data-[entering]:fade-in">
            {children}
        </AriaTooltip>
    </AriaTooltipTrigger>
);

/* ---------- Summary rows ---------- */

export const SummaryRow = ({ label, value, help, tone, className }: { label: ReactNode; value: ReactNode; help?: ReactNode; tone?: "success" | "muted"; className?: string }) => (
    <div className={cx("flex items-start justify-between gap-4 text-md", className)}>
        <span className="min-w-0 text-tertiary">
            {label}
            {help && <span className="ml-1.5 inline-flex translate-y-[3px]">{help}</span>}
        </span>
        <span className={cx("shrink-0 text-right tabular-nums", tone === "success" ? "font-medium text-success-primary" : tone === "muted" ? "text-quaternary italic" : "font-medium text-primary")}>
            {value}
        </span>
    </div>
);

export const FeesHelp = () => (
    <HelpTip label="About fees">
        A {pct(FEE_RATE)} course service fee on merchandise. It supports online ordering and is set by the course.
    </HelpTip>
);

export const SurchargeHelp = () => (
    <HelpTip label="About the surcharge">
        A {pct(SURCHARGE_RATE)} card-processing surcharge, as allowed in Massachusetts. It's never more than the course's cost to accept cards.
    </HelpTip>
);

/**
 * The totals block shared by Cart, Checkout and Confirmation. `taxPending` is what the row says
 * before tax can be known ("Calculated at checkout" / "Calculated after address").
 */
export const TotalsBlock = ({
    totals,
    taxPending = "Calculated after address",
    shippingPending,
    totalLabel = "Total",
    showCurrency = true,
    pickupLabel,
}: {
    totals: Totals;
    taxPending?: string;
    /** When shipping isn't known yet (cart). Omit to hide the row (pickup). */
    shippingPending?: string;
    totalLabel?: string;
    showCurrency?: boolean;
    /** Pickup orders: a "Pickup · Pro Shop — Free" row in place of shipping. */
    pickupLabel?: string;
}) => (
    <div className="flex flex-col gap-3">
        <SummaryRow label={`Subtotal · ${itemsLabel(totals.count)}`} value={money(totals.subtotal)} />
        {totals.promoDiscount > 0 && <SummaryRow label="Discount" value={`−${money(totals.promoDiscount)}`} tone="success" />}
        {totals.rewardDiscount > 0 && <SummaryRow label="Rewards" value={`−${money(totals.rewardDiscount)}`} tone="success" />}
        {pickupLabel && <SummaryRow label={pickupLabel} value="Free" tone="success" />}
        {totals.shipping != null ? (
            <SummaryRow label="Shipping · Ground" value={totals.shipping === 0 ? "Free" : money(totals.shipping)} tone={totals.shipping === 0 ? "success" : undefined} />
        ) : (
            shippingPending && <SummaryRow label="Shipping" value={shippingPending} tone="muted" />
        )}
        {totals.taxQuote ? (
            <SummaryRow
                label={totals.taxQuote.label}
                value={money(totals.tax ?? 0)}
                help={
                    <HelpTip label="About tax">
                        Sales tax is charged where the order goes: state, county and city combined. Pickup orders are taxed at the course.
                    </HelpTip>
                }
            />
        ) : (
            <SummaryRow label="Taxes" value={taxPending} tone="muted" />
        )}
        <SummaryRow label="Fees" value={money(totals.fees)} help={<FeesHelp />} />
        <SummaryRow label="Surcharge" value={money(totals.surcharge)} help={<SurchargeHelp />} />
        <div className="mt-1 flex items-baseline justify-between border-t border-secondary pt-4">
            <span className="text-lg font-semibold text-primary">{totalLabel}</span>
            <span className="text-xl font-bold text-brand-secondary tabular-nums">
                {showCurrency && <span className="mr-1.5 text-xs font-medium text-tertiary">USD</span>}
                {money(totals.total)}
            </span>
        </div>
    </div>
);

/* ---------- Free-shipping progress (Fox ShipProgress) ---------- */

export const ShipProgress = ({ subtotal, action }: { subtotal: number; action?: ReactNode }) => {
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const ratio = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <p className={cx("text-sm font-medium", remaining > 0 ? "text-brand-secondary" : "text-success-primary")}>
                    {remaining > 0 ? `Add ${money(remaining)} for free shipping` : "You've unlocked free shipping!"}
                </p>
                {action}
            </div>
            <div
                role="meter"
                aria-label="Progress to free shipping"
                aria-valuemin={0}
                aria-valuemax={FREE_SHIPPING_THRESHOLD}
                aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
                className="mt-2 h-2 w-full overflow-hidden rounded-full bg-tertiary"
            >
                <div className="h-full rounded-full bg-brand-solid transition-[width] duration-300 ease-out" style={{ width: `${ratio * 100}%` }} />
            </div>
        </div>
    );
};

/* ---------- Fields ---------- */

/** Crane's TextField — it switches to web sizing (44px, text-md, rounded-lg) inside WebFrame by itself. */
export const WebField = (props: TextFieldProps) => <TextField {...props} />;

/** Promo / gift-card field with the applied state (Fox cart). */
export const PromoField = ({ applied, onApply, onRemove, label = "Promo code" }: { applied: string | null; onApply: (code: string) => void; onRemove: () => void; label?: string }) => {
    const [code, setCode] = useState("");
    if (applied) {
        return (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-success-primary px-3 py-2.5">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-success-primary">
                    <Tag01 className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{applied} applied</span>
                </span>
                <AriaButton onPress={onRemove} aria-label={`Remove ${applied}`} className={cx("flex cursor-pointer items-center gap-1 rounded text-sm font-semibold text-secondary underline underline-offset-2", focusRing)}>
                    Remove
                </AriaButton>
            </div>
        );
    }
    return (
        <div>
            <div className="caps mb-2 text-quaternary">{label}</div>
            <form
                className="flex items-start gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (code.trim()) onApply(code.trim().toUpperCase());
                }}
            >
                <WebField aria-label="Promo code or gift card" placeholder="Promo code or gift card" value={code} onChange={setCode} className="min-w-0 flex-1" />
                <Button type="submit" size="md" color="outline-brand" isDisabled={!code.trim()} className="h-11 rounded-lg text-md">
                    Apply
                </Button>
            </form>
        </div>
    );
};

/* ---------- Choice rows (radio) ---------- */

export const RadioDot = () => (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
        <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
    </span>
);

/** A selectable row inside a RadioGroup: dot + content, tinted when selected. */
export const ChoiceRow = ({ children, className, muted, ...props }: Omit<AriaRadioProps, "children" | "className"> & { children: ReactNode; className?: string; muted?: boolean }) => (
    <AriaRadio
        {...props}
        className={cx(
            "group flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 ring-1 ring-transparent transition duration-100 ease-linear ring-inset hover:bg-primary_hover data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60",
            "data-[selected]:bg-brand-primary_alt data-[selected]:ring-brand data-[selected]:hover:bg-brand-primary_alt",
            "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
            muted && "opacity-60",
            className,
        )}
    >
        <RadioDot />
        <div className="min-w-0 flex-1">{children}</div>
    </AriaRadio>
);

export const WebCheckbox = ({ children, defaultSelected, isSelected, onChange }: { children: ReactNode; defaultSelected?: boolean; isSelected?: boolean; onChange?: (v: boolean) => void }) => (
    <AriaCheckbox defaultSelected={defaultSelected} isSelected={isSelected} onChange={onChange} className="group flex cursor-pointer items-center gap-2.5 text-sm text-secondary">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary ring-1 ring-primary ring-inset group-data-[focus-visible]:ring-4 group-data-[focus-visible]:ring-brand-300/60 group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
            <svg viewBox="0 0 14 14" className="size-3.5 text-white opacity-0 group-data-[selected]:opacity-100" fill="none" aria-hidden="true">
                <path d="M11.667 3.5 5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
        {children}
    </AriaCheckbox>
);

/* ---------- Card brands ---------- */

export const BrandChip = ({ brand, className }: { brand: CardBrand; className?: string }) => (
    <img src={`card-images/${brand}.svg`} alt={brand === "Amex" ? "American Express" : brand} className={cx("h-6 w-auto shrink-0", className)} />
);

/* ---------- Order lines (checkout summary / confirmation) ---------- */

export const OrderLines = ({ lines }: { lines: CartLine[] }) => (
    <ul className="flex flex-col gap-4">
        {lines.map((l) => (
            <li key={`${l.product.id}-${l.variant}`} className="flex items-center gap-3">
                <Thumb product={l.product} qty={l.qty} />
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-primary">{l.product.title}</p>
                    <p className="text-xs text-tertiary">{[l.variant, l.qty > 1 ? `Qty ${l.qty}` : ""].filter(Boolean).join(" · ") || "Qty 1"}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">{money(priceOf(l.product) * l.qty)}</span>
            </li>
        ))}
    </ul>
);

/** Section label used inside checkout panels ("Ship to", "Payment"). */
export const PanelSection = ({ label, icon: Icon, right, children, className }: { label: ReactNode; icon?: FC<{ className?: string }>; right?: ReactNode; children?: ReactNode; className?: string }) => (
    <section className={cx("flex flex-col gap-3 px-5 py-5 @tablet:px-6", className)}>
        <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
                {Icon && <Icon className="size-5 text-fg-quaternary" />}
                {label}
            </h2>
            {right}
        </div>
        {children}
    </section>
);

