import { useEffect, useState, type ReactNode } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import { Check, Clock, CreditCard02, Lock01, Mail01, Phone, Plus, Trash01, User01 } from "@untitledui/icons";
import { QRCode } from "@/components/base/qr-code";
import { TextField } from "@/components/forms/text-field";
import { WebDialog } from "@/components/web/web-dialog";
import { useWebRouter } from "@/components/web/web-router";
import { PAYMENT_CARDS, USER, type PaymentCard } from "@/data/crane";
import { useWebSession } from "@/screens/web/web-shell";
import { cx } from "@/utils/cx";
import { ACCOUNT_EXTRAS } from "./account-data";
import { AccountLayout } from "./account-layout";
import { AccountPanel, AccountTitle, Flash, TextAction, WebButton, useFlash } from "./account-ui";

/* ---------- Personal information: one inline edit open at a time (Fox / Airbnb pattern) ---------- */

type Values = { firstName: string; lastName: string; email: string; phone: string; handicap: string };
type FieldId = "name" | "email" | "phone" | "handicap";

interface InlineFieldProps {
    id: FieldId | "course";
    label: string;
    display: ReactNode;
    editing: FieldId | null;
    onEdit?: () => void;
    onCancel: () => void;
    onSave: () => void;
    hint?: string;
    children?: ReactNode;
}

const InlineField = ({ id, label, display, editing, onEdit, onCancel, onSave, hint, children }: InlineFieldProps) => {
    const isEditing = editing === id;
    const dim = editing !== null && !isEditing;
    return (
        <div className={cx("border-t border-secondary py-5 transition duration-100 ease-linear first:border-t-0", dim && "opacity-40")}>
            <div className="flex items-start justify-between gap-4">
                <p className="text-md font-semibold text-primary">{label}</p>
                {onEdit &&
                    (isEditing ? (
                        <TextAction onPress={onCancel}>Cancel</TextAction>
                    ) : (
                        <button
                            type="button"
                            disabled={dim}
                            onClick={onEdit}
                            aria-label={`Edit ${label.toLowerCase()}`}
                            className="shrink-0 cursor-pointer rounded-md text-sm font-semibold text-secondary underline underline-offset-4 outline-none transition duration-100 ease-linear hover:text-primary focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed"
                        >
                            Edit
                        </button>
                    ))}
            </div>
            {isEditing ? (
                <form
                    className="mt-4 max-w-lg"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                >
                    {hint && <p className="mb-3 text-sm text-tertiary">{hint}</p>}
                    {children}
                    <WebButton type="submit" className="mt-4">
                        Save
                    </WebButton>
                </form>
            ) : (
                <div className="mt-1 text-md text-tertiary">{display}</div>
            )}
        </div>
    );
};

/* ---------- Payment methods ---------- */

const CardRow = ({ card, onRemove }: { card: PaymentCard; onRemove: () => void }) => (
    <li className="flex items-center gap-4 border-t border-secondary py-4 first:border-t-0">
        <span className="flex h-9 w-13 shrink-0 items-center justify-center rounded-md bg-secondary text-[11px] font-bold tracking-wide text-secondary uppercase ring-1 ring-secondary ring-inset">
            {card.brand}
        </span>
        <div className="min-w-0 flex-1">
            <p className="text-md font-semibold text-primary tabular-nums">
                {card.brand} •••• {card.last4}
            </p>
            <p className="text-sm text-tertiary tabular-nums @tablet:truncate">
                {card.name} · Exp {card.exp} · ZIP {card.zip}
            </p>
        </div>
        <TextAction onPress={onRemove}>Remove</TextAction>
    </li>
);

