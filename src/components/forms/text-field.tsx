import { useState, type FC, type ReactNode } from "react";
import {
    Button as AriaButton,
    FieldError as AriaFieldError,
    Input as AriaInput,
    Label as AriaLabel,
    Text as AriaText,
    TextField as AriaTextField,
    type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import { Eye, EyeOff } from "@untitledui/icons";
import { cx } from "@/utils/cx";

export interface TextFieldProps extends Omit<AriaTextFieldProps, "children" | "className"> {
    label?: string;
    placeholder?: string;
    hint?: ReactNode;
    /** Shown when isInvalid. */
    errorMessage?: string;
    icon?: FC<{ className?: string }>;
    /** Trailing element inside the field — unit, clear button. */
    trailing?: ReactNode;
    /** Adds a show/hide toggle. Use with type="password". */
    revealable?: boolean;
    className?: string;
}

/**
 * TextField — label above a white rounded field with an optional leading icon.
 * Matches Crane's Edit Profile fields. Built on React Aria TextField.
 */
export const TextField = ({ label, placeholder, hint, errorMessage, icon: Icon, trailing, revealable, type, className, ...props }: TextFieldProps) => {
    const [revealed, setRevealed] = useState(false);
    const inputType = revealable ? (revealed ? "text" : "password") : type;

    return (
        <AriaTextField {...props} type={inputType} className={cx("group flex flex-col gap-1.5", className)}>
            {label && (
                <AriaLabel className="px-0.5 text-ios-subheadline font-medium text-secondary">
                    {label}
                    {props.isRequired && <span className="text-error-primary"> *</span>}
                </AriaLabel>
            )}
            <div
                className={cx(
                    "flex h-[50px] items-center gap-2.5 rounded-ios-control bg-primary px-3.5 ring-1 ring-primary transition duration-100 ease-linear ring-inset",
                    "group-focus-within:ring-2 group-focus-within:ring-brand",
                    "group-data-[invalid]:ring-error_subtle group-data-[invalid]:group-focus-within:ring-error",
                    "group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50",
                )}
            >
                {Icon && <Icon className="size-5 shrink-0 text-fg-quaternary" aria-hidden="true" />}
                <AriaInput
                    placeholder={placeholder}
                    className="h-full min-w-0 flex-1 bg-transparent text-ios-body text-primary outline-none placeholder:text-placeholder disabled:cursor-not-allowed"
                />
                {revealable && (
                    <AriaButton
                        aria-label={revealed ? "Hide password" : "Show password"}
                        onPress={() => setRevealed((r) => !r)}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-full text-fg-quaternary outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                        {revealed ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </AriaButton>
                )}
                {trailing}
            </div>
            {hint && (
                <AriaText slot="description" className="px-0.5 text-ios-footnote text-tertiary">
                    {hint}
                </AriaText>
            )}
            <AriaFieldError className="px-0.5 text-ios-footnote text-error-primary">{errorMessage}</AriaFieldError>
        </AriaTextField>
    );
};
