import { useEffect, useState } from "react";
import { AlertTriangle, Check } from "@untitledui/icons";
import {
    Checkbox as AriaCheckbox,
    CheckboxGroup as AriaCheckboxGroup,
    Label as AriaLabel,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { Tag } from "@/components/base/badge";
import { WebDialog } from "@/components/web/web-dialog";
import { priceOf, type ShopProduct } from "@/data/shop";
import { useCart } from "../cart-store";
import {
    ALCOHOL_SLUGS,
    defaultSelections,
    describe,
    missingGroups,
    modifiersFor,
    money,
    POPULAR,
    pricedProduct,
    sectionBySlug,
    unitPrice,
    upcharge,
    variantLabel,
    type ModGroup,
    type Selections,
} from "./restaurant-data";
import { QtyStepper, WebButton } from "./restaurant-ui";

export interface MenuItemDialogProps {
    product: ShopProduct | null;
    isOpen: boolean;
    onOpenChange: (o: boolean) => void;
    /**
     * Called with the priced product, the encoded variant and qty. Return false to keep the dialog
     * open (e.g. the cart refused a mixed add). Defaults to useCart().add.
     */
    onAdd?: (product: ShopProduct, variant: string, qty: number) => boolean | void;
    /** Story fixture: start with these selections. */
    initialSelections?: Selections;
}

const rowBase = "group flex cursor-pointer items-center gap-3 px-4 py-3 transition duration-100 ease-linear hover:bg-primary_hover data-[focus-visible]:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-50";

const GroupHeader = ({ group, invalid }: { group: ModGroup; invalid: boolean }) => (
    <div className="flex items-start justify-between gap-3 border-b border-secondary bg-secondary_subtle px-4 py-3">
        <div>
            <AriaLabel className="text-md font-semibold text-primary">{group.title}</AriaLabel>
            <p className={cx("text-sm", invalid ? "text-error-primary" : "text-tertiary")}>
                {invalid ? "Choose one to continue" : group.type === "single" ? "Choose 1" : `Choose up to ${group.max ?? group.options.length}`}
            </p>
        </div>
        {group.required ? (
            <Tag tone={invalid ? "error" : "gray"} variant="soft">
                Required
            </Tag>
        ) : (
            <span className="text-xs text-quaternary">Optional</span>
        )}
    </div>
);

const ModGroupField = ({ group, value, onChange, invalid }: { group: ModGroup; value: string[]; onChange: (v: string[]) => void; invalid: boolean }) => {
    const box = cx("overflow-hidden rounded-xl ring-1 ring-inset", invalid ? "ring-error" : "ring-secondary");
    if (group.type === "single") {
        return (
            <AriaRadioGroup value={value[0] ?? null} onChange={(v) => onChange([v])} className={box} isInvalid={invalid}>
                <GroupHeader group={group} invalid={invalid} />
                <div className="divide-y divide-secondary">
                    {group.options.map((o) => (
                        <AriaRadio key={o.id} value={o.id} className={rowBase}>
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary ring-inset group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
                                <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
                            </span>
                            <span className="flex-1 text-md text-primary">{o.label}</span>
                            {o.price ? <span className="text-sm text-tertiary tabular-nums">{upcharge(o.price)}</span> : null}
                        </AriaRadio>
                    ))}
                </div>
            </AriaRadioGroup>
        );
    }
    const max = group.max ?? group.options.length;
    return (
        <AriaCheckboxGroup value={value} onChange={onChange} className={box}>
            <GroupHeader group={group} invalid={false} />
            <div className="divide-y divide-secondary">
                {group.options.map((o) => (
                    <AriaCheckbox key={o.id} value={o.id} isDisabled={!value.includes(o.id) && value.length >= max} className={rowBase}>
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary ring-1 ring-primary ring-inset group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
                            <Check className="size-3.5 text-white opacity-0 group-data-[selected]:opacity-100" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="flex-1 text-md text-primary">{o.label}</span>
                        {o.price ? <span className="text-sm text-tertiary tabular-nums">{upcharge(o.price)}</span> : null}
                    </AriaCheckbox>
                ))}
            </div>
        </AriaCheckboxGroup>
    );
};

/**
 * MenuItemDialog — photo, description, required/optional modifiers (cook temp, add-ons with
 * upcharges, side, drink size), special instructions and qty. "Add $X" puts a priced copy of the
 * product in the cart with the choices encoded in the variant string.
 */
export const MenuItemDialog = ({ product, isOpen, onOpenChange, onAdd, initialSelections }: MenuItemDialogProps) => {
    const cart = useCart();
    const [sel, setSel] = useState<Selections>({});
    const [note, setNote] = useState("");
    const [qty, setQty] = useState(1);
    const [tried, setTried] = useState(false);

    useEffect(() => {
        if (isOpen && product) {
            setSel({ ...defaultSelections(product), ...initialSelections });
            setNote("");
            setQty(1);
            setTried(false);
        }
    }, [isOpen, product, initialSelections]);

    if (!product) return null;
    const groups = modifiersFor(product);
    const missing = missingGroups(product, sel);
    const unit = unitPrice(product, sel);
    const section = sectionBySlug(product.subgroup);
    const alcohol = ALCOHOL_SLUGS.has(product.subgroup);

    const submit = () => {
        if (missing.length > 0) {
            setTried(true);
            return;
        }
        const priced = pricedProduct(product, sel);
        const variant = variantLabel(product, sel, note);
        const keepOpen = onAdd ? onAdd(priced, variant, qty) === false : !cart.add(priced, variant, qty).ok;
        if (!keepOpen) onOpenChange(false);
    };

    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="lg"
            title={product.title}
            description={section?.label}
            footer={
                <>
                    <div className="mr-auto">
                        <QtyStepper qty={qty} onChange={setQty} label={product.title} size="md" />
                    </div>
                    <WebButton size="lg" onPress={submit} className="min-w-44">
                        Add · {money(unit * qty)}
                    </WebButton>
                </>
            }
        >
            <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 @tablet:flex-row @tablet:items-start">
                    <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-secondary ring-1 ring-secondary ring-inset @tablet:aspect-square @tablet:w-44">
                        <img src={product.src} alt={product.title} className="size-full object-cover" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap gap-1.5 empty:hidden">
                            {POPULAR.has(product.id) && (
                                <Tag tone="brand" variant="soft">
                                    Popular
                                </Tag>
                            )}
                            {alcohol && (
                                <Tag tone="gray" variant="soft">
                                    21+
                                </Tag>
                            )}
                        </div>
                        <p className="text-md text-tertiary">{describe(product)}</p>
                        <p className="text-lg font-semibold text-primary tabular-nums">{money(priceOf(product))}</p>
                        {alcohol && (
                            <p className="flex items-start gap-2 text-sm text-tertiary">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-fg-warning-primary" aria-hidden="true" />
                                21 and over. Bring ID — it&rsquo;s checked at pickup, not at checkout.
                            </p>
                        )}
                    </div>
                </div>

                {groups.map((g) => (
                    <ModGroupField key={g.id} group={g} value={sel[g.id] ?? []} onChange={(v) => setSel((s) => ({ ...s, [g.id]: v }))} invalid={tried && missing.includes(g)} />
                ))}

                <AriaTextField value={note} onChange={setNote} className="flex flex-col gap-1.5">
                    <AriaLabel className="text-sm font-medium text-secondary">Special instructions</AriaLabel>
                    <AriaTextArea
                        rows={2}
                        maxLength={140}
                        placeholder="Allergies, extra napkins, cart number…"
                        className="resize-none rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand"
                    />
                    <p className="text-xs text-tertiary">We&rsquo;ll do our best — substitutions can&rsquo;t always be made.</p>
                </AriaTextField>
            </div>
        </WebDialog>
    );
};
