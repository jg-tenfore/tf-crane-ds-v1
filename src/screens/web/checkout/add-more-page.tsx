import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Tag } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { PageHeader, Panel, WebPage } from "@/components/web/web-layout";
import { useWebFrame } from "@/components/web/web-frame";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import { priceOf, type ShopProduct } from "@/data/shop";
import { useCart } from "../cart-store";
import { WebShell } from "../web-shell";
import { itemsLabel, money, recommendationsFor } from "./checkout-data";
import { focusRing, ShipProgress, Thumb } from "./checkout-ui";

const AddOnCard = ({ product, added, onAdd }: { product: ShopProduct; added: boolean; onAdd: () => void }) => (
    <div className="flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-primary ring-1 ring-secondary ring-inset">
            {product.src && <img src={product.src} alt={product.title} className={cx("size-full", product.kind === "food" ? "object-cover" : "object-contain p-5")} loading="lazy" />}
            {product.onSale && (
                <span className="absolute top-3 left-3">
                    <Tag tone="error">Sale</Tag>
                </span>
            )}
        </div>
        <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold text-primary">{product.title}</p>
        <p className="mt-1 flex items-baseline gap-2 text-sm tabular-nums">
            <span className="font-semibold text-primary">{money(priceOf(product))}</span>
            {product.onSale && <span className="text-quaternary line-through">{money(product.price)}</span>}
        </p>
        <Button size="sm" color={added ? "tinted" : "outline"} iconLeading={added ? Check : Plus} onPress={onAdd} className="mt-3 h-9 w-full rounded-lg text-sm">
            {added ? "Added — add another" : "Add to cart"}
        </Button>
    </div>
);

/**
 * Add More — Fox "Shop Checkout / 2. Add More": a "you might also like" grid between the cart
 * and checkout, with a running cart and the free-shipping progress bar.
 */
export const AddMorePage = () => {
    const cart = useCart();
    const { navigate } = useWebRouter();
    const { scrollToTop } = useWebFrame();
    const [added, setAdded] = useState<string[]>([]);
    // Freeze the picks on first render so cards don't jump as items are added.
    const [picks] = useState(() => recommendationsFor(cart.lines, 6));
    const food = cart.kind === "food";

    const go = (path: string) => {
        navigate(path);
        scrollToTop();
    };
    const add = (p: ShopProduct) => {
        const r = cart.add(p);
        if (r.ok) setAdded((a) => (a.includes(p.id) ? a : [...a, p.id]));
    };

    const continueButton = (
        <Button size="lg" fullWidth iconTrailing={ArrowRight} onPress={() => go("/checkout")} isDisabled={cart.count === 0} className="caps h-14 rounded-lg text-[13px]">
            Continue to checkout
        </Button>
    );

    return (
        <WebShell active="shop">
            <WebPage width="content">
                <PageHeader
                    back={
                        <WebLink href="/cart" className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            <ArrowLeft className="size-4" aria-hidden="true" /> Back to cart
                        </WebLink>
                    }
                    eyebrow="Before you check out"
                    title="Add more to your order"
                    subtitle={food ? "Round out the order — it's all made fresh at the Snack Bar." : "You might also like these Pro Shop picks — add a few before you check out."}
                />

                {/* Mobile: progress up top so the goal is visible while browsing */}
                {!food && (
                    <div className="mt-6 rounded-xl bg-primary px-4 py-4 ring-1 ring-secondary ring-inset @desktop:hidden">
                        <ShipProgress subtotal={cart.subtotal} />
                    </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-8 @desktop:mt-8 @desktop:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 @tablet:grid-cols-3 @tablet:gap-x-5">
                        {picks.map((p) => (
                            <AddOnCard key={p.id} product={p} added={added.includes(p.id)} onAdd={() => add(p)} />
                        ))}
                    </div>

                    <aside className="hidden @desktop:sticky @desktop:top-[140px] @desktop:flex @desktop:flex-col @desktop:gap-4 @desktop:self-start">
                        <Panel title={`Your cart · ${itemsLabel(cart.count)}`}>
                            <ul className="divide-y divide-secondary px-5">
                                {cart.lines.map((l) => (
                                    <li key={`${l.product.id}-${l.variant}`} className="flex items-center gap-3 py-3">
                                        <Thumb product={l.product} size="sm" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-primary">{l.product.title}</p>
                                            <p className="text-xs text-tertiary">Qty {l.qty}</p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-primary tabular-nums">{money(priceOf(l.product) * l.qty)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-secondary px-5 py-4">
                                {!food && <ShipProgress subtotal={cart.subtotal} />}
                                <div className={cx("flex items-center justify-between text-md", !food && "mt-4")}>
                                    <span className="font-semibold text-primary">Subtotal</span>
                                    <span className="font-semibold text-primary tabular-nums">{money(cart.subtotal)}</span>
                                </div>
                            </div>
                        </Panel>
                        {continueButton}
                        <WebLink href="/cart" className={cx("self-center rounded text-sm font-semibold text-secondary underline underline-offset-2", focusRing)}>
                            Back to cart
                        </WebLink>
                    </aside>
                </div>

                {/* Mobile / tablet: sticky continue bar */}
                <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-secondary bg-primary px-4 pt-3 pb-4 @tablet:-mx-8 @tablet:px-8 @desktop:hidden">
                    <div className="mb-2 flex items-baseline justify-between text-sm">
                        <span className="text-tertiary">Subtotal · {itemsLabel(cart.count)}</span>
                        <span className="text-lg font-bold text-primary tabular-nums">{money(cart.subtotal)}</span>
                    </div>
                    {continueButton}
                </div>
            </WebPage>
        </WebShell>
    );
};
