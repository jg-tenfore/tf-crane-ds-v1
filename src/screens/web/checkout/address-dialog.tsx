import { useState } from "react";
import { MarkerPin01, SearchLg } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Notice } from "@/components/feedback/notice";
import { WebDialog } from "@/components/web/web-dialog";
import { USER } from "@/data/crane";
import { ADDRESS_SUGGESTIONS, quoteTax, US_STATES, type Address } from "./checkout-data";
import { WebCheckbox, WebField } from "./checkout-ui";

export interface AddressDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (address: Address) => void;
    /** Pre-typed address query so a story can show the type-ahead open. */
    initialQuery?: string;
    /** Show the validation state as if Save was pressed on an empty form. */
    showErrors?: boolean;
}

/** Every word typed is a prefix of a word in the suggestion — "1 lump" matches "10 Lumpkin Rd". */
const matches = (query: string, text: string) => {
    const words = text.toLowerCase().split(/[\s,]+/);
    const typed = query.toLowerCase().split(/[\s,]+/).filter(Boolean);
    return typed.length > 0 && typed.every((t) => words.some((w) => w.startsWith(t)));
};

let nextId = 1;

/**
 * Add address — Fox's modal with a fake address type-ahead (2–3 suggestions incl. Georgia),
 * validation, and a live tax preview so the shopper sees what the destination changes.
 */
export const AddressDialog = ({ isOpen, onOpenChange, onSave, initialQuery = "", showErrors = false }: AddressDialogProps) => {
    const [first, setFirst] = useState(USER.firstName);
    const [last, setLast] = useState(USER.lastName);
    const [street, setStreet] = useState(initialQuery);
    const [apt, setApt] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState(USER.phone);
    const [isDefault, setDefault] = useState(false);
    const [picked, setPicked] = useState(false);
    const [submitted, setSubmitted] = useState(showErrors);

    const suggestions = !picked && street.trim().length >= 2 ? ADDRESS_SUGGESTIONS.filter((s) => matches(street, `${s.street} ${s.city} ${s.state} ${s.zip}`)) : [];

    const errors = {
        first: !first.trim() ? "Enter a first name" : "",
        last: !last.trim() ? "Enter a last name" : "",
        street: !street.trim() ? "Enter an address" : "",
        city: !city.trim() ? "Enter a city" : "",
        state: !US_STATES.includes(state.trim().toUpperCase()) ? "Use a 2-letter state" : "",
        zip: !/^\d{5}$/.test(zip.trim()) ? "Enter a 5-digit ZIP" : "",
    };
    const errorCount = Object.values(errors).filter(Boolean).length;
    const err = (k: keyof typeof errors) => (submitted && errors[k] ? { isInvalid: true, errorMessage: errors[k] } : {});

    const draft: Address = { id: "", name: `${first} ${last}`.trim(), street: street.trim(), apt: apt.trim() || undefined, city: city.trim(), state: state.trim().toUpperCase(), zip: zip.trim(), phone: phone.trim() || undefined, isDefault };
    const tax = !errors.zip && !errors.state ? quoteTax("ship", draft) : null;

    const pick = (s: (typeof ADDRESS_SUGGESTIONS)[number]) => {
        setStreet(s.street);
        setCity(s.city);
        setState(s.state);
        setZip(s.zip);
        setPicked(true);
    };

    const save = () => {
        setSubmitted(true);
        if (errorCount > 0) return;
        onSave({ ...draft, id: `addr-new-${nextId++}` });
        onOpenChange(false);
    };

    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Add address"
            description="We use it to calculate shipping and the sales tax where your order is going."
            size="md"
            footer={
                <>
                    <Button size="md" color="outline" onPress={() => onOpenChange(false)} className="h-11 rounded-lg text-md">
                        Cancel
                    </Button>
                    <Button size="md" onPress={save} className="h-11 rounded-lg text-md">
                        Save address
                    </Button>
                </>
            }
        >
            <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    save();
                }}
            >
                {submitted && errorCount > 0 && (
                    <Notice tone="error" className="rounded-lg text-sm">
                        Fix {errorCount === 1 ? "1 field" : `${errorCount} fields`} to save this address.
                    </Notice>
                )}
                <WebField label="Country/Region" value="United States" isReadOnly />
                <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                    <WebField label="First name" value={first} onChange={setFirst} isRequired {...err("first")} />
                    <WebField label="Last name" value={last} onChange={setLast} isRequired {...err("last")} />
                </div>

                <div className="relative">
                    <WebField
                        label="Address"
                        placeholder="Start typing your address"
                        icon={SearchLg}
                        value={street}
                        autoComplete="off"
                        onChange={(v) => {
                            setStreet(v);
                            setPicked(false);
                        }}
                        isRequired
                        {...err("street")}
                    />
                    {suggestions.length > 0 && (
                        <ul aria-label="Address suggestions" className="mt-1.5 overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt">
                            {suggestions.map((s) => (
                                <li key={s.street + s.zip}>
                                    <AriaButton
                                        onPress={() => pick(s)}
                                        className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left outline-none hover:bg-primary_hover data-[focus-visible]:bg-primary_hover"
                                    >
                                        <MarkerPin01 className="size-4 shrink-0 text-fg-quaternary" aria-hidden="true" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-primary">{s.street}</span>
                                            <span className="block text-xs text-tertiary">
                                                {s.city}, {s.state} {s.zip}, USA
                                            </span>
                                        </span>
                                    </AriaButton>
                                </li>
                            ))}
                            <li className="border-t border-secondary px-3.5 py-2 text-xs text-quaternary">Keep typing to enter it yourself</li>
                        </ul>
                    )}
                </div>

                <WebField label="Apartment, suite, etc. (optional)" value={apt} onChange={setApt} />
                <div className="grid grid-cols-[1fr_88px_112px] gap-3 @tablet:grid-cols-[1fr_100px_130px] @tablet:gap-4">
                    <WebField label="City" value={city} onChange={setCity} isRequired {...err("city")} />
                    <WebField label="State" placeholder="GA" value={state} onChange={(v) => setState(v.toUpperCase().slice(0, 2))} isRequired {...err("state")} />
                    <WebField label="ZIP code" placeholder="30602" inputMode="numeric" value={zip} onChange={(v) => setZip(v.replace(/\D/g, "").slice(0, 5))} isRequired {...err("zip")} />
                </div>
                {tax && (
                    <p className={cx("-mt-1 rounded-lg px-3 py-2 text-sm", tax.estimated ? "bg-warning-primary text-warning-primary" : "bg-secondary text-secondary")}>
                        {tax.estimated ? `We'll confirm tax for this address — estimated at ${(tax.rate * 100).toFixed(2)}% for now.` : `Sales tax here: ${tax.label.replace("Tax · ", "")}`}
                    </p>
                )}
                <WebField label="Phone (optional)" type="tel" value={phone} onChange={setPhone} hint="For delivery questions only." />
                <WebCheckbox isSelected={isDefault} onChange={setDefault}>
                    This is my default address
                </WebCheckbox>
                <button type="submit" hidden />
            </form>
        </WebDialog>
    );
};
