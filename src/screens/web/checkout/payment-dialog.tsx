import { useState } from "react";
import { HelpCircle, Lock01 } from "@untitledui/icons";
import { RadioGroup as AriaRadioGroup } from "react-aria-components";
import { Button } from "@/components/base/button";
import { WebDialog } from "@/components/web/web-dialog";
import { USER } from "@/data/crane";
import { addressLine, type Address, type SavedPayment } from "./checkout-data";
import { BrandChip, ChoiceRow, WebCheckbox, WebField } from "./checkout-ui";

export interface PaymentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (payment: SavedPayment) => void;
    /** The ship-to address, offered as the billing address. */
    billTo: Address | null;
}

const brandFor = (num: string): SavedPayment["brand"] => (/^3[47]/.test(num) ? "Amex" : /^5[1-5]|^2[2-7]/.test(num) ? "Mastercard" : "Visa");
const groupCard = (v: string) =>
    v
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(\d{4})(?=\d)/g, "$1 ");

let nextId = 1;

/** Payment methods — Fox's "Pay another way" modal: card form, bill-to, PayPal. */
export const PaymentDialog = ({ isOpen, onOpenChange, onSave, billTo }: PaymentDialogProps) => {
    const [method, setMethod] = useState<"card" | "paypal">("card");
    const [number, setNumber] = useState("");
    const [exp, setExp] = useState("");
    const [cvc, setCvc] = useState("");
    const [name, setName] = useState(`${USER.firstName} ${USER.lastName}`);
    const [nickname, setNickname] = useState("");
    const [sameAsShip, setSameAsShip] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    const digits = number.replace(/\D/g, "");
    const errors = {
        number: digits.length < 15 ? "Enter a valid card number" : "",
        exp: !/^(0[1-9]|1[0-2]) ?\/ ?\d{2}$/.test(exp.trim()) ? "Use MM / YY" : "",
        cvc: !/^\d{3,4}$/.test(cvc) ? "3 or 4 digits" : "",
    };
    const err = (k: keyof typeof errors) => (submitted && method === "card" && errors[k] ? { isInvalid: true, errorMessage: errors[k] } : {});

    const save = () => {
        if (method === "paypal") {
            onSave({ id: `pm-paypal-${nextId++}`, brand: "PayPal", name: "PayPal" });
            onOpenChange(false);
            return;
        }
        setSubmitted(true);
        if (Object.values(errors).some(Boolean)) return;
        const brand = brandFor(digits);
        onSave({ id: `pm-new-${nextId++}`, brand, name: nickname.trim() || (brand === "Amex" ? "American Express" : brand), last4: digits.slice(-4) });
        onOpenChange(false);
    };

    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Payment methods"
            size="md"
            footer={
                <>
                    <Button size="md" color="outline" onPress={() => onOpenChange(false)} className="h-11 rounded-lg text-md">
                        Cancel
                    </Button>
                    <Button size="md" onPress={save} className="h-11 rounded-lg text-md">
                        {method === "paypal" ? "Continue with PayPal" : "Save card"}
                    </Button>
                </>
            }
        >
            <AriaRadioGroup aria-label="Payment method" value={method} onChange={(v) => setMethod(v as "card" | "paypal")} className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-xl ring-1 ring-secondary ring-inset">
                    <ChoiceRow value="card" className="rounded-none ring-0 data-[selected]:ring-0">
                        <span className="flex items-center justify-between gap-3">
                            <span className="text-md font-semibold text-primary">Credit card</span>
                            <span className="flex items-center gap-1.5">
                                <BrandChip brand="Visa" />
                                <BrandChip brand="Mastercard" />
                                <BrandChip brand="Amex" />
                                <span className="rounded bg-tertiary px-1.5 py-0.5 text-[11px] font-bold text-secondary">+5</span>
                            </span>
                        </span>
                    </ChoiceRow>
                    {method === "card" && (
                        <div className="flex flex-col gap-3 border-t border-secondary p-4">
                            <WebField aria-label="Card number" placeholder="Card number" icon={Lock01} inputMode="numeric" value={number} onChange={(v) => setNumber(groupCard(v))} {...err("number")} />
                            <div className="grid grid-cols-2 gap-3">
                                <WebField aria-label="Expiration date" placeholder="Expiration (MM / YY)" value={exp} onChange={setExp} {...err("exp")} />
                                <WebField
                                    aria-label="Security code"
                                    placeholder="Security code"
                                    inputMode="numeric"
                                    value={cvc}
                                    onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
                                    trailing={<HelpCircle className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />}
                                    {...err("cvc")}
                                />
                            </div>
                            <WebField label="Name on card" value={name} onChange={setName} />
                            <WebField aria-label="Nickname" placeholder="Nickname (optional)" value={nickname} onChange={setNickname} />
                        </div>
                    )}
                </div>

                {method === "card" && (
                    <div className="rounded-xl px-4 py-3.5 ring-1 ring-secondary ring-inset">
                        <div className="flex gap-6">
                            <span className="w-14 shrink-0 text-sm text-tertiary">Bill to</span>
                            {billTo && sameAsShip ? (
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-primary">{billTo.name}</p>
                                    <p className="text-sm text-tertiary">{addressLine(billTo)}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-tertiary">Billing address ZIP is checked with your card issuer.</p>
                            )}
                        </div>
                        {billTo && (
                            <div className="mt-3">
                                <WebCheckbox isSelected={sameAsShip} onChange={setSameAsShip}>
                                    Same as shipping address
                                </WebCheckbox>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <p className="mb-2 text-sm text-tertiary">Other ways to pay</p>
                    <div className="rounded-xl ring-1 ring-secondary ring-inset">
                        <ChoiceRow value="paypal" className="ring-0 data-[selected]:ring-0">
                            <span className="flex items-center justify-between gap-3">
                                <span>
                                    <span className="block text-md font-semibold text-primary">PayPal</span>
                                    <span className="block text-sm text-tertiary">You'll sign in to PayPal to finish paying.</span>
                                </span>
                                <BrandChip brand="PayPal" />
                            </span>
                        </ChoiceRow>
                    </div>
                </div>
            </AriaRadioGroup>
        </WebDialog>
    );
};
