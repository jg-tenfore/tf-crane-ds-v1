import { useEffect, useState } from "react";
import { CheckCircle, XClose } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter, WebLink } from "@/components/web/web-router";
import type { ProductKind, ShopProduct } from "@/data/shop";
import { useCart } from "@/screens/web/cart-store";
import { money, ProductImage, WebButton } from "./shop-ui";

export interface AddRequest {
    product: ShopProduct;
    variant: string;
    qty: number;
}

const kindLabel = (k: ProductKind) => (k === "food" ? "food & drinks" : "pro shop items");

/**
 * Add-to-cart with CraneWeb's rule: food & drinks and pro shop items check out separately.
 * A mixed add opens a dialog ("View cart" / "Clear cart and add"); a good add shows an inline
 * confirmation.
 */
export const useAddToCart = ({ initialAdded, initialMixed }: { initialAdded?: AddRequest; initialMixed?: AddRequest } = {}) => {
    const cart = useCart();
    const { navigate } = useWebRouter();
    const [added, setAdded] = useState<AddRequest | null>(initialAdded ?? null);
    const [mixed, setMixed] = useState<AddRequest | null>(initialMixed ?? null);
    // cart.add() checks the cart kind from the render it was created in, so clear + add in one
    // tick would still be "mixed" — re-add once the cleared cart has rendered.
    const [replay, setReplay] = useState<AddRequest | null>(null);

    useEffect(() => {
        if (!replay || cart.lines.length > 0) return;
        const r = cart.add(replay.product, replay.variant, replay.qty);
        if (r.ok) setAdded(replay);
        setReplay(null);
    }, [replay, cart]);

    const add = (req: AddRequest) => {
        const r = cart.add(req.product, req.variant, req.qty);
        if (r.ok) {
            setAdded(req);
            setMixed(null);
        } else setMixed(req);
    };

    const cartKind = cart.kind ?? (mixed?.product.kind === "food" ? "retail" : "food");

    const dialog = (
        <WebDialog
            isOpen={!!mixed}
            onOpenChange={(o) => !o && setMixed(null)}
            size="sm"
            title={<>Food & drinks and pro shop items check out separately</>}
            description={
                mixed ? (
                    <>
                        Your cart has {kindLabel(cartKind)}. Check out that order first, or clear your cart to add {mixed.product.title}.
                    </>
                ) : null
            }
            footer={
                <>
                    <WebButton color="outline" onPress={() => navigate("/cart")}>
                        View cart
                    </WebButton>
                    <WebButton
                        onPress={() => {
                            if (!mixed) return;
                            cart.clear();
                            setReplay(mixed);
                            setMixed(null);
                        }}
                    >
                        Clear cart and add
                    </WebButton>
                </>
            }
        >
            {cart.lines.length > 0 && (
                <div>
                    <p className="caps mb-3 text-quaternary">In your cart</p>
                    <ul className="flex flex-col gap-3">
                        {cart.lines.slice(0, 3).map((l) => (
                            <li key={`${l.product.id}-${l.variant}`} className="flex items-center gap-3">
                                <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-primary ring-1 ring-secondary ring-inset">
                                    <ProductImage product={l.product} padded={false} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-primary">{l.product.title}</span>
                                    <span className="block text-xs text-tertiary">Qty {l.qty}{l.variant ? ` · ${l.variant}` : ""}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    {cart.lines.length > 3 && <p className="mt-2 text-xs text-tertiary">+{cart.lines.length - 3} more</p>}
                    <p className="mt-4 flex justify-between border-t border-secondary pt-3 text-sm">
                        <span className="text-tertiary">Subtotal · {cart.count} items</span>
                        <span className="font-semibold text-primary tabular-nums">{money(cart.subtotal)}</span>
                    </p>
                </div>
            )}
        </WebDialog>
    );

    return { add, added, dismissAdded: () => setAdded(null), dialog, openMixed: setMixed };
};

/** Inline "Added to cart" confirmation under the Add button. */
export const AddedNotice = ({ req, onDismiss }: { req: AddRequest; onDismiss: () => void }) => {
    const cart = useCart();
    return (
        <div role="status" className="flex items-start gap-3 rounded-xl bg-success-primary px-4 py-3 ring-1 ring-secondary ring-inset">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-fg-success-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-primary">Added to cart</p>
                <p className="mt-0.5 truncate text-sm text-secondary">
                    {req.qty} × {req.product.title}
                    {req.variant ? ` · ${req.variant}` : ""}
                </p>
                <div className="mt-2 flex items-center gap-4">
                    <WebLink href="/cart" className="text-sm font-semibold text-brand-secondary hover:underline">
                        View cart ({cart.count}) · {money(cart.subtotal)}
                    </WebLink>
                    <WebLink href="/checkout" className="text-sm font-semibold text-brand-secondary hover:underline">
                        Checkout
                    </WebLink>
                </div>
            </div>
            <AriaButton aria-label="Dismiss" onPress={onDismiss} className="flex size-7 cursor-pointer items-center justify-center rounded-full text-fg-quaternary outline-none hover:text-fg-secondary focus-visible:ring-2 focus-visible:ring-brand">
                <XClose className="size-4" aria-hidden="true" />
            </AriaButton>
        </div>
    );
};
