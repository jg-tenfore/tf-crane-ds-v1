import { useState } from "react";
import { ArrowLeft, ArrowRight, ShoppingBag01, Trash01 } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { priceOf, productPath } from "@/data/shop";
import { useCart, type CartLine } from "../cart-store";
import { WebShell } from "../web-shell";
import { computeTotals, itemsLabel, money } from "./checkout-data";
import { focusRing, PromoField, QtyStepper, ShipProgress, Thumb, TotalsBlock } from "./checkout-ui";
import { carryPromo } from "./checkout-session";

export interface CartPageProps {
    /** Start with a promo / gift card applied (story state). */
    promo?: string;
}

const KIND_LABEL = { retail: "Pro Shop", food: "Food & Drinks" } as const;

const CartLineRow = ({ line }: { line: CartLine }) => {
    const { setQty, remove } = useCart();
    const each = priceOf(line.product);
    return (
        <li className="flex gap-4 py-5">
            <WebLink href={productPath(line.product)} aria-label={line.product.title} className={cx("rounded-xl", focusRing)}>
                <Thumb product={line.product} size="lg" />
            </WebLink>
            <div className="flex min-w-0 flex-1 flex-col gap-3 @tablet:flex-row @tablet:items-start @tablet:justify-between">
                <div className="min-w-0">
                    <WebLink href={productPath(line.product)} className={cx("line-clamp-2 rounded text-md font-semibold text-primary hover:underline", focusRing)}>
                        {line.product.title}
                    </WebLink>
                    <p className="mt-0.5 text-sm text-tertiary">{[line.variant, line.qty > 1 ? `${money(each)} each` : ""].filter(Boolean).join(" · ") || money(each)}</p>
                    <div className="mt-3 flex items-center gap-4">
                        <QtyStepper qty={line.qty} label={line.product.title} onChange={(n) => setQty(line.product.id, line.variant, n)} />
                        <AriaButton
                            onPress={() => remove(line.product.id, line.variant)}
                            className={cx("flex cursor-pointer items-center gap-1 rounded text-sm font-medium text-tertiary transition duration-100 ease-linear hover:text-error-primary", focusRing)}
                        >
                            <Trash01 className="size-4" aria-hidden="true" /> Remove
                        </AriaButton>
                    </div>
                </div>
                <p className="shrink-0 text-md font-semibold text-primary tabular-nums @tablet:text-right">{money(each * line.qty)}</p>
            </div>
        </li>
    );
};

/**
 * Cart — Fox "Shop Checkout / 1. Cart" in the Crane Web look, blended with live CraneWeb's
 * cart (YOUR ORDER eyebrow, Clear cart, PROMO CODE, Taxes · Fees · Surcharge, green total).
 */
