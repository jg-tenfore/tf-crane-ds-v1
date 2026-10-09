import type { ReactNode } from "react";
import type { Key } from "react-aria-components";
import {
    Label as AriaLabel,
    Radio as AriaRadio,
    RadioGroup as AriaRadioGroup,
    ToggleButton as AriaToggleButton,
    ToggleButtonGroup as AriaToggleButtonGroup,
} from "react-aria-components";
import { cx } from "@/utils/cx";

export interface RadioCardOption {
    id: string;
    label: ReactNode;
    /** Right-aligned detail, e.g. a surcharge "$26.00". */
    detail?: ReactNode;
    description?: ReactNode;
    isDisabled?: boolean;
}

export interface RadioCardGroupProps {
    label?: string;
    options: RadioCardOption[];
    value: string;
    onChange: (id: string) => void;
    className?: string;
}

/** Stacked full-width radio rows; the selected row tints green. "Walking / Golf Car". */
export const RadioCardGroup = ({ label, options, value, onChange, className }: RadioCardGroupProps) => (
    <AriaRadioGroup value={value} onChange={onChange} aria-label={label} className={cx("flex flex-col gap-2", className)}>
        {label && <AriaLabel className="mb-1 text-ios-headline text-primary">{label}</AriaLabel>}
        {options.map((o) => (
            <AriaRadio
                key={o.id}
                value={o.id}
                isDisabled={o.isDisabled}
                className="group flex min-h-[52px] cursor-pointer items-center gap-3 rounded-ios-control bg-secondary px-4 py-3 outline-none transition duration-100 ease-linear data-[focus-visible]:ring-4 data-[focus-visible]:ring-brand-300/60 data-[selected]:bg-brand-primary_alt dark:data-[selected]:ring-1 dark:data-[selected]:ring-brand dark:data-[selected]:ring-inset disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary group-data-[selected]:bg-brand-solid group-data-[selected]:ring-0">
                    <span className="size-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-ios-subheadline font-medium tracking-[0.02em] text-primary uppercase">{o.label}</span>
                    {o.description && <span className="text-ios-footnote text-tertiary">{o.description}</span>}
                </span>
                {o.detail && <span className="text-ios-subheadline font-semibold text-primary tabular-nums">{o.detail}</span>}
            </AriaRadio>
        ))}
    </AriaRadioGroup>
);

export interface ChoiceChipsProps {
    options: { id: string; label: ReactNode; isDisabled?: boolean }[];
    value: string;
    onChange: (id: string) => void;
    "aria-label": string;
    className?: string;
}

/** Round number chips — "Number of Players: 1 2 3 4". Selected chip is solid green. */
export const ChoiceChips = ({ options, value, onChange, className, ...props }: ChoiceChipsProps) => (
    <AriaToggleButtonGroup
        aria-label={props["aria-label"]}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={(keys: Set<Key>) => {
            const [k] = keys;
            if (k != null) onChange(String(k));
        }}
        className={cx("flex gap-2.5", className)}
    >
        {options.map((o) => (
            <AriaToggleButton
                key={o.id}
                id={o.id}
                isDisabled={o.isDisabled}
                className="press-scale flex size-[44px] cursor-pointer items-center justify-center rounded-full bg-tertiary text-ios-headline text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-40 data-[selected]:bg-brand-solid data-[selected]:text-white"
            >
                {o.label}
            </AriaToggleButton>
        ))}
    </AriaToggleButtonGroup>
);
