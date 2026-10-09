import { isValidElement, type FC, type ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { cx, sortCx } from "@/utils/cx";

export const buttonStyles = sortCx({
    common: {
        root: "press-scale relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-semibold whitespace-nowrap outline-none select-none focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50",
        icon: "pointer-events-none shrink-0",
    },
    sizes: {
        sm: { root: "h-[34px] rounded-full px-3.5 text-ios-subheadline font-semibold", icon: "size-4" },
        md: { root: "h-[44px] rounded-ios-control px-4 text-ios-body font-semibold", icon: "size-5" },
        lg: { root: "h-[50px] rounded-ios-control px-5 text-ios-headline", icon: "size-5" },
    },
    colors: {
        /** Solid brand green — the one primary action on a screen. */
        filled: { root: "bg-brand-solid text-white data-[pressed]:bg-brand-solid_hover" },
        /** Soft green fill, green label — secondary actions that should still feel branded. */
        tinted: { root: "bg-brand-primary_alt text-brand-secondary data-[pressed]:bg-brand-secondary" },
        /** Neutral fill — neutral secondary actions (iOS "gray" button). */
        gray: { root: "bg-tertiary text-primary data-[pressed]:bg-quaternary" },
        /** White with a hairline border — Cancel / Back in sheet footers. */
        outline: { root: "bg-primary text-secondary ring-1 ring-primary ring-inset data-[pressed]:bg-primary_hover" },
        /** Brand outline — "Back" in multi-step sheets. */
        "outline-brand": { root: "bg-primary text-brand-secondary ring-1 ring-brand ring-inset data-[pressed]:bg-brand-primary_alt" },
        /** Text only. */
        plain: { root: "bg-transparent px-1 text-brand-secondary data-[pressed]:opacity-60" },
        /** Solid red for irreversible confirmations. */
        destructive: { root: "bg-error-solid text-white data-[pressed]:bg-error-solid_hover" },
        /** Red text only — "Delete Account". */
        "plain-destructive": { root: "bg-transparent px-1 text-error-primary data-[pressed]:opacity-60" },
        /** Black — Apple Wallet / Apple Pay style. */
        black: { root: "bg-black text-white data-[pressed]:bg-gray-800" },
    },
});

export type ButtonColor = keyof typeof buttonStyles.colors;
export type ButtonSize = keyof typeof buttonStyles.sizes;

export interface ButtonProps extends Omit<AriaButtonProps, "children" | "className"> {
    size?: ButtonSize;
    color?: ButtonColor;
    iconLeading?: FC<{ className?: string }> | ReactNode;
    iconTrailing?: FC<{ className?: string }> | ReactNode;
    /** Stretch to the container width (most iOS primary buttons). */
    fullWidth?: boolean;
    isLoading?: boolean;
    children?: ReactNode;
    className?: string;
}

const renderIcon = (Icon: ButtonProps["iconLeading"], className: string) => {
    if (!Icon) return null;
    if (isValidElement(Icon)) return Icon;
    const C = Icon as FC<{ className?: string }>;
    return <C className={className} aria-hidden="true" />;
};

export const Button = ({
    size = "lg",
    color = "filled",
    iconLeading,
    iconTrailing,
    fullWidth,
    isLoading,
    isDisabled,
    children,
    className,
    ...props
}: ButtonProps) => {
    const s = buttonStyles.sizes[size];
    const iconClass = cx(buttonStyles.common.icon, s.icon);

    return (
        <AriaButton
            {...props}
            isDisabled={isDisabled || isLoading}
            data-loading={isLoading || undefined}
            className={cx(buttonStyles.common.root, s.root, buttonStyles.colors[color].root, fullWidth && "w-full", className)}
        >
            {isLoading ? (
                <svg className={cx(iconClass, "animate-spin")} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ) : (
                renderIcon(iconLeading, iconClass)
            )}
            {children}
            {!isLoading && renderIcon(iconTrailing, iconClass)}
        </AriaButton>
    );
};