export const CartPage = ({ promo: initialPromo }: CartPageProps) => {
    const cart = useCart();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const [promo, setPromo] = useState<string | null>(initialPromo ?? null);

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };

    const kinds = [...new Set(cart.lines.map((l) => l.product.kind))];
    const mixed = kinds.length > 1;
    const food = !mixed && cart.kind === "food";
    const totals = computeTotals({ lines: cart.lines, fulfillment: food ? "pickup" : "ship", address: null, promo, shippingKnown: false });
    const freeShip = !food && totals.freeShipping;

    const checkout = () => {
        carryPromo(promo);
        go("/checkout");
    };

    const back = (
        <WebLink href="/shop" className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
            <ArrowLeft className="size-4" aria-hidden="true" /> Continue Shopping
        </WebLink>
    );

    if (cart.lines.length === 0) {
        return (
            <WebShell active="shop">
                <WebPage width="content">
                    <PageHeader back={back} eyebrow="Your order" title="Your Cart" subtitle="Review your items before checkout." />
                    <Panel className="mt-8" bodyClassName="flex flex-col items-center px-6 py-16 text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-brand-primary_alt">
                            <ShoppingBag01 className="size-8 text-fg-brand-primary" aria-hidden="true" />
                        </span>
                        <h2 className="mt-5 text-xl font-semibold text-primary">Your cart is empty</h2>
                        <p className="mt-1.5 max-w-sm text-md text-tertiary">Golf balls, apparel and snack-bar orders you add will show up here.</p>
                        <Button size="lg" className="mt-6 rounded-lg text-md" iconTrailing={ArrowRight} onPress={() => go("/shop")}>
                            Shop the Pro Shop
                        </Button>
                    </Panel>
                </WebPage>
            </WebShell>
        );
    }

    const groups = mixed ? (["retail", "food"] as const).map((k) => ({ kind: k, lines: cart.lines.filter((l) => l.product.kind === k) })) : [{ kind: cart.kind ?? "retail", lines: cart.lines }];

    const checkoutButton = (className?: string) => (
        <Button size="lg" fullWidth isDisabled={mixed} onPress={checkout} className={cx("caps h-14 rounded-lg text-[13px]", className)}>
            Checkout
        </Button>
    );

    return (
        <WebShell active="shop">
            <WebPage width="content">
                <PageHeader back={back} eyebrow="Your order" title="Your Cart" subtitle="Review your items before checkout." />

                <div className="mt-8 grid grid-cols-1 gap-6 @desktop:grid-cols-[minmax(0,1fr)_380px] @desktop:gap-8">
                    {/* Left — lines */}
                    <div className="flex min-w-0 flex-col gap-4">
                        {mixed && (
                            <Notice tone="warning" title="Food & drinks check out separately" className="rounded-lg text-sm">
                                Snack-bar orders are made fresh for pickup at the course, so they can't share an order with pro shop items. Remove one group to check out — you can order the
                                other right after.
                            </Notice>
                        )}
                        {food && (
                            <Notice tone="info" title="Food & drink orders are pickup only" className="rounded-lg text-sm">
                                Everything is made fresh at the Snack Bar. You'll pick it up at the clubhouse window — we'll text you when it's ready.
                            </Notice>
                        )}

                        {groups.map((g) => (
                            <Panel
                                key={g.kind}
                                title={
                                    <span className="flex items-center justify-between gap-3">
                                        <span>{mixed ? `${KIND_LABEL[g.kind]} · ${itemsLabel(g.lines.reduce((n, l) => n + l.qty, 0))}` : itemsLabel(cart.count)}</span>
                                        {mixed && (
                                            <AriaButton
                                                onPress={() => g.lines.forEach((l) => cart.remove(l.product.id, l.variant))}
                                                className={cx("cursor-pointer rounded text-sm font-semibold text-error-primary hover:underline", focusRing)}
                                            >
                                                Remove {KIND_LABEL[g.kind].toLowerCase()}
                                            </AriaButton>
                                        )}
                                    </span>
                                }
                            >
                                {!mixed && !food && (
                                    <div className="border-b border-secondary px-5 py-4">
                                        <ShipProgress
                                            subtotal={totals.subtotal}
                                            action={
                                                !freeShip && (
                                                    <WebLink href="/cart/add-more" className={cx("shrink-0 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                                                        See picks →
                                                    </WebLink>
                                                )
                                            }
                                        />
                                    </div>
                                )}
                                <ul className="divide-y divide-secondary px-5">
                                    {g.lines.map((l) => (
                                        <CartLineRow key={`${l.product.id}-${l.variant}`} line={l} />
                                    ))}
                                </ul>
                            </Panel>
                        ))}

                        <AriaButton onPress={cart.clear} className={cx("cursor-pointer self-start rounded text-sm font-semibold text-tertiary underline underline-offset-2 hover:text-error-primary", focusRing)}>
                            Clear cart
                        </AriaButton>
                    </div>

                    {/* Right — order summary */}
                    <aside className="@desktop:sticky @desktop:top-[140px] @desktop:self-start">
                        <Panel title="Order summary">
                            <div className="border-b border-secondary px-5 py-4">
                                <PromoField applied={promo} onApply={setPromo} onRemove={() => setPromo(null)} />
                            </div>
                            <div className="px-5 py-5">
                                <TotalsBlock
                                    totals={totals}
                                    taxPending="Calculated at checkout"
                                    shippingPending={food ? undefined : "Calculated at checkout"}
                                    totalLabel={food ? "Total" : "Estimated total"}
                                    showCurrency={false}
                                    pickupLabel={food ? "Pickup · Snack Bar" : undefined}
                                />
                            </div>
                        </Panel>
                        <div className="mt-4 hidden flex-col gap-3 @desktop:flex">
                            {checkoutButton()}
                            <p className="text-center text-sm text-tertiary">{mixed ? "Remove one group to check out." : "Payment method and final total are confirmed at checkout."}</p>
                        </div>
                    </aside>
                </div>

                {/* Mobile / tablet: sticky checkout bar */}
                <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">
                    <div className="mb-2 flex items-baseline justify-between text-sm">
                        <span className="text-tertiary">{mixed ? "Remove one group to check out" : `${food ? "Total" : "Estimated total"} · ${itemsLabel(totals.count)}`}</span>
                        <span className="text-lg font-bold text-brand-secondary tabular-nums">{money(totals.total)}</span>
                    </div>
                    {checkoutButton()}
                </div>
            </WebPage>
        </WebShell>
    );
};
