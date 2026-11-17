import { useState, type FC, type ReactNode } from "react";
import { ArrowLeft, CheckCircle, ChevronDown, Lock01, Ticket02 } from "@untitledui/icons";
import {
    Button as AriaButton,
    Label as AriaLabel,
    RadioGroup as AriaRadioGroup,
    TextArea as AriaTextArea,
    TextField as AriaTextField,
    ToggleButton as AriaToggleButton,
    ToggleButtonGroup as AriaToggleButtonGroup,
    type Key,
} from "react-aria-components";
import { cx } from "@/utils/cx";
import { Button } from "@/components/base/button";
import { Tag } from "@/components/base/badge";
import { Notice } from "@/components/feedback/notice";
import { TextField } from "@/components/forms/text-field";
import { Panel, PageHeader, WebPage } from "@/components/web/web-layout";
import { WebLink } from "@/components/web/web-router";
import { USER } from "@/data/crane";
import { SAVED_PAYMENTS } from "../../checkout/checkout-data";
import { BrandChip, ChoiceRow, PromoField } from "../../checkout/checkout-ui";
import { useWebSession, WebShell } from "../../web-shell";
import { ageOn, ageRangeLabel, money, PROMOS, type CustomQuestion, type EligibilityResult, type RegistrationRules } from "../data";
import { focusRing, StepRail, type RailStep } from "../pro/instructor-ui";

/* ------------------------------------------------------------------ */
/* Page layout: header, rail, main column + summary aside, mobile bar  */
/* ------------------------------------------------------------------ */

export interface BookingLayoutProps {
    back: { href: string; label: string };
    eyebrow: string;
    title: ReactNode;
    subtitle?: ReactNode;
    rail?: { steps: RailStep[]; current: number; onStep?: (id: string) => void };
    children: ReactNode;
    /** The summary panel (desktop: sticky aside; mobile/tablet: collapsible at the top). */
    summary: ReactNode;
    /** Summary title and one-liner for the collapsed mobile panel. */
    summaryTitle: string;
    summaryLine: ReactNode;
    /** Price shown in the collapsed mobile summary and the sticky bar. */
    price: ReactNode;
    /** Under the price in the sticky bar ("Due today", "Held for you"). */
    priceNote?: ReactNode;
    /** Primary action: in the aside on desktop, pinned to the bottom on mobile/tablet. */
    action?: ReactNode;
    /** Small print under the desktop action. */
    actionNote?: ReactNode;
}

/**
 * Crane's tee-time checkout layout, for a lesson or a program: page header with a back link, the
 * step rail, the step's content on the left and a sticky "Lesson summary" on the right (desktop).
 * Under 1024 the summary collapses into a panel at the top and the action pins to the bottom with
 * the total — the tee-time checkout's mobile pattern.
 */