const AddCardDialog = ({ isOpen, onOpenChange, courseName, onAdd }: { isOpen: boolean; onOpenChange: (o: boolean) => void; courseName: string; onAdd: (c: PaymentCard) => void }) => {
    const [f, setF] = useState({ name: "", number: "", exp: "", cvv: "", zip: "" });
    const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
    const digits = f.number.replace(/\D/g, "");
    const valid = f.name.trim() && digits.length >= 15 && /^\d{2}\/?\d{2}$/.test(f.exp.trim()) && f.cvv.length >= 3 && f.zip.length >= 5;
    const brand: PaymentCard["brand"] = digits.startsWith("4") ? "Visa" : digits.startsWith("3") ? "Amex" : "Mastercard";

    return (
        <WebDialog
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Add a card"
            description={`Saved with ${courseName} for tee times, shop orders and your balance.`}
            footer={
                <>
                    <WebButton color="outline" onPress={() => onOpenChange(false)}>
                        Cancel
                    </WebButton>
                    <WebButton
                        isDisabled={!valid}
                        onPress={() => {
                            onAdd({ id: `card-${Date.now()}`, brand, last4: digits.slice(-4), exp: f.exp.includes("/") ? f.exp : `${f.exp.slice(0, 2)}/${f.exp.slice(2)}`, name: f.name.trim(), zip: f.zip });
                            setF({ name: "", number: "", exp: "", cvv: "", zip: "" });
                            onOpenChange(false);
                        }}
                    >
                        Save card
                    </WebButton>
                </>
            }
        >
            <div className="flex flex-col gap-4">
                <TextField label="Name on card" autoComplete="cc-name" placeholder="Justin C Girard" value={f.name} onChange={set("name")} />
                <TextField label="Card number" icon={CreditCard02} inputMode="numeric" autoComplete="cc-number" placeholder="1234 1234 1234 1234" value={f.number} onChange={set("number")} />
                <div className="grid grid-cols-3 gap-3">
                    <TextField label="Expiration" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={f.exp} onChange={set("exp")} />
                    <TextField label="CVV" inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={f.cvv} onChange={set("cvv")} />
                    <TextField label="ZIP" inputMode="numeric" autoComplete="postal-code" placeholder="01940" value={f.zip} onChange={set("zip")} />
                </div>
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.06em] text-tertiary uppercase">
                    <Lock01 className="size-3.5" aria-hidden="true" /> Secured by CardConnect
                </p>
            </div>
        </WebDialog>
    );
};

/* ---------- Appearance ---------- */

export type AppearanceMode = "system" | "light" | "dark";

const MiniPage = ({ className }: { className?: string }) => (
    <div className={cx("flex h-full flex-col gap-2 bg-secondary p-2.5", className)}>
        <div className="flex items-center justify-between rounded-[3px] bg-primary px-1.5 py-1">
            <span className="h-[4px] w-8 rounded-full bg-fg-primary" />
            <span className="size-[6px] rounded-full bg-fg-brand-primary" />
        </div>
        <div className="flex flex-1 gap-1.5">
            <div className="flex w-1/4 flex-col gap-1">
                <span className="h-[3px] rounded-full bg-fg-brand-primary" />
                <span className="h-[3px] rounded-full bg-fg-quaternary" />
                <span className="h-[3px] rounded-full bg-fg-quaternary" />
            </div>
            <div className="flex flex-1 flex-col gap-1 rounded-[3px] bg-primary p-1.5 ring-1 ring-secondary">
                <span className="h-[3px] w-3/4 rounded-full bg-fg-primary" />
                <span className="h-[3px] w-1/2 rounded-full bg-fg-quaternary" />
                <span className="mt-auto h-[7px] w-8 rounded-full bg-fg-brand-primary" />
            </div>
        </div>
    </div>
);

const AppearancePreview = ({ mode }: { mode: AppearanceMode }) =>
    mode === "system" ? (
        <div className="flex h-full overflow-hidden rounded-md">
            <MiniPage className="w-1/2" />
            <div className="dark-mode w-1/2">
                <MiniPage className="bg-primary" />
            </div>
        </div>
    ) : (
        <div className={cx("h-full overflow-hidden rounded-md", mode === "dark" && "dark-mode")}>
            <MiniPage className={mode === "dark" ? "bg-primary" : undefined} />
        </div>
    );

const APPEARANCE: { id: AppearanceMode; label: string }[] = [
    { id: "system", label: "System" },
    { id: "light", label: "Light" },
    { id: "dark", label: "Warm Dark" },
];

const AppearancePicker = ({ value, onChange }: { value: AppearanceMode; onChange: (m: AppearanceMode) => void }) => (
    <AriaRadioGroup aria-label="Appearance" orientation="horizontal" value={value} onChange={(v) => onChange(v as AppearanceMode)} className="grid grid-cols-3 gap-3 py-5">
        {APPEARANCE.map((o) => (
            <AriaRadio
                key={o.id}
                value={o.id}
                className="group relative flex cursor-pointer flex-col rounded-lg bg-primary p-2 ring-1 ring-secondary outline-none transition duration-100 ease-linear ring-inset hover:ring-primary data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:ring-2 data-[selected]:ring-fg-brand-primary"
            >
                <div className="relative h-20 @tablet:h-24">
                    <AppearancePreview mode={o.id} />
                    <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-brand-solid text-white opacity-0 ring-2 ring-white/70 transition duration-100 ease-linear group-data-[selected]:opacity-100">
                        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                </div>
                <span className="pt-2 text-center text-sm font-semibold text-primary">{o.label}</span>
            </AriaRadio>
        ))}
    </AriaRadioGroup>
);

