import { useLayoutEffect, useState, type ReactNode, type RefObject } from "react";
import { AlertTriangle, Clock, MarkerPin01, Minus, Plus, ShoppingBag01, Trash01 } from "@untitledui/icons";
import { Button as AriaButton, ToggleButton as AriaToggleButton, ToggleButtonGroup as AriaToggleButtonGroup, type Key } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tag } from "@/components/base/badge";
import { Button, type ButtonProps } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter } from "@/components/web/web-router";
import { priceOf, type ShopProduct } from "@/data/shop";
import { useCart, type CartLine } from "../cart-store";
import {
    ALCOHOL_SLUGS,
    BREAKFAST_UNTIL,
    describe,
    fmtDay,
    isHotBreakfast,
    money,
    pickupLocation,
    pickupSummary,
    POPULAR,
    TODAY,
    TOMORROW,
    unavailableLabel,
    type Availability,
    type Day,
    type Pickup,
} from "./restaurant-data";

export const focusRing = "outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60";

/* ------------------------------------------------------------------ */
/* Web-sized button (the shared Button's sizes use the iOS type scale) */
/* ------------------------------------------------------------------ */


export const WebButton = ({ size = "md", ...props }: Omit<ButtonProps, "size"> & { size?: "sm" | "md" | "lg" }) => <Button {...props} size={`web-${size}`} />;

/* ------------------------------------------------------------------ */
/* Sticky offset: the WebHeader is sticky and its height changes with   */
/* the frame width, so measure it instead of hard-coding top-[…].       */
/* ------------------------------------------------------------------ */

export const useHeaderHeight = (ref: RefObject<HTMLElement | null>) => {
    const [h, setH] = useState(0);
    useLayoutEffect(() => {
        const page = ref.current?.closest('[class~="@container"]');
        const header = page?.querySelector("header");
        if (!header) return;
        const ro = new ResizeObserver(() => setH(header.getBoundingClientRect().height));
        ro.observe(header);
        return () => ro.disconnect();
    }, [ref]);
    return h;
};

/* ------------------------------------------------------------------ */
/* Qty stepper                                                          */
/* ------------------------------------------------------------------ */