export const BookingLayout = ({ back, eyebrow, title, subtitle, rail, children, summary, summaryTitle, summaryLine, price, priceNote, action, actionNote }: BookingLayoutProps) => {
    const [open, setOpen] = useState(false);
    return (
        <WebShell active="instruction" footer={false}>
            <WebPage className={cx(action ? "pb-28 @desktop:pb-20" : undefined)}>
                <PageHeader
                    back={
                        <WebLink href={back.href} className={cx("inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}>
                            <ArrowLeft className="size-4" aria-hidden="true" /> {back.label}
                        </WebLink>
                    }
                    eyebrow={eyebrow}
                    title={title}
                    subtitle={subtitle}
                />
                {rail && (
                    <div className="mt-6">
                        <StepRail {...rail} />
                    </div>
                )}
                <div className="mt-6 grid grid-cols-1 gap-6 @desktop:mt-8 @desktop:grid-cols-[minmax(0,1fr)_380px] @desktop:gap-8">
                    <div className="flex min-w-0 flex-col gap-5">
                        <div className="@desktop:hidden">
                            <Panel>
                                <AriaButton
                                    aria-expanded={open}
                                    onPress={() => setOpen((o) => !o)}
                                    className={cx("flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left", focusRing)}
                                >
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-md font-semibold text-primary">{summaryTitle}</span>
                                        <span className="block truncate text-sm text-tertiary">{summaryLine}</span>
                                    </span>
                                    <span className="text-md font-semibold text-brand-secondary tabular-nums">{price}</span>
                                    <ChevronDown className={cx("size-5 text-fg-quaternary transition duration-100 ease-linear", open && "rotate-180")} aria-hidden="true" />
                                </AriaButton>
                                {open && <div className="border-t border-secondary">{summary}</div>}
                            </Panel>
                        </div>
                        {children}
                    </div>
                    <aside className="hidden flex-col gap-4 @desktop:sticky @desktop:top-[136px] @desktop:flex @desktop:self-start">
                        <Panel title={summaryTitle}>{summary}</Panel>
                        {action}
                        {actionNote && <div className="text-sm text-tertiary">{actionNote}</div>}
                    </aside>
                </div>
            </WebPage>
            {action && (
                <div className="sticky bottom-0 z-20 border-t border-secondary bg-primary px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] @tablet:px-8 @desktop:hidden">
                    <div className="mx-auto flex max-w-web items-center gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-lg font-semibold text-primary tabular-nums">{price}</p>
                            {priceNote && <p className="truncate text-sm text-tertiary">{priceNote}</p>}
                        </div>
                        <div className="flex-1 @tablet:flex-none">{action}</div>
                    </div>
                </div>
            )}
        </WebShell>
    );
};

/** One block of the summary panel: a leading visual + lines + optional edit link. */
export const SummaryBlock = ({ lead, title, lines, edit }: { lead: ReactNode; title: ReactNode; lines?: ReactNode[]; edit?: { label: string; onPress: () => void } }) => (
    <div className="flex items-start gap-3 border-b border-secondary px-5 py-4 last:border-b-0">
        {lead}
        <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-md font-semibold text-primary">{title}</span>
            {lines?.filter(Boolean).map((l, i) => (
                <span key={i} className="text-sm text-tertiary">
                    {l}
                </span>
            ))}
        </div>
        {edit && (
            <AriaButton
                onPress={edit.onPress}
                aria-label={edit.label}
                className={cx("shrink-0 cursor-pointer rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}
            >
                Change
            </AriaButton>
        )}
    </div>
);

/** A square icon tile for a summary block. */
export const IconTile = ({ icon: Icon }: { icon: FC<{ className?: string }> }) => (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="size-5 text-fg-secondary" />
    </span>
);

/** Money rows at the foot of the summary. */
export const MoneyRow = ({ label, value, strong, tone }: { label: ReactNode; value: ReactNode; strong?: boolean; tone?: "success" | "muted" }) => (
    <div className={cx("flex items-start justify-between gap-4", strong ? "text-md" : "text-sm")}>
        <span className={cx("min-w-0", strong ? "font-semibold text-primary" : "text-tertiary")}>{label}</span>
        <span
            className={cx(
                "shrink-0 text-right tabular-nums",
                strong ? "font-semibold text-primary" : tone === "success" ? "font-medium text-success-primary" : tone === "muted" ? "text-quaternary" : "text-secondary",
            )}
        >
            {value}
        </span>
    </div>
);

export const MoneyBlock = ({ children }: { children: ReactNode }) => <div className="flex flex-col gap-2 px-5 py-4">{children}</div>;

/** A step's main panel: title row + body. */
export const StepPanel = ({ title, sub, right, children, id }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; children?: ReactNode; id?: string }) => (
    <Panel bodyClassName="flex flex-col gap-4 px-5 py-5 @tablet:px-6 @tablet:py-6">
        <div id={id} className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
                <h2 className="text-lg font-semibold text-primary">{title}</h2>
                {sub && <p className="text-sm text-tertiary">{sub}</p>}
            </div>
            {right}
        </div>
        {children}
    </Panel>
);

/** Full-width primary action, web-sized. */
export const PrimaryAction = ({
    children,
    onPress,
    isDisabled,
    isLoading,
    icon,
}: {
    children: ReactNode;
    onPress: () => void;
    isDisabled?: boolean;
    isLoading?: boolean;
    icon?: FC<{ className?: string }>;
}) => (
    <Button size="web-lg" fullWidth onPress={onPress} isDisabled={isDisabled} isLoading={isLoading} iconTrailing={icon}>
        {children}
    </Button>
);

/* ------------------------------------------------------------------ */
/* Form bits                                                           */
/* ------------------------------------------------------------------ */

export const WebTextArea = ({
    label,
    value,
    onChange,
    placeholder,
    hint,
    rows = 3,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    hint?: string;
    rows?: number;
}) => (
    <AriaTextField value={value} onChange={onChange} className="flex flex-col gap-1.5">
        <AriaLabel className="px-0.5 text-sm font-medium text-secondary">{label}</AriaLabel>
        <AriaTextArea
            rows={rows}
            placeholder={placeholder}
            className="min-h-24 w-full resize-y rounded-lg bg-primary px-3.5 py-2.5 text-md text-primary ring-1 ring-primary outline-none ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand"
        />
        {hint && <span className="px-0.5 text-sm text-tertiary">{hint}</span>}
    </AriaTextField>
);

/** Single-choice pills (questions, golfer count). Empty `value` = nothing chosen yet. */
export const Pills = ({
    label,
    options,
    value,
    onChange,
    hideLabel,
}: {
    label: string;
    options: { id: string; label: ReactNode }[];
    value: string;
    onChange: (id: string) => void;
    hideLabel?: boolean;
}) => (
    <div className="flex flex-col gap-2">
        {!hideLabel && <span className="px-0.5 text-sm font-medium text-secondary">{label}</span>}
        <AriaToggleButtonGroup
            aria-label={label}
            selectionMode="single"
            selectedKeys={value ? [value] : []}
            onSelectionChange={(keys: Set<Key>) => {
                const [k] = keys;
                if (k != null) onChange(String(k));
            }}
            className="flex flex-wrap gap-2"
        >
            {options.map((o) => (
                <AriaToggleButton
                    key={o.id}
                    id={o.id}
                    className={cx(
                        "flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium whitespace-nowrap text-secondary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:bg-primary_hover",
                        "data-[selected]:bg-brand-primary_alt data-[selected]:text-brand-secondary data-[selected]:ring-brand",
                        focusRing,
                    )}
                >
                    {o.label}
                </AriaToggleButton>
            ))}
        </AriaToggleButtonGroup>
    </div>
);

/** Multi-select pills (waitlist days / dayparts). */
export const MultiPills = ({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: { id: string; label: ReactNode }[];
    value: string[];
    onChange: (ids: string[]) => void;
}) => (
    <AriaToggleButtonGroup
        aria-label={label}
        selectionMode="multiple"
        selectedKeys={value}
        onSelectionChange={(keys: Set<Key>) => onChange([...keys].map(String))}
        className="flex flex-wrap gap-2"
    >
        {options.map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                className={cx(
                    "flex h-9 min-w-12 cursor-pointer items-center justify-center rounded-full bg-primary px-3.5 text-sm font-semibold whitespace-nowrap text-secondary ring-1 ring-secondary transition duration-100 ease-linear ring-inset hover:bg-primary_hover",
                    "data-[selected]:bg-brand-solid data-[selected]:text-white data-[selected]:ring-transparent",
                    focusRing,
                )}
            >
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);

/** One custom registration question (`registration-rules.ts`). */
export const QuestionField = ({ question, value, onChange }: { question: CustomQuestion; value: string; onChange: (v: string) => void }) => {
    const label = `${question.label}${question.required ? "" : " (optional)"}`;
    if (question.type === "choice") return <Pills label={label} options={(question.options ?? []).map((o) => ({ id: o, label: o }))} value={value} onChange={onChange} />;
    if (question.type === "yes-no") return <Pills label={label} options={["Yes", "No"].map((o) => ({ id: o, label: o }))} value={value} onChange={onChange} />;
    return <TextField label={question.label} value={value} onChange={onChange} hint={question.hint} isRequired={question.required} />;
};

/** Date of birth (when the rules have an age range) + per-golfer questions, with the eligibility verdict. */
export const EligibilityFields = ({
    rules,
    birthDate,
    answers,
    onBirthDate,
    onAnswer,
    asOf,
    result,
}: {
    rules?: RegistrationRules;
    birthDate?: string;
    answers?: Record<string, string>;
    onBirthDate: (v: string) => void;
    onAnswer: (id: string, v: string) => void;
    asOf: string;
    result?: EligibilityResult;
}) => {
    const per = (rules?.questions ?? []).filter((q) => q.per === "golfer");
    if (!rules?.age && per.length === 0) return null;
    return (
        <div className="flex flex-col gap-4">
            {rules?.age && (
                <TextField
                    label="Date of birth"
                    type="date"
                    value={birthDate ?? ""}
                    onChange={onBirthDate}
                    isRequired
                    hint={birthDate ? `Age ${ageOn(birthDate, asOf)} on the day · ${ageRangeLabel(rules.age)}` : `${ageRangeLabel(rules.age)}, checked against the first session`}
                    className="max-w-xs"
                />
            )}
            {per.map((q) => (
                <QuestionField key={q.id} question={q} value={answers?.[q.id] ?? ""} onChange={(v) => onAnswer(q.id, v)} />
            ))}
            {result && result.problems.length > 0 && (
                <Notice tone="error" className="rounded-lg text-sm">
                    {result.problems.join(" ")}
                </Notice>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Sign-in gate                                                        */
/* ------------------------------------------------------------------ */

/**
 * MCG: every booking is attached to an account, but browsing and choosing stay open — so the
 * account is settled here, inside the flow, and nothing chosen is lost. Signing in inline fills the
 * contact details; the full Crane sign-in page is a link away and returns here via `?next=`.
 */
export const SignInGate = ({ what = "booking", nextHref, onSignedIn }: { what?: string; nextHref: string; onSignedIn: () => void }) => {
    const { userName, setUserName } = useWebSession();
    const [mode, setMode] = useState<"signin" | "create">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [busy, setBusy] = useState(false);

    if (userName) {
        return (
            <div className="flex items-center gap-3 rounded-xl bg-success-primary p-4">
                <CheckCircle className="size-5 shrink-0 text-fg-success-primary" aria-hidden="true" />
                <p className="text-sm text-secondary">
                    Signed in as <span className="font-semibold text-primary">{USER.email}</span> — this {what} is saved to your MCG account.
                </p>
            </div>
        );
    }

    const go = () => {
        setBusy(true);
        setTimeout(() => {
            setUserName(mode === "create" && first.trim() ? first.trim() : USER.firstName);
            setBusy(false);
            onSignedIn();
        }, 500);
    };
    const ready = email.trim() && password.trim() && (mode === "signin" || first.trim());
    const next = encodeURIComponent(nextHref);

    return (
        <Panel bodyClassName="flex flex-col gap-5 px-5 py-5 @tablet:px-6 @tablet:py-6">
            <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary_alt">
                    <Lock01 className="size-5 text-fg-brand-primary" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-semibold text-primary">Sign in to finish this {what}</h2>
                    <p className="text-sm text-tertiary">
                        Every {what} is saved to an MCG account, so your instructor, credits and history stay together. Your place is held — nothing you&rsquo;ve chosen is lost.
                    </p>
                </div>
            </div>

            <AriaToggleButtonGroup
                aria-label="Account"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[mode]}
                onSelectionChange={(keys: Set<Key>) => {
                    const [k] = keys;
                    if (k) setMode(k as "signin" | "create");
                }}
                className="grid grid-cols-2 gap-1 rounded-lg bg-tertiary p-1"
            >
                {(
                    [
                        ["signin", "I have an account"],
                        ["create", "Create an account"],
                    ] as const
                ).map(([id, label]) => (
                    <AriaToggleButton
                        key={id}
                        id={id}
                        className={cx(
                            "h-9 cursor-pointer rounded-md text-sm font-semibold text-tertiary transition duration-100 ease-linear hover:text-secondary data-[selected]:bg-primary data-[selected]:text-primary data-[selected]:shadow-sm",
                            focusRing,
                        )}
                    >
                        {label}
                    </AriaToggleButton>
                ))}
            </AriaToggleButtonGroup>

            <div className="flex flex-col gap-4">
                {mode === "create" && (
                    <div className="grid grid-cols-1 gap-4 @tablet:grid-cols-2">
                        <TextField label="First name" value={first} onChange={setFirst} isRequired />
                        <TextField label="Last name" value={last} onChange={setLast} />
                    </div>
                )}
                <TextField label="Email" type="email" placeholder="you@example.com" value={email} onChange={setEmail} isRequired />
                <TextField label="Password" type="password" revealable value={password} onChange={setPassword} isRequired />
            </div>

            <div className="flex flex-col gap-3 @tablet:flex-row @tablet:items-center">
                <Button size="web-lg" onPress={go} isDisabled={!ready} isLoading={busy}>
                    {mode === "signin" ? "Sign in and continue" : "Create account and continue"}
                </Button>
                <WebLink
                    href={`${mode === "signin" ? "/sign-in" : "/sign-up"}?next=${next}`}
                    className={cx("rounded text-sm font-semibold text-brand-secondary hover:underline", focusRing)}
                >
                    Use the full {mode === "signin" ? "sign-in" : "sign-up"} page
                </WebLink>
            </div>
            <p className="text-xs text-tertiary">Booking for someone else? Sign in as yourself — their details are on the booking, and it still lands in your account.</p>
        </Panel>
    );
};

/* ------------------------------------------------------------------ */
/* Payment                                                             */
/* ------------------------------------------------------------------ */

export interface CreditOption {
    remaining: number;
    total: number;
    coachName: string;
    expiresOn?: string;
    /** Why it can't be used for this booking (shown, disabled). */
    blockedReason?: string;
}

/**
 * Payment methods: a lesson credit (when the golfer holds one for this instructor and lesson), the
 * saved cards from Crane checkout, and — for privates — paying at the pro shop on the day.
 */
export const PaymentOptions = ({
    value,
    onChange,
    credit,
    payAtLesson,
    courseShort,
}: {
    value: string;
    onChange: (v: string) => void;
    credit?: CreditOption;
    payAtLesson?: boolean;
    courseShort?: string;
}) => (
    <AriaRadioGroup aria-label="Payment method" value={value} onChange={onChange} className="flex flex-col gap-2">
        {credit && (
            <ChoiceRow value="credit" isDisabled={!!credit.blockedReason} className="ring-1 ring-secondary">
                <span className="flex flex-wrap items-center gap-2">
                    <Ticket02 className="size-5 text-fg-brand-primary" aria-hidden="true" />
                    <span className="text-md font-semibold text-primary">Use a lesson credit</span>
                    <Tag tone="success" variant="soft">
                        {credit.remaining} left
                    </Tag>
                </span>
                <span className="block text-sm text-tertiary">
                    {credit.blockedReason ??
                        `From your ${credit.total}-lesson pack with ${credit.coachName} — covers the lesson${credit.expiresOn ? ` · good through ${credit.expiresOn}` : ""}. The facility fee and any extras go on your card on file.`}
                </span>
            </ChoiceRow>
        )}
        {SAVED_PAYMENTS.filter((p) => !p.expired).map((p) => (
            <ChoiceRow key={p.id} value={p.id} className="ring-1 ring-secondary">
                <span className="flex flex-wrap items-center gap-2">
                    <span className="text-md font-semibold text-primary">
                        {p.name}
                        {p.last4 && ` ···· ${p.last4}`}
                    </span>
                    <BrandChip brand={p.brand} />
                </span>
                <span className="block text-sm text-tertiary">
                    Charged when you confirm · {USER.firstName} {USER.lastName}
                </span>
            </ChoiceRow>
        ))}
        {payAtLesson && (
            <ChoiceRow value="lesson" className="ring-1 ring-secondary">
                <span className="text-md font-semibold text-primary">Pay at the lesson</span>
                <span className="block text-sm text-tertiary">Pay at the {courseShort ?? "course"} pro shop when you check in. Your card on file holds the slot.</span>
            </ChoiceRow>
        )}
    </AriaRadioGroup>
);

export const paymentName = (pay: string) => {
    if (pay === "credit") return "Lesson credit";
    if (pay === "lesson") return "Pay at the lesson";
    const p = SAVED_PAYMENTS.find((x) => x.id === pay);
    return p ? `${p.name}${p.last4 ? ` ···· ${p.last4}` : ""}` : "Card on file";
};

export const DEFAULT_CARD = SAVED_PAYMENTS.find((p) => !p.expired)!.id;

/** Crane's promo field, checked against the Academy's codes (MCGJUNIOR, WELCOME10, MCGVET). */
export const PromoBox = ({
    applied,
    onApply,
    onRemove,
    disabledReason,
}: {
    applied: string | null;
    onApply: (code: string) => void;
    onRemove: () => void;
    disabledReason?: string;
}) => {
    const [error, setError] = useState<string | null>(null);
    if (disabledReason) return <p className="text-sm text-tertiary">{disabledReason}</p>;
    return (
        <div className="flex flex-col gap-2">
            <PromoField
                label="Promo code"
                applied={applied}
                onApply={(code) => {
                    if (PROMOS[code]) {
                        setError(null);
                        onApply(code);
                    } else setError(`${code} isn't a valid MCG Academy code. Try MCGJUNIOR, WELCOME10 or MCGVET.`);
                }}
                onRemove={onRemove}
            />
            {applied && <p className="text-sm text-success-primary">{PROMOS[applied]?.label}</p>}
            {error && !applied && (
                <p role="alert" className="text-sm text-error-primary">
                    {error}
                </p>
            )}
        </div>
    );
};

export const moneyOrFree = (n: number) => money(n);