/* ---------- Kiosk sign-in ---------- */

const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newCode = () => Array.from({ length: 16 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

/** Same short-lived QR as the app's Kiosk Sign-In, side by side with the how-to on wider pages. */
const KioskQR = ({ lifetime = 30, initialCode = "7K2QF9X4M8TC3WHD" }: { lifetime?: number; initialCode?: string }) => {
    const [{ code, left }, setState] = useState({ code: initialCode, left: lifetime });
    useEffect(() => {
        const id = window.setInterval(() => setState((s) => (s.left > 1 ? { ...s, left: s.left - 1 } : { code: newCode(), left: lifetime })), 1000);
        return () => window.clearInterval(id);
    }, [lifetime]);
    return (
        <div className="flex flex-col items-center gap-5 py-5 @tablet:flex-row @tablet:items-center">
            <div className="flex shrink-0 flex-col items-center rounded-lg bg-white p-3 ring-1 ring-secondary ring-inset">
                <QRCode value={`crane://kiosk-sign-in?code=${code}`} size={148} />
                <span className="mt-1.5 font-mono text-[11px] tracking-[0.2em] text-quaternary">{code}</span>
            </div>
            <div className="flex flex-col gap-3 text-center @tablet:text-left">
                <ol className="flex list-decimal flex-col gap-1 pl-5 text-left text-sm text-secondary">
                    <li>Open this page on your phone at the course.</li>
                    <li>Hold the code up to the kiosk scanner.</li>
                    <li>You're signed in to check in, pay, or print a receipt.</li>
                </ol>
                <span role="timer" aria-live="off" className="inline-flex h-8 w-fit items-center gap-1.5 self-center rounded-full bg-secondary px-3 text-sm font-medium text-secondary tabular-nums @tablet:self-start">
                    <Clock className="size-4" aria-hidden="true" /> New code in {left}s
                </span>
            </div>
        </div>
    );
};

/* ---------- Screen ---------- */

export interface AccountMyAccountScreenProps {
    /** Open one personal-info row in edit mode (stories). */
    defaultEditing?: FieldId;
    defaultAddCardOpen?: boolean;
    defaultDeleteOpen?: boolean;
    cards?: PaymentCard[];
}

/**
 * My Account — ports Fox "Profile ∕ Account/My Account" (inline-edit rows, payment methods,
 * add-card dialog) and adds the Crane app's Appearance, Sign in to Kiosk and Delete Account.
 */
export const AccountMyAccountScreen = ({ defaultEditing, defaultAddCardOpen = false, defaultDeleteOpen = false, cards: initialCards = PAYMENT_CARDS }: AccountMyAccountScreenProps) => {
    const { course, setUserName } = useWebSession();
    const { navigate } = useWebRouter();
    const flash = useFlash();

    const initial: Values = { firstName: USER.firstName, lastName: USER.lastName, email: USER.email, phone: USER.phone, handicap: ACCOUNT_EXTRAS.handicap };
    const [values, setValues] = useState<Values>(initial);
    const [draft, setDraft] = useState<Values>(initial);
    const [editing, setEditing] = useState<FieldId | null>(defaultEditing ?? null);
    const [cards, setCards] = useState(initialCards);
    const [addOpen, setAddOpen] = useState(defaultAddCardOpen);
    const [deleteOpen, setDeleteOpen] = useState(defaultDeleteOpen);
    const [appearance, setAppearance] = useState<AppearanceMode>("system");

    const set = (k: keyof Values) => (v: string) => setDraft((d) => ({ ...d, [k]: v }));
    const field = (id: FieldId) => ({
        id,
        editing,
        onEdit: () => {
            setDraft(values);
            setEditing(id);
        },
        onCancel: () => setEditing(null),
        onSave: () => {
            setValues(draft);
            setEditing(null);
            if (id === "name") setUserName(draft.firstName);
            flash.show("Saved");
        },
    });

    return (
        <AccountLayout active="my-account">
            <div className="flex flex-col gap-8">
                <AccountTitle title="My Account" subtitle="Your details, how you pay, and how Crane looks." />
                <Flash message={flash.message} />

                <AccountPanel title="Personal information">
                    <InlineField {...field("name")} label="Name" display={`${values.firstName} ${values.lastName}`}>
                        <div className="grid grid-cols-1 gap-3 @tablet:grid-cols-2">
                            <TextField label="First name" icon={User01} autoComplete="given-name" value={draft.firstName} onChange={set("firstName")} autoFocus />
                            <TextField label="Last name" autoComplete="family-name" value={draft.lastName} onChange={set("lastName")} />
                        </div>
                    </InlineField>
                    <InlineField {...field("email")} label="Email" display={values.email} hint="We'll send a link to confirm the new address.">
                        <TextField label="Email" type="email" icon={Mail01} autoComplete="email" value={draft.email} onChange={set("email")} autoFocus />
                    </InlineField>
                    <InlineField
                        {...field("phone")}
                        label="Phone"
                        display={
                            <>
                                {values.phone || <span className="text-quaternary">Not provided</span>}
                                <span className="mt-0.5 block text-sm text-quaternary">Optional. Used for tee-time reminders.</span>
                            </>
                        }
                    >
                        <TextField label="Phone (optional)" type="tel" icon={Phone} autoComplete="tel" value={draft.phone} onChange={set("phone")} autoFocus />
                    </InlineField>
                    <InlineField {...field("handicap")} label="Handicap index" display={values.handicap} hint="Used for leagues, events and net scoring.">
                        <TextField label="Handicap index" inputMode="decimal" value={draft.handicap} onChange={set("handicap")} autoFocus />
                    </InlineField>
                    <InlineField id="course" editing={editing} onCancel={() => {}} onSave={() => {}} label="Home course" display={course.name} />
                </AccountPanel>

                <AccountPanel
                    title="Payment methods"
                    description={`Cards are saved per course, with ${course.name}.`}
                    action={
                        <WebButton size="sm" color="outline" iconLeading={Plus} onPress={() => setAddOpen(true)}>
                            Add card
                        </WebButton>
                    }
                >
                    {cards.length ? (
                        <ul>
                            {cards.map((c) => (
                                <CardRow
                                    key={c.id}
                                    card={c}
                                    onRemove={() => {
                                        setCards((l) => l.filter((x) => x.id !== c.id));
                                        flash.show(`${c.brand} •••• ${c.last4} removed`);
                                    }}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p className="py-6 text-md text-tertiary">No saved cards. Add one to check out faster.</p>
                    )}
                </AccountPanel>

                <div className="grid grid-cols-1 gap-8 @min-[1200px]:grid-cols-2">
                    <AccountPanel title="Appearance" description="Light, Warm Dark, or follow your device.">
                        <AppearancePicker
                            value={appearance}
                            onChange={(m) => {
                                setAppearance(m);
                                flash.show(`Appearance set to ${APPEARANCE.find((a) => a.id === m)?.label}`);
                            }}
                        />
                    </AccountPanel>
                    <AccountPanel title="Sign in to kiosk" description="Skip typing at the course's kiosk.">
                        <KioskQR />
                    </AccountPanel>
                </div>

                <AccountPanel title="Delete account">
                    <div className="flex flex-col gap-4 py-5 @tablet:flex-row @tablet:items-center">
                        <p className="min-w-0 flex-1 text-md text-tertiary">Permanently delete your Crane account, saved cards, buddies and history at every course. This can't be undone.</p>
                        <WebButton color="outline" iconLeading={Trash01} onPress={() => setDeleteOpen(true)} className="text-error-primary">
                            Delete account
                        </WebButton>
                    </div>
                </AccountPanel>
            </div>

            <AddCardDialog
                isOpen={addOpen}
                onOpenChange={setAddOpen}
                courseName={course.name}
                onAdd={(c) => {
                    setCards((l) => [...l, c]);
                    flash.show(`${c.brand} •••• ${c.last4} added`);
                }}
            />

            <WebDialog
                isOpen={deleteOpen}
                onOpenChange={setDeleteOpen}
                size="sm"
                title="Delete your account?"
                description="This is permanent. You'll lose your saved cards, wallet history, golf buddies and reservations at every course."
                footer={
                    <>
                        <WebButton color="outline" onPress={() => setDeleteOpen(false)}>
                            Keep account
                        </WebButton>
                        <WebButton
                            color="destructive"
                            onPress={() => {
                                setDeleteOpen(false);
                                setUserName(null);
                                navigate("/");
                            }}
                        >
                            Delete
                        </WebButton>
                    </>
                }
            />
        </AccountLayout>
    );
};