export const QtyStepper = ({ qty, onChange, label, min = 1, size = "sm" }: { qty: number; onChange: (n: number) => void; label: string; min?: number; size?: "sm" | "md" }) => {
    const btn = cx(
        "flex cursor-pointer items-center justify-center rounded-full text-fg-secondary ring-1 ring-primary ring-inset transition duration-100 ease-linear hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" ? "size-10" : "size-8",
        focusRing,
    );
    return (
        <div role="group" aria-label={`Quantity, ${label}`} className="flex items-center gap-2">
            <AriaButton aria-label="Decrease quantity" isDisabled={qty <= min} onPress={() => onChange(qty - 1)} className={btn}>
                <Minus className="size-4" aria-hidden="true" />
            </AriaButton>
            <span className={cx("text-center font-semibold text-primary tabular-nums", size === "md" ? "w-7 text-lg" : "w-6 text-md")} aria-live="polite">
                {qty}
            </span>
            <AriaButton aria-label="Increase quantity" onPress={() => onChange(qty + 1)} className={btn}>
                <Plus className="size-4" aria-hidden="true" />
            </AriaButton>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Today / Tomorrow switch (Fox's Today / Tomorrow variants)            */
/* ------------------------------------------------------------------ */

export const DaySwitch = ({ value, onChange, todayClosed }: { value: Day; onChange: (d: Day) => void; todayClosed?: boolean }) => (
    <AriaToggleButtonGroup
        aria-label="Order for"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k) onChange(k as Day);
        }}
        className="grid w-full grid-cols-2 gap-1 rounded-lg bg-secondary p-1 ring-1 ring-secondary ring-inset"
    >
        {(
            [
                { id: "today", label: "Today", sub: todayClosed ? "Closed" : fmtDay(TODAY), disabled: todayClosed },
                { id: "tomorrow", label: "Tomorrow", sub: fmtDay(TOMORROW), disabled: false },
            ] as const
        ).map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                isDisabled={o.disabled}
                className={cx(
                    "flex cursor-pointer flex-col items-center rounded-md px-3 py-1.5 transition duration-100 ease-linear disabled:cursor-not-allowed disabled:opacity-50",
                    "text-secondary hover:text-primary data-[selected]:bg-primary data-[selected]:text-primary data-[selected]:shadow-xs data-[selected]:ring-1 data-[selected]:ring-secondary data-[selected]:ring-inset",
                    focusRing,
                )}
            >
                <span className="text-sm font-semibold">{o.label}</span>
                <span className="text-xs text-tertiary">{o.sub}</span>
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);

/* ------------------------------------------------------------------ */
/* Menu item card                                                       */
/* ------------------------------------------------------------------ */

export interface MenuItemCardProps {
    product: ShopProduct;
    avail: Availability;
    /** How many of this item are already in the order. */
    inCart: number;
    onOpen: () => void;
    onAdd: () => void;
}

/** Name, short description, price, photo with an Add button — the whole card opens the item. */
export const MenuItemCard = ({ product, avail, inCart, onOpen, onAdd }: MenuItemCardProps) => {
    const off = !avail.ok;
    return (
        <article
            className={cx(
                "group relative flex gap-4 rounded-xl bg-primary p-4 ring-1 ring-secondary transition duration-100 ease-linear ring-inset",
                off ? "bg-secondary_subtle" : "hover:shadow-sm hover:ring-primary",
            )}
        >
            <div className="flex min-w-0 flex-1 flex-col">
                <h3 className={cx("text-md font-semibold", off ? "text-tertiary" : "text-primary")}>
                    {/* Stretched button: the whole card opens the item dialog. */}
                    <AriaButton onPress={onOpen} isDisabled={off} className={cx("cursor-pointer rounded-sm text-left after:absolute after:inset-0 after:rounded-xl disabled:cursor-default", focusRing)}>
                        {product.title}
                    </AriaButton>
                </h3>
                <div className="mt-1 flex flex-wrap gap-1.5 empty:hidden">
                    {!avail.ok && (
                        <Tag tone={avail.reason === "breakfast-over" ? "warning" : "gray"} variant="soft">
                            {unavailableLabel[avail.reason]}
                        </Tag>
                    )}
                    {avail.ok && POPULAR.has(product.id) && (
                        <Tag tone="brand" variant="soft">
                            Popular
                        </Tag>
                    )}
                    {ALCOHOL_SLUGS.has(product.subgroup) && (
                        <Tag tone="gray" variant="soft">
                            21+
                        </Tag>
                    )}
                </div>
                <p className={cx("mt-1.5 line-clamp-2 text-sm", off ? "text-quaternary" : "text-tertiary")}>{describe(product)}</p>
                <p className={cx("mt-auto pt-3 text-md font-medium tabular-nums", off ? "text-quaternary" : "text-primary")}>{money(priceOf(product))}</p>
            </div>
            <div className="relative shrink-0 self-start">
                <div className="size-24 overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary ring-inset @tablet:size-28">
                    <img src={product.src} alt="" loading="lazy" className={cx("size-full object-cover", off && "opacity-50 grayscale")} />
                </div>
                {!off && (
                    <AriaButton
                        onPress={onAdd}
                        aria-label={inCart ? `Add another ${product.title} (${inCart} in order)` : `Add ${product.title}`}
                        className={cx(
                            "absolute -right-2 -bottom-2 z-10 flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full px-2 text-sm font-semibold shadow-md ring-1 transition duration-100 ease-linear ring-inset",
                            inCart ? "bg-brand-solid text-white ring-transparent hover:bg-brand-solid_hover" : "bg-primary text-primary ring-secondary hover:bg-primary_hover",
                            focusRing,
                        )}
                    >
                        {inCart ? <span className="tabular-nums">{inCart}</span> : <Plus className="size-5" aria-hidden="true" />}
                    </AriaButton>
                )}
            </div>
        </article>
    );
};

/* ------------------------------------------------------------------ */
/* Order summary (rail on desktop, sheet on mobile web)                 */
/* ------------------------------------------------------------------ */

const Thumb = ({ product }: { product: ShopProduct }) => (
    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-secondary ring-1 ring-secondary ring-inset">
        <img src={product.src} alt="" className="size-full object-cover" loading="lazy" />
    </div>
);

const OrderLineRow = ({ line }: { line: CartLine }) => {
    const { setQty, remove } = useCart();
    const each = priceOf(line.product);
    return (
        <li className="flex gap-3 py-3.5">
            <Thumb product={line.product} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary">{line.product.title}</p>
                        {line.variant && <p className="mt-0.5 text-xs text-tertiary">{line.variant}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">{money(each * line.qty)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <QtyStepper qty={line.qty} label={line.product.title} onChange={(n) => setQty(line.product.id, line.variant, n)} />
                    <AriaButton
                        aria-label={`Remove ${line.product.title}`}
                        onPress={() => remove(line.product.id, line.variant)}
                        className={cx("flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-quaternary transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-error-secondary", focusRing)}
                    >
                        <Trash01 className="size-4" aria-hidden="true" />
                    </AriaButton>
                </div>
            </div>
        </li>
    );
};

export const PickupLine = ({ pickup, day, onChange }: { pickup: Pickup; day: Day; onChange?: () => void }) => {
    const s = pickupSummary(pickup, day);
    const loc = pickupLocation(pickup);
    return (
        <div className="flex items-start gap-3 rounded-lg bg-secondary_subtle px-3.5 py-3 ring-1 ring-secondary ring-inset">
            <Clock className="mt-0.5 size-5 shrink-0 text-fg-brand-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">
                    {s.day} · {s.when}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-tertiary">
                    <MarkerPin01 className="size-3.5 shrink-0" aria-hidden="true" />
                    {loc.name} · {loc.short}
                </p>
            </div>
            {onChange && (
                <AriaButton onPress={onChange} className={cx("shrink-0 cursor-pointer rounded-sm text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                    Change
                </AriaButton>
            )}
        </div>
    );
};

export interface OrderSummaryProps {
    pickup: Pickup;
    day: Day;
    readyAt: number;
    onChangePickup: () => void;
    /** Render the Checkout button (the mobile sheet puts it in its footer). */
    showCheckout?: boolean;
}

/** Food lines from the cart + pickup + subtotal. Shows the mixed-cart notice when the cart holds pro shop items. */
export const OrderSummary = ({ pickup, day, readyAt: ready, onChangePickup, showCheckout = true }: OrderSummaryProps) => {
    const cart = useCart();
    const { navigate } = useWebRouter();

    if (cart.kind === "retail") {
        return (
            <div className="flex flex-col gap-4">
                <Notice tone="warning" title="Your cart has pro shop items" className="rounded-lg text-sm">
                    Food &amp; drink orders are made fresh for pickup, so they check out separately. Check out or clear your pro shop cart to start a food order.
                </Notice>
                <WebButton color="outline" size="lg" fullWidth onPress={() => navigate("/cart")} iconLeading={ShoppingBag01}>
                    View cart · {cart.count} {cart.count === 1 ? "item" : "items"}
                </WebButton>
            </div>
        );
    }

    const lateBreakfast = ready >= BREAKFAST_UNTIL && cart.lines.some((l) => isHotBreakfast(l.product));

    return (
        <div className="flex flex-col gap-4">
            <PickupLine pickup={pickup} day={day} onChange={onChangePickup} />
            {cart.lines.length === 0 ? (
                <div className="flex flex-col items-center rounded-lg border border-dashed border-primary px-4 py-8 text-center">
                    <ShoppingBag01 className="size-6 text-fg-quaternary" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold text-primary">Nothing in your order yet</p>
                    <p className="mt-1 text-sm text-tertiary">Add something from the menu — we&rsquo;ll have it ready at pickup.</p>
                </div>
            ) : (
                <ul className="-my-3.5 divide-y divide-secondary">
                    {cart.lines.map((l) => (
                        <OrderLineRow key={`${l.product.id}|${l.variant}`} line={l} />
                    ))}
                </ul>
            )}
            {lateBreakfast && (
                <div className="flex items-start gap-2.5 rounded-lg bg-warning-primary px-3.5 py-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                    <p className="text-sm text-warning-primary">Hot breakfast is served until 11:00 AM. Pick an earlier time or remove it.</p>
                </div>
            )}
            {cart.lines.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-secondary pt-4">
                    <div className="flex items-center justify-between text-md">
                        <span className="text-tertiary">
                            Subtotal · {cart.count} {cart.count === 1 ? "item" : "items"}
                        </span>
                        <span className="font-semibold text-primary tabular-nums">{money(cart.subtotal)}</span>
                    </div>
                    <p className="text-xs text-quaternary">Tax calculated at checkout. Pickup only — no delivery.</p>
                </div>
            )}
            {showCheckout && (
                <WebButton size="lg" fullWidth isDisabled={cart.lines.length === 0 || lateBreakfast} onPress={() => navigate("/cart")}>
                    Checkout{cart.lines.length > 0 && ` · ${money(cart.subtotal)}`}
                </WebButton>
            )}
        </div>
    );
};

/** Sticky "View order · N items · $X" bar for mobile web. Opens the order sheet. */
export const MobileOrderBar = ({ onPress }: { onPress: () => void }) => {
    const cart = useCart();
    if (cart.count === 0) return null;
    const retail = cart.kind === "retail";
    return (
        <div className="sticky bottom-0 z-20 border-t border-secondary bg-primary/95 px-4 pt-3 pb-4 backdrop-blur-sm @desktop:hidden">
            <AriaButton
                onPress={onPress}
                className={cx(
                    "flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-4 text-md font-semibold transition duration-100 ease-linear",
                    retail ? "bg-primary text-secondary ring-1 ring-primary ring-inset" : "bg-brand-solid text-white hover:bg-brand-solid_hover",
                    focusRing,
                )}
            >
                <span className="flex items-center gap-2">
                    <span className={cx("flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm tabular-nums", retail ? "bg-tertiary" : "bg-white/20")}>{cart.count}</span>
                    {retail ? "Pro shop cart" : "View order"}
                </span>
                <span className="tabular-nums">{money(cart.subtotal)}</span>
            </AriaButton>
        </div>
    );
};

/** Mobile web order sheet (WebDialog becomes a bottom sheet under @tablet). */
export const OrderSheet = ({ isOpen, onOpenChange, ...props }: OrderSummaryProps & { isOpen: boolean; onOpenChange: (o: boolean) => void }) => {
    const cart = useCart();
    const { navigate } = useWebRouter();
    const food = cart.kind !== "retail";
    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Your order"
            description={food ? `${cart.count} ${cart.count === 1 ? "item" : "items"} · pickup only` : undefined}
            footer={
                food && (
                    <WebButton
                        size="lg"
                        fullWidth
                        isDisabled={cart.lines.length === 0}
                        onPress={() => {
                            onOpenChange(false);
                            navigate("/cart");
                        }}
                    >
                        Checkout · {money(cart.subtotal)}
                    </WebButton>
                )
            }
        >
            <OrderSummary {...props} showCheckout={false} />
        </WebDialog>
    );
};

/* ------------------------------------------------------------------ */
/* Mixed cart                                                           */
/* ------------------------------------------------------------------ */

export interface MixedCartDialogProps {
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    /** What the golfer just tried to add. */
    product?: ShopProduct | null;
    onClearAndAdd: () => void;
}

/** Food and pro-shop items can't be checked out together — explain it and offer both ways out. */
export const MixedCartDialog = ({ isOpen, onOpenChange, product, onClearAndAdd }: MixedCartDialogProps) => {
    const cart = useCart();
    const { navigate } = useWebRouter();
    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="sm"
            title="Start a food order?"
            description="Food & drinks and pro shop items check out separately."
            footer={
                <>
                    <WebButton
                        color="outline"
                        onPress={() => {
                            onOpenChange(false);
                            navigate("/cart");
                        }}
                    >
                        View cart
                    </WebButton>
                    <WebButton onPress={onClearAndAdd}>Clear cart and add</WebButton>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <p className="text-md text-tertiary">
                    Your cart has {cart.count} pro shop {cart.count === 1 ? "item" : "items"} ({money(cart.subtotal)}). Food orders are made fresh for pickup at the Grill, so they can&rsquo;t share a
                    checkout with merchandise.
                </p>
                {product && (
                    <div className="flex items-center gap-3 rounded-lg bg-secondary_subtle p-3 ring-1 ring-secondary ring-inset">
                        <Thumb product={product} />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-primary">{product.title}</p>
                            <p className="text-xs text-tertiary">Waiting to be added</p>
                        </div>
                    </div>
                )}
                <p className="text-sm text-tertiary">Check out your pro shop items first, or clear the cart to start this food order.</p>
            </div>
        </WebDialog>
    );
};

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

export const MicroLabel = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx("caps text-[11px] text-quaternary", className)}>{children}</p>;
