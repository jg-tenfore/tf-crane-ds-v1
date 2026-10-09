import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { Input as AriaInput, Label as AriaLabel, TextField as AriaTextField, type TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { cx } from "@/utils/cx";

export interface FieldGroupProps {
    children: ReactNode;
    className?: string;
}

/**
 * FieldGroup — one bordered card holding stacked "cells", each with a small
 * uppercase label inside it. Used for payment-card entry (Name / Number / Exp + CVV / ZIP).
 * Put FieldRow around cells that share a line.
 */
export const FieldGroup = ({ children, className }: FieldGroupProps) => {
    const rows = Children.toArray(children).filter(isValidElement);
    return (
        <div className={cx("overflow-hidden rounded-ios-control bg-primary ring-1 ring-primary ring-inset", className)}>
            {rows.map((r, i) => (
                <Fragment key={r.key ?? i}>
                    {i > 0 && <div className="h-px bg-border-primary" />}
                    {r}
                </Fragment>
            ))}
        </div>
    );
};

/** Lays cells side by side with a vertical hairline between them. */
export const FieldRow = ({ children }: { children: ReactNode }) => (
    <div className="flex divide-x divide-border-primary [&>*]:flex-1">{children}</div>
);

export interface FieldCellProps extends Omit<AriaTextFieldProps, "children" | "className"> {
    label: string;
    placeholder?: string;
    inputMode?: "text" | "numeric" | "email" | "tel";
    autoComplete?: string;
}

/** A single labelled input cell inside a FieldGroup. */
export const FieldCell = ({ label, placeholder, inputMode, autoComplete, ...props }: FieldCellProps) => (
    <AriaTextField {...props} className="group flex flex-col gap-1 px-3.5 pt-3 pb-2.5 focus-within:bg-brand-primary_alt/40">
        <AriaLabel className="text-ios-caption1 font-medium tracking-[0.04em] text-tertiary uppercase">{label}</AriaLabel>
        <AriaInput
            placeholder={placeholder}
            inputMode={inputMode}
            autoComplete={autoComplete}
            className="h-[28px] bg-transparent text-ios-body text-primary outline-none placeholder:text-placeholder"
        />
    </AriaTextField>
);
