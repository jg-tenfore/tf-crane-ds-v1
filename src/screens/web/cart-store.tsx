import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { priceOf, productById, type ProductKind, type ShopProduct } from "@/data/shop";

export interface CartLine {
    product: ShopProduct;
    /** Size / colour / pack label, e.g. "White · L". Empty when the product has none. */
    variant: string;
    qty: number;
}

export type AddResult = { ok: true } | { ok: false; reason: "mixed"; cartKind: ProductKind };

interface CartApi {
    lines: CartLine[];
    count: number;
    subtotal: number;
    /** What the cart currently holds — food and retail can't be checked out together. */
    kind: ProductKind | null;
    add: (product: ShopProduct, variant?: string, qty?: number) => AddResult;
    /** Empty the cart and add this one line (the "Clear cart and add" choice). */
    replaceWith: (product: ShopProduct, variant?: string, qty?: number) => void;
    setQty: (productId: string, variant: string, qty: number) => void;
    remove: (productId: string, variant: string) => void;
    clear: () => void;
}

const CartContext = createContext<CartApi | null>(null);

const sameLine = (l: CartLine, id: string, variant: string) => l.product.id === id && l.variant === variant;

/**
 * Cart for Crane Web. Mirrors live CraneWeb's rule: food & drinks and pro-shop items must
 * be checked out separately — adding across kinds returns { ok: false, reason: "mixed" }
 * so the UI can explain it instead of silently mixing.
 */
export const CartProvider = ({ initial = [], children }: { initial?: CartLine[]; children: ReactNode }) => {
    const [lines, setLinesState] = useState<CartLine[]>(initial);
    // Mutations read/write this ref synchronously, so clear() followed by add() in the same
    // handler sees the empty cart (the mixed-kind check can't use a stale render's lines).
    const ref = useRef(lines);
    const commit = (next: CartLine[]) => {
        ref.current = next;
        setLinesState(next);
    };

    const api = useMemo<CartApi>(() => {
        const kindOf = (ls: CartLine[]) => ls[0]?.product.kind ?? null;
        return {
            lines,
            kind: kindOf(lines),
            count: lines.reduce((n, l) => n + l.qty, 0),
            subtotal: lines.reduce((s, l) => s + priceOf(l.product) * l.qty, 0),
            add: (product, variant = "", qty = 1) => {
                const cur = ref.current;
                const kind = kindOf(cur);
                if (kind && kind !== product.kind) return { ok: false, reason: "mixed", cartKind: kind };
                commit(cur.some((l) => sameLine(l, product.id, variant)) ? cur.map((l) => (sameLine(l, product.id, variant) ? { ...l, qty: l.qty + qty } : l)) : [...cur, { product, variant, qty }]);
                return { ok: true };
            },
            replaceWith: (product, variant = "", qty = 1) => commit([{ product, variant, qty }]),
            setQty: (id, variant, qty) => commit(ref.current.map((l) => (sameLine(l, id, variant) ? { ...l, qty: Math.max(1, qty) } : l))),
            remove: (id, variant) => commit(ref.current.filter((l) => !sameLine(l, id, variant))),
            clear: () => commit([]),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lines]);

    return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
};

/** Outside a CartProvider (single static stories) the cart is empty and read-only. */
export const useCart = (): CartApi =>
    useContext(CartContext) ?? {
        lines: [],
        count: 0,
        subtotal: 0,
        kind: null,
        add: () => ({ ok: true }),
        replaceWith: () => {},
        setQty: () => {},
        remove: () => {},
        clear: () => {},
    };

/** Builds cart lines from ids — handy for story fixtures. */
export const linesFrom = (items: [id: string, variant: string, qty: number][]): CartLine[] =>
    items.flatMap(([id, variant, qty]) => {
        const product = productById(id);
        return product ? [{ product, variant, qty }] : [];
    });
