import type { FC, ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { ChevronLeft } from "@untitledui/icons";
import { cx } from "@/utils/cx";

const base =
    "glass press-scale inline-flex h-[44px] shrink-0 cursor-pointer items-center justify-center text-primary outline-none focus-visible:ring-4 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-50";

export interface GlassIconButtonProps extends Omit<AriaButtonProps, "children" | "className"> {
    icon: FC<{ className?: string }>;
    /** Required: icon-only buttons need an accessible name. */
    "aria-label": string;
    className?: string;
}

/** Circular Liquid Glass button — close (×), add (+), nav-bar actions. */
export const GlassIconButton = ({ icon: Icon, className, ...props }: GlassIconButtonProps) => (
    <AriaButton {...props} className={cx(base, "w-[44px] rounded-full", className)}>
        <Icon className="size-[22px]" aria-hidden="true" />
    </AriaButton>
);

export interface GlassPillButtonProps extends Omit<AriaButtonProps, "children" | "className"> {
    children: ReactNode;
    icon?: FC<{ className?: string }>;
    className?: string;
}

/** Capsule Liquid Glass button — text actions in the nav bar ("Join", "Edit"). */
export const GlassPillButton = ({ children, icon: Icon, className, ...props }: GlassPillButtonProps) => (
    <AriaButton {...props} className={cx(base, "gap-1 rounded-full px-4 text-ios-body font-medium", className)}>
        {Icon && <Icon className="size-5" aria-hidden="true" />}
        {children}
    </AriaButton>
);

export interface BackButtonProps extends Omit<AriaButtonProps, "children" | "className"> {
    /** Previous screen title. Omit for a chevron-only circle (modal stacks). */
    label?: string;
    className?: string;
}

/** iOS 26 back button: a glass capsule with a chevron and the previous screen's title. */
export const BackButton = ({ label, className, ...props }: BackButtonProps) =>
    label ? (
        <AriaButton {...props} aria-label={`Back to ${label}`} className={cx(base, "gap-0.5 rounded-full pr-4 pl-2.5 text-ios-body font-medium", className)}>
            <ChevronLeft className="size-6" strokeWidth={2.4} aria-hidden="true" />
            {label}
        </AriaButton>
    ) : (
        <AriaButton {...props} aria-label="Back" className={cx(base, "w-[44px] rounded-full", className)}>
            <ChevronLeft className="size-6" strokeWidth={2.4} aria-hidden="true" />
        </AriaButton>
    );
